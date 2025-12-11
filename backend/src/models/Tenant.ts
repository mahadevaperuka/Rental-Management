import mongoose, { Schema, Document } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { z } from 'zod';

export const TenantZod = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    dob: z.date().optional(),
    ssn: z.string().optional(),
    income: z.number().optional(),
    jobTitle: z.string().optional(),
    jobType: z.string().optional(),
    presentAddress: z.object({
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional()
    }).optional(),
    current_apartment_id: z.instanceof(mongoose.Types.ObjectId).optional(),
    lease_id: z.instanceof(mongoose.Types.ObjectId).optional(),
    joined_date: z.date().default(() => new Date()),
});

export type Tenant = z.infer<typeof TenantZod> & Document;

const TenantSchema = new Schema<Tenant>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date },
    ssn: { type: String }, // Stored as plain text per requirements
    income: { type: Number },
    jobTitle: { type: String },
    jobType: { type: String },
    presentAddress: {
        city: { type: String },
        state: { type: String },
        zip: { type: String }
    },
    current_apartment_id: { type: Schema.Types.ObjectId, ref: 'Unit' },
    lease_id: { type: Schema.Types.ObjectId, ref: 'Lease' },
    joined_date: { type: Date, default: Date.now },
});

export const TenantModel = mongoose.model<Tenant>('Tenant', TenantSchema);

export const TenantTC = composeWithMongoose(TenantModel);
