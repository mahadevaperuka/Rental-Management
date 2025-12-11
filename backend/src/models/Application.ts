import mongoose, { Schema, Document } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { z } from 'zod';

export const ApplicationZod = z.object({
    apartment_id: z.instanceof(mongoose.Types.ObjectId),
    applicant_name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    date_applied: z.date().default(() => new Date()),
    move_in_date: z.date().optional(),
    move_out_date: z.date().optional(),
    status: z.enum(['Pending', 'Approved', 'Rejected']),
    documents: z.array(z.string()),
});

export type Application = z.infer<typeof ApplicationZod> & Document;

const ApplicationSchema = new Schema<Application>({
    apartment_id: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
    applicant_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date_applied: { type: Date, default: Date.now },
    move_in_date: { type: Date },
    move_out_date: { type: Date },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    documents: [{ type: String }],
});

export const ApplicationModel = mongoose.model<Application>('Application', ApplicationSchema);

export const ApplicationTC = composeWithMongoose(ApplicationModel);
