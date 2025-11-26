import mongoose, { Schema, Document } from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { z } from 'zod';

export const MaintenanceZod = z.object({
    tenant_id: z.instanceof(mongoose.Types.ObjectId),
    apartment_id: z.instanceof(mongoose.Types.ObjectId),
    issue_description: z.string(),
    priority: z.enum(['Low', 'Medium', 'High', 'Emergency']),
    status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']),
    reported_date: z.date().default(() => new Date()),
    resolved_date: z.date().optional(),
    images: z.array(z.string()),
});

export type Maintenance = z.infer<typeof MaintenanceZod> & Document;

const MaintenanceSchema = new Schema<Maintenance>({
    tenant_id: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    apartment_id: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
    issue_description: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Emergency'], default: 'Medium' },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    reported_date: { type: Date, default: Date.now },
    resolved_date: { type: Date },
    images: [{ type: String }],
});

export const MaintenanceModel = mongoose.model<Maintenance>('Maintenance', MaintenanceSchema);

export const MaintenanceTC = composeWithMongoose(MaintenanceModel);
