import { schemaComposer } from 'graphql-compose';
import { ApplicationModel } from '../models/Application.js';
import { TenantModel } from '../models/Tenant.js';
import { LeaseModel } from '../models/Lease.js';
import { UnitModel } from '../models/Unit.js';
import { UserModel } from '../models/User.js';
import { ApplicationTC } from '../models/Application.js';
import { LeaseTC } from '../models/Lease.js';

export const acceptApplicationResolver = schemaComposer.createResolver({
    name: 'acceptApplication',
    kind: 'mutation',
    type: LeaseTC,
    args: {
        application_id: 'MongoID!',
        start_date: 'Date!',
        end_date: 'Date!',
        monthly_rent: 'Float!',
        security_deposit: 'Float!',
    },
    resolve: async ({ args }) => {
        const { application_id, start_date, end_date, monthly_rent, security_deposit } = args;

        // 1. Find the Application
        const application = await ApplicationModel.findById(application_id);
        if (!application) {
            throw new Error('Application not found');
        }
        if (application.status !== 'Pending') {
            throw new Error('Application is not in Pending status');
        }

        // 2. Find or Create Tenant
        let tenant = await TenantModel.findOne({ email: application.email });
        if (!tenant) {
            tenant = await TenantModel.create({
                name: application.applicant_name,
                email: application.email,
                phone: application.phone,
                joined_date: new Date(),
            });
        } else {
            // Check for existing active lease in the SAME community with overlapping dates
            const newUnit = await UnitModel.findById(application.apartment_id);
            if (!newUnit) throw new Error("Unit not found");
            const newCommunityId = newUnit.community_id;

            // Find all active leases for this tenant
            const activeLeases = await LeaseModel.find({
                tenant_id: tenant._id,
                status: 'Active'
            });

            for (const lease of activeLeases) {
                // Get unit for existing lease to check community
                const leaseUnit = await UnitModel.findById(lease.apartment_id);
                if (leaseUnit && leaseUnit.community_id?.toString() === newCommunityId?.toString()) {
                    // Check for Date Overlap
                    // Overlap logic: (StartA <= EndB) and (EndA >= StartB)
                    const newStart = new Date(start_date as string).getTime();
                    const newEnd = new Date(end_date as string).getTime();
                    const existingStart = new Date(lease.start_date).getTime();
                    const existingEnd = new Date(lease.end_date).getTime();

                    if (newStart <= existingEnd && newEnd >= existingStart) {
                        throw new Error(`Tenant already has an active lease in this community for these dates (Unit ${leaseUnit.apartment_no}).`);
                    }
                }
            }
        }

        // 3. Create Lease
        const lease = await LeaseModel.create({
            tenant_id: tenant._id,
            apartment_id: application.apartment_id,
            start_date,
            end_date,
            monthly_rent,
            security_deposit,
            status: 'Active',
        });

        // 4. Update Application Status
        application.status = 'Approved';
        await application.save();

        // 5. Update Tenant (link lease and current apartment)
        tenant.lease_id = lease._id as any;
        tenant.current_apartment_id = application.apartment_id as any;
        await tenant.save();

        // 6. Update Unit Status
        await UnitModel.findByIdAndUpdate(application.apartment_id, { status: 'Occupied' });

        // 7. Link User to Tenant (if user exists)
        const user = await UserModel.findOne({ email: application.email });
        if (user) {
            user.linked_id = tenant._id as any;
            user.role = 'Tenant'; // Ensure they have Tenant role
            await user.save();
        }

        return lease;
    },
});
