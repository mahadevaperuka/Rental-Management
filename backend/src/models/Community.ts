import mongoose, { Schema, Document } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { z } from 'zod';

export const CommunityZod = z.object({
    name: z.string(),
    location: z.string(),
    manager: z.object({
        manager_id: z.instanceof(mongoose.Types.ObjectId),
        name: z.string(),
        email: z.string().email(),
        phone: z.string(),
    }),
    images: z.array(z.string()),
});

export type Community = z.infer<typeof CommunityZod> & Document;

const CommunitySchema = new Schema<Community>({
    name: { type: String, required: true },
    location: { type: String, required: true },
    manager: {
        manager_id: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
    },
    images: [{ type: String }],
});

export const CommunityModel = mongoose.model<Community>('Community', CommunitySchema);

export const CommunityTC = composeWithMongoose(CommunityModel);
