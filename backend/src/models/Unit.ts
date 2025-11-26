import mongoose, { Schema, Document } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { z } from 'zod';

export const UnitZod = z.object({
    community_id: z.instanceof(mongoose.Types.ObjectId),
    apartment_no: z.string(),
    floor: z.number(),
    bedrooms: z.number(),
    bathrooms: z.number(),
    rent: z.number(),
    status: z.enum(['Available', 'Occupied', 'Maintenance']),
    images: z.array(z.string()),
});

export type Unit = z.infer<typeof UnitZod> & Document;

const UnitSchema = new Schema<Unit>({
    community_id: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    apartment_no: { type: String, required: true },
    floor: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    rent: { type: Number, required: true },
    status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' },
    images: [{ type: String }],
});

export const UnitModel = mongoose.model<Unit>('Unit', UnitSchema);

export const UnitTC = composeWithMongoose(UnitModel);
