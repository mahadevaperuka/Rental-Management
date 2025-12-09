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
        this.next_payment_date = this.start_date;
    }
    next();
});

export const LeaseModel = mongoose.model<Lease>('Lease', LeaseSchema);

export const LeaseTC = composeWithMongoose(LeaseModel);
