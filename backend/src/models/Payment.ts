import mongoose, { Schema, Document } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { z } from 'zod';

export const PaymentZod = z.object({
    tenant_id: z.instanceof(mongoose.Types.ObjectId),
    lease_id: z.instanceof(mongoose.Types.ObjectId),
    payment_date: z.date().default(() => new Date()),
    amount: z.number(),
    status: z.enum(['Paid', 'Pending', 'Failed']),
    payment_method: z.string(),
    transaction_id: z.string(),
    receipt_url: z.string().optional(),
});

export type Payment = z.infer<typeof PaymentZod> & Document;

const PaymentSchema = new Schema<Payment>({
    tenant_id: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    lease_id: { type: Schema.Types.ObjectId, ref: 'Lease', required: true },
    payment_date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Pending' },
    payment_method: { type: String, required: true },
    transaction_id: { type: String, required: true },
    receipt_url: { type: String },
});

// Update Lease next_payment_date when a payment is made
PaymentSchema.post('save', async function (doc) {
    if (doc.status === 'Paid') {
        const LeaseModel = mongoose.model('Lease');
        const lease = await LeaseModel.findById(doc.lease_id);
        if (lease) {
            // Calculate next due date: Add 1 month to the EXISTING next_payment_date
            // If next_payment_date is missing (shouldn't be), fallback to payment_date + 1 month
            const baseDate = lease.next_payment_date ? new Date(lease.next_payment_date) : new Date(doc.payment_date);

            // Create new date object to avoid mutating if it's a ref
            const nextDue = new Date(baseDate);
            nextDue.setMonth(nextDue.getMonth() + 1);

            console.log(`[Payment] Updating lease ${lease._id} next_payment_date from ${lease.next_payment_date} to ${nextDue}`);
            lease.next_payment_date = nextDue;
            await lease.save();
        }
    }
});

export const PaymentModel = mongoose.model<Payment>('Payment', PaymentSchema);

export const PaymentTC = composeWithMongoose(PaymentModel);
