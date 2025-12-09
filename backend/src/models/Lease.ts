import mongoose, { Schema, Document } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { z } from 'zod';

export const LeaseZod = z.object({
    tenant_id: z.instanceof(mongoose.Types.ObjectId),
    apartment_id: z.instanceof(mongoose.Types.ObjectId),
    start_date: z.date(),
    end_date: z.date(),
    monthly_rent: z.number(),
    security_deposit: z.number(),
    status: z.enum(['Active', 'Terminated', 'Expired']),
    documents_urls: z.array(z.string()),
    next_payment_date: z.date().optional(),
});

export type Lease = z.infer<typeof LeaseZod> & Document;

const LeaseSchema = new Schema<Lease>({
    tenant_id: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    apartment_id: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    monthly_rent: { type: Number, required: true },
    security_deposit: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Terminated', 'Expired'], default: 'Active' },
    documents_urls: [{ type: String }],
    next_payment_date: { type: Date },
});

// Initialize next_payment_date to start_date for new leases
LeaseSchema.pre('save', function (next) {
    if (this.isNew && !this.next_payment_date) {
        console.log(`[Lease] Initializing next_payment_date for new lease ${this._id} to ${this.start_date}`);
        this.next_payment_date = this.start_date;
    }
    next();
});

// Update Unit status and User role when Lease is Terminated/Expired
LeaseSchema.post('save', async function (doc) {
    if (doc.status === 'Terminated' || doc.status === 'Expired') {
        console.log(`[Lease] Lease ${doc._id} terminated/expired. Updating Unit and User.`);

        // 1. Update Unit to Available
        const UnitModel = mongoose.model('Unit');
        await UnitModel.findByIdAndUpdate(doc.apartment_id, { status: 'Available' });
        console.log(`[Lease] Unit ${doc.apartment_id} marked as Available.`);

        // 2. Check for other active leases for this tenant
        const LeaseModel = mongoose.model('Lease');
        const activeLeasesCount = await LeaseModel.countDocuments({
            tenant_id: doc.tenant_id,
            status: 'Active',
            _id: { $ne: doc._id } // Exclude current lease (though it's already saved as Terminated, safety check)
        });

        if (activeLeasesCount === 0) {
            // 3. Revert User role to Guest
            const UserModel = mongoose.model('User');
            // User linked_id points to Tenant _id
            const user = await UserModel.findOneAndUpdate(
                { linked_id: doc.tenant_id },
                { role: 'Guest' },
                { new: true }
            );
            if (user) {
                console.log(`[Lease] User ${user._id} role reverted to Guest as no active leases remain.`);
            } else {
                console.log(`[Lease] Warning: Linked User not found for tenant ${doc.tenant_id}`);
            }
        } else {
            console.log(`[Lease] Tenant ${doc.tenant_id} still has ${activeLeasesCount} active leases. Role remains Tenant.`);
        }
    }
});

export const LeaseModel = mongoose.model<Lease>('Lease', LeaseSchema);

export const LeaseTC = composeWithMongoose(LeaseModel);
