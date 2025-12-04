import mongoose, { Schema, Document } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { z } from 'zod';

export const UserZod = z.object({
    name: z.string(),
    email: z.email(),
    emailVerified: z.boolean().default(false),
    image: z.string().optional(),
    role: z.enum(['Admin', 'Tenant', 'Manager', 'Guest']).default('Guest'),
    linked_id: z.instanceof(mongoose.Types.ObjectId).optional(),
    is_temp_password: z.boolean().default(false),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
    last_login: z.date().optional(),
});

export type User = z.infer<typeof UserZod> & Document;

const UserSchema = new Schema<User>({
    // _id is automatically ObjectId by default in Mongoose
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // password field removed as it is stored in 'account' collection by better-auth
    emailVerified: { type: Boolean, default: false },
    image: { type: String },
    role: { type: String, enum: ['Admin', 'Tenant', 'Manager', 'Guest'], default: 'Guest' },
    linked_id: { type: Schema.Types.ObjectId },
    is_temp_password: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    last_login: { type: Date },
});

export const UserModel = mongoose.model<User>('User', UserSchema, 'users');

export const UserTC = composeWithMongoose(UserModel);
