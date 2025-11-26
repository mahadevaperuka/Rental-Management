import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

export const AdminZod = z.object({
    name: z.string(),
    email: z.string().email(),
    role: z.string().default('SuperAdmin'),
});

export type Admin = z.infer<typeof AdminZod> & Document;

const AdminSchema = new Schema<Admin>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'SuperAdmin' },
});

export const AdminModel = mongoose.model<Admin>('Admin', AdminSchema);

import { composeWithMongoose } from 'graphql-compose-mongoose';
export const AdminTC = composeWithMongoose(AdminModel);
