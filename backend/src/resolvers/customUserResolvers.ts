import { schemaComposer } from 'graphql-compose';
import { UserTC } from '../models/User.js';
import { CommunityTC } from '../models/Community.js';
import { auth } from '../auth.js';

import { TenantModel } from '../models/Tenant.js';
import { ManagerModel } from '../models/Manager.js';
import { UserModel } from '../models/User.js';
import { LeaseModel } from '../models/Lease.js';
import { UnitModel } from '../models/Unit.js';
import { CommunityModel } from '../models/Community.js';

export const createUserAccountResolver = schemaComposer.createResolver({
    name: 'createUserAccount',
    type: UserTC,
    args: {
        name: 'String!',
        email: 'String!',
        password: 'String!',
        role: 'String!',
        image: 'String',
        phone: 'String',
        // Tenant specific args
        dob: 'Date',
        ssn: 'String',
        income: 'Float',
        jobTitle: 'String',
        jobType: 'String',
        city: 'String',
        state: 'String',
        zip: 'String',
    },
    resolve: async ({ args, context }: { args: any; context: any }) => {
        const { name, email, role, image, phone, dob, ssn, income, jobTitle, jobType, city, state, zip } = args;
        let { password } = args;
        let is_temp_password = false;

        // Role validation: only Admins can create Admin/Manager accounts
        const callerRole = context.session?.user?.role;
        if ((role === 'Admin' || role === 'Manager') && callerRole !== 'Admin') {
            throw new Error('Only administrators can create Admin or Manager accounts.');
        }
        // Public registration can only create Guest accounts
        if (!callerRole && role !== 'Guest') {
            throw new Error('Self-registration is limited to Guest accounts.');
        }

        // For Admin and Manager, enforce temporary password
        if (role === 'Admin' || role === 'Manager') {
            password = process.env.DEFAULT_TEMP_PASSWORD;
            is_temp_password = true;
        }

        try {
            // 1. Create the User account first
            const response = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name,
                    role,
                    image,
                    is_temp_password
                },
                asResponse: false
            });

            if (!response || !response.user) {
                throw new Error("Failed to create user");
            }

            // 2. Create associated profile based on role
            let profileId;
            // Create Tenant profile for both Tenant and Guest roles (Guest needs profile for future applications)
            if (role === 'Tenant' || role === 'Guest') {
                const tenant = await TenantModel.create({
                    name,
                    email,
                    phone: phone || "", // Phone is required for Tenant
                    dob,
                    ssn,
                    income,
                    jobTitle,
                    jobType,
                    presentAddress: {
                        city: city || "",
                        state: state || "",
                        zip: zip || ""
                    },
                    joined_date: new Date()
                });
                profileId = tenant._id;
            } else if (role === 'Manager') {
                const manager = await ManagerModel.create({
                    name,
                    email,
                    phone: phone || "",
                    // Manager might need community assignment later
                });
                profileId = manager._id;
            }

            // 3. Link profile to user
            if (profileId) {
                await UserModel.findByIdAndUpdate(response.user.id, { linked_id: profileId });
            }

            return {
                ...response.user,
                _id: response.user.id,
                linked_id: profileId
            };
        } catch (error: any) {
            console.error("Error creating user:", error);
            throw new Error(error.message || "Failed to create user");
        }
    },
});

export const updateUserAccountResolver = schemaComposer.createResolver({
    name: 'updateUserAccount',
    type: UserTC,
    args: {
        _id: 'MongoID!',
        name: 'String',
        email: 'String',
        role: 'String',
        image: 'String',
    },
    resolve: async ({ args }: { args: any }) => {
        const { _id, name, email, role, image } = args;

        try {
            const user = await UserModel.findById(_id);
            if (!user) throw new Error("User not found");

            const oldRole = user.role;
            const oldEmail = user.email;
            const oldName = user.name;

            // Update User
            user.name = name || user.name;
            user.email = email || user.email;
            user.role = role || user.role;
            if (image) user.image = image;
            await user.save();

            // Handle Role Change
            if (role && role !== oldRole) {
                // Remove from old role table
                if (oldRole === 'Manager') {
                    await ManagerModel.findOneAndDelete({ email: oldEmail });
                } else if (oldRole === 'Tenant') {
                    await TenantModel.findOneAndDelete({ email: oldEmail });
                }

                // Add to new role table
                if (role === 'Manager') {
                    // Check if already exists (in case of re-role)
                    const exists = await ManagerModel.findOne({ email: user.email });
                    if (!exists) {
                        await ManagerModel.create({
                            name: user.name,
                            email: user.email,
                            phone: "", // Phone might be missing, user needs to update profile
                        });
                    }
                } else if (role === 'Tenant') {
                    const exists = await TenantModel.findOne({ email: user.email });
                    if (!exists) {
                        await TenantModel.create({
                            name: user.name,
                            email: user.email,
                            phone: "",
                            joined_date: new Date()
                        });
                    }
                }
            } else if ((email && email !== oldEmail) || (name && name !== oldName)) {
                // Sync updates to profile if email/name changed but role didn't
                if (user.role === 'Manager') {
                    await ManagerModel.findOneAndUpdate({ email: oldEmail }, { name: user.name, email: user.email });
                } else if (user.role === 'Tenant') {
                    await TenantModel.findOneAndUpdate({ email: oldEmail }, { name: user.name, email: user.email });
                }
            }

            return user;
        } catch (error: any) {
            console.error("Error updating user account:", error);
            throw new Error(error.message || "Failed to update user account");
        }
    }
});

export const deleteUserAccountResolver = schemaComposer.createResolver({
    name: 'deleteUserAccount',
    type: UserTC,
    args: {
        _id: 'MongoID!',
    },
    resolve: async ({ args }: { args: any }) => {
        const { _id } = args;
        try {
            // console.log({ _id })
            const user = await UserModel.findOne({ _id });
            if (!user) throw new Error("User not found");

            const { name, email, role, linked_id } = user;
            // console.log({ name, email, role })

            if (role === 'Tenant') {
                const tenantId = linked_id;

                const activeLeases = await LeaseModel.find({
                    tenant_id: tenantId,
                    status: 'Active'
                }).populate('apartment_id');

                if (activeLeases.length > 0) {
                    // const leaseDetails = activeLeases.map((lease: any) => {
                    //     return `Unit ${lease.apartment_id?.apartment_no}`;
                    // }).join(", ");

                    const details = [];
                    for (const lease of activeLeases) {
                        const unit = await UnitModel.findById(lease.apartment_id).populate('community_id');
                        const communityName = (unit?.community_id as any)?.name || 'Unknown Community';
                        const unitNo = unit?.apartment_no || 'Unknown Unit';
                        details.push(`Unit ${unitNo} in ${communityName}`);
                    }

                    throw new Error(`Active lease(s) exist: ${details.join(', ')}. Please terminate them before modifying the tenant.`);
                }
                // 2. Safe Demotion (No Active Leases)
                const tenant = await TenantModel.findById(tenantId);
                if (tenant?.current_apartment_id) {
                    await UnitModel.findByIdAndUpdate(tenant.current_apartment_id, { status: 'Available' });
                }
                // Update Tenant Profile - Clear associations
                await TenantModel.findByIdAndUpdate(tenantId, {
                    current_apartment_id: null,
                    lease_id: null
                });

                // Update User Role to Guest
                user.role = 'Guest';
                // user.linked_id remains set to tenantId
                await user.save();

                return user;

            } else {
                if (role === 'Manager') {
                    // Check if manager is assigned to any community
                    const managingCommunities = await CommunityModel.find({ 'manager.manager_id': linked_id });

                    if (managingCommunities.length > 0) {
                        const communityNames = managingCommunities.map(c => c.name).join(', ');
                        throw new Error(`${name} is assigned to community: ${communityNames}. Please assign other Manager to the community before deleting.`);
                    }

                    // Safe to delete if not managing any community
                    await ManagerModel.findOneAndDelete({ email });
                    await UserModel.findOneAndDelete({ _id });
                } else if (role === 'Guest') {
                    await UserModel.findOneAndDelete({ _id });
                }

                return user;
            }
        } catch (error: any) {
            console.error("Error deleting user account:", error);
            throw new Error(error.message || "Failed to delete user account");
        }
    }
});

export const completeTempPasswordResolver = schemaComposer.createResolver({
    name: 'completeTempPassword',
    type: UserTC,
    args: {},
    resolve: async ({ context }: { context: any }) => {
        const email = context.session?.user?.email;
        if (!email) throw new Error("Unauthorized");
        try {

            const user = await UserModel.findOne({ email });
            if (!user) throw new Error("User not found");

            user.is_temp_password = false;
            await user.save();

            return user;
        } catch (error: any) {
            throw new Error(error.message || "Failed to update user");
        }
    }
});

export const deleteCommunityResolver = schemaComposer.createResolver({
    name: 'deleteCommunity',
    type: CommunityTC,
    args: {
        _id: 'MongoID!',
    },
    resolve: async ({ args }: { args: any }) => {
        const { _id } = args;
        try {
            // Check for units in this community
            const units = await UnitModel.find({ community_id: _id });

            if (units.length > 0) {
                const unitIds = units.map(u => u._id);

                // Check for active leases in these units
                const activeLeases = await LeaseModel.find({
                    apartment_id: { $in: unitIds },
                    status: { $in: ['Active', 'Pending'] }
                });

                if (activeLeases.length > 0) {
                    throw new Error(`Cannot delete community. There are ${activeLeases.length} active lease(s) associated with units in this community.`);
                }



                // Safe to delete units as they are vacant/free
                await UnitModel.deleteMany({ community_id: _id });
            }

            const community = await CommunityModel.findByIdAndDelete(_id);
            return community;

        } catch (error: any) {
            console.error("Error deleting community:", error);
            throw new Error(error.message || "Failed to delete community");
        }
    }
});
