import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

export const ManagerZod = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
});

export type Manager = z.infer<typeof ManagerZod> & Document;

const ManagerSchema = new Schema<Manager>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
});

export const ManagerModel = mongoose.model<Manager>('Manager', ManagerSchema);

import { composeWithMongoose } from 'graphql-compose-mongoose';
export const ManagerTC = composeWithMongoose(ManagerModel);
