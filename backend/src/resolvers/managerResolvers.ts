import { Resolver, ObjectTypeComposer } from 'graphql-compose';
import { ManagerModel } from '../models/Manager.js';
import { CommunityModel } from '../models/Community.js';
import { UnitModel } from '../models/Unit.js';

type ResolverMiddleware = (
    resolve: (source: any, args: any, context: any, info: any) => any,
    source: any,
    args: any,
    context: any,
    info: any
) => any;

export const filterByManager: ResolverMiddleware = async (resolve, source, args, context, info) => {
    const user = context.session?.user;

    // Only apply filter if user is a Manager
    if (user?.role === 'Manager') {
        try {
            // 1. Find the Manager profile
            const manager = await ManagerModel.findOne({ email: user.email });
            if (!manager) {
                return [];
            }

            // 2. Find the Community managed by this Manager
            const community = await CommunityModel.findOne({ "manager.manager_id": manager._id });
            if (!community) {
                return [];
            }

            // 3. Find all Units in this Community
            const units = await UnitModel.find({ community_id: community._id });
            const unitIds = units.map(u => u._id);

            // 4. Apply filter based on the type being queried
            if (!args.filter) {
                args.filter = {};
            }

            // Determine which field to filter on based on the return type or info
            // We can check info.returnType or just infer from usage
            // Since this middleware is applied to specific resolvers, we can check the field name or just try both

            // For Application and Maintenance
            if (info.fieldName === 'applicationMany' || info.fieldName === 'maintenanceMany') {
                args.filter.apartment_id = { $in: unitIds };
            }
            // For Tenant
            else if (info.fieldName === 'tenantMany') {
                args.filter.current_apartment_id = { $in: unitIds };
            }

        } catch (error) {
            console.error("Error in filterByManager middleware:", error);
            return [];
        }
    }

    return resolve(source, args, context, info);
};
