import { Resolver, ObjectTypeComposer } from 'graphql-compose';
import { ManagerModel } from '../models/Manager.js';
import { CommunityModel } from '../models/Community.js';
import { UnitModel } from '../models/Unit.js';
import { LeaseModel } from '../models/Lease.js';

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

            // For Application and Maintenance
            if (info.fieldName === 'applicationMany' || info.fieldName === 'maintenanceMany') {
                args.filter.apartment_id = { $in: unitIds };
            }
            // For Tenant - Find tenants who have a lease in one of these units
            else if (info.fieldName === 'tenantMany') {
                // Find all leases for these units
                const leases = await LeaseModel.find({
                    apartment_id: { $in: unitIds },
                    status: { $in: ['Active', 'Terminated', 'Expired'] }
                });
                const tenantIds = leases.map(l => l.tenant_id);

                // Filter tenants by ID
                args.filter._id = { $in: tenantIds };
            }

        } catch (error) {
            console.error("Error in filterByManager middleware:", error);
            return [];
        }
    }

    return resolve(source, args, context, info);
};
