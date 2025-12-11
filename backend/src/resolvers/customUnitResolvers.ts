import { schemaComposer } from 'graphql-compose';
import { UnitTC, UnitModel } from '../models/Unit.js';
import { LeaseModel } from '../models/Lease.js';

export const getAvailableUnitsResolver = schemaComposer.createResolver({
    name: 'getAvailableUnits',
    type: [UnitTC],
    args: {
        startDate: 'Date!',
        endDate: 'Date!',
        communityId: 'ID', // Optional filter
    },
    resolve: async ({ args }: { args: any }) => {
        const { startDate, endDate, communityId } = args;
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            throw new Error("Start date must be before end date");
        }

        // 1. Find all units (optionally filtered by community)
        const unitQuery: any = {};
        if (communityId) {
            unitQuery.community_id = communityId;
        }

        // We might want to filter out "Maintenance" units regardless of leases
        // unitQuery.status = { $ne: 'Maintenance' }; 

        const allUnits = await UnitModel.find(unitQuery);

        // 2. Find all leases that overlap with the requested period
        // Overlap condition: Lease.start < Request.end && Lease.end > Request.start
        const overlappingLeases = await LeaseModel.find({
            status: 'Active',
            start_date: { $lt: end },
            end_date: { $gt: start }
        }).select('apartment_id');

        const occupiedUnitIds = new Set(overlappingLeases.map(l => l.apartment_id.toString()));

        // 3. Filter units
        const availableUnits = allUnits.filter(unit => !occupiedUnitIds.has(unit._id.toString()));

        return availableUnits;
    }
});
