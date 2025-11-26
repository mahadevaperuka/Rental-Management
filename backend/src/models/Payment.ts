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

export const PaymentModel = mongoose.model<Payment>('Payment', PaymentSchema);

export const PaymentTC = composeWithMongoose(PaymentModel);
