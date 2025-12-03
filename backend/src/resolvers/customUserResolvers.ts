import { schemaComposer } from 'graphql-compose';
import { UserTC } from '../models/User.js';
import { auth } from '../auth.js';

import { TenantModel } from '../models/Tenant.js';
import { ManagerModel } from '../models/Manager.js';
import { UserModel } from '../models/User.js';

export const createUserAccountResolver = schemaComposer.createResolver({
    name: 'createUserAccount',
    type: UserTC,
    args: {
        name: 'String!',
        email: 'String!',
        password: 'String!',
        role: 'String!',
        image: 'String',
        phone: 'String', // Optional, for Tenant/Manager
    },
    resolve: async ({ args }: { args: any }) => {
        const { name, email, role, image, phone } = args;
        let { password } = args;
        let is_temp_password = false;

        // For Admin and Manager, enforce temporary password
        if (role === 'Admin' || role === 'Manager') {
            password = "temporary";
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
            if (role === 'Tenant') {
                const tenant = await TenantModel.create({
                    name,
                    email,
                    phone: phone || "", // Phone is required for Tenant
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
            const user = await UserModel.findById(_id);
            if (!user) throw new Error("User not found");

            const { email, role } = user;

            // Delete User
            await UserModel.findByIdAndDelete(_id);

            // Delete Profile
            if (role === 'Manager') {
                await ManagerModel.findOneAndDelete({ email });
            } else if (role === 'Tenant') {
                await TenantModel.findOneAndDelete({ email });
            }

            return user;
        } catch (error: any) {
            console.error("Error deleting user account:", error);
            throw new Error(error.message || "Failed to delete user account");
        }
    }
});

export const completeTempPasswordResolver = schemaComposer.createResolver({
    name: 'completeTempPassword',
    type: UserTC,
    args: {
        email: 'String!',
    },
    resolve: async ({ args }: { args: any }) => {
        const { email } = args;
        try {
            // We can use Mongoose directly to update the user in 'users' collection
            // Since better-auth uses 'users' collection and we don't have a direct model for it (UserTC maps to 'User' model which maps to 'users' collection? Yes)
            // backend/src/models/User.ts: export const UserModel = mongoose.model<User>('User', UserSchema, 'users');
            // So UserModel maps to 'users' collection.

            const user = await UserModel.findOne({ email });
            if (!user) throw new Error("User not found");

            user.is_temp_password = false;
            await user.save();

            return user;
        } catch (error: any) {
            console.error("Error completing temp password:", error);
            throw new Error(error.message || "Failed to update user");
        }
    }
});
