import { SchemaComposer } from 'graphql-compose';
import { UserTC } from './models/User.js';
import { CommunityTC } from './models/Community.js';
import { UnitTC } from './models/Unit.js';
import { ApplicationTC } from './models/Application.js';
import { TenantTC } from './models/Tenant.js';
import { LeaseTC } from './models/Lease.js';
import { PaymentTC } from './models/Payment.js';
import { MaintenanceTC } from './models/Maintenance.js';
import { AdminTC } from './models/Admin.js';
import { ManagerTC } from './models/Manager.js';
import { createUserAccountResolver, updateUserAccountResolver, completeTempPasswordResolver, deleteUserAccountResolver, deleteCommunityResolver, createGuestProfileResolver } from './resolvers/customUserResolvers.js';
import { acceptApplicationResolver } from './resolvers/customApplicationResolvers.js';
import { swapCommunityManagersResolver } from './resolvers/communityResolvers.js';
import { getAvailableUnitsResolver } from './resolvers/customUnitResolvers.js';
import { filterByManager } from './resolvers/managerResolvers.js';
import { chatResolver } from './resolvers/chatResolvers.js';
import './relations.js';
import { authGuard } from './middleware/authMiddleware.js';
import { requireRole } from './middleware/rbacMiddleware.js';

const schemaComposer = new SchemaComposer();

// User Queries — Admin only
schemaComposer.Query.addFields({
  userById: UserTC.getResolver('findById').withMiddlewares([requireRole('Admin')]),
  userByIds: UserTC.getResolver('findByIds').withMiddlewares([requireRole('Admin')]),
  userOne: UserTC.getResolver('findOne').withMiddlewares([requireRole('Admin')]),
  userMany: UserTC.getResolver('findMany').withMiddlewares([requireRole('Admin')]),
  userCount: UserTC.getResolver('count').withMiddlewares([requireRole('Admin')]),
  userConnection: UserTC.getResolver('connection').withMiddlewares([requireRole('Admin')]),
  userPagination: UserTC.getResolver('pagination').withMiddlewares([requireRole('Admin')]),
});

// Community Queries — Any authenticated user can read communities
schemaComposer.Query.addFields({
  communityById: CommunityTC.getResolver('findById'),
  communityMany: CommunityTC.getResolver('findMany'),
  communityCount: CommunityTC.getResolver('count'),
});

// Unit Queries — Any authenticated user can view units
schemaComposer.Query.addFields({
  unitById: UnitTC.getResolver('findById'),
  unitMany: UnitTC.getResolver('findMany'),
  unitCount: UnitTC.getResolver('count'),
  getAvailableUnits: getAvailableUnitsResolver,
});

// Application Queries — Admin + Manager (filterByManager handles scoping for managers)
schemaComposer.Query.addFields({
  applicationById: ApplicationTC.getResolver('findById').withMiddlewares([requireRole('Admin', 'Manager')]),
  applicationMany: ApplicationTC.getResolver('findMany').withMiddlewares([requireRole('Admin', 'Manager', 'Tenant', 'Guest'), filterByManager]),
});

// Tenant Queries — Admin + Manager
schemaComposer.Query.addFields({
  tenantById: TenantTC.getResolver('findById').withMiddlewares([requireRole('Admin', 'Manager')]),
  tenantMany: TenantTC.getResolver('findMany').withMiddlewares([requireRole('Admin', 'Manager'), filterByManager]),
  tenantCount: TenantTC.getResolver('count').withMiddlewares([requireRole('Admin', 'Manager')]),
});

// Lease Queries — Admin + Manager + Tenant (tenants query their own leases via filter)
schemaComposer.Query.addFields({
  leaseById: LeaseTC.getResolver('findById').withMiddlewares([requireRole('Admin', 'Manager', 'Tenant', 'Guest')]),
  leaseMany: LeaseTC.getResolver('findMany').withMiddlewares([requireRole('Admin', 'Manager', 'Tenant', 'Guest')]),
});

// Payment Queries — Admin + Manager + Tenant
schemaComposer.Query.addFields({
  paymentById: PaymentTC.getResolver('findById').withMiddlewares([requireRole('Admin', 'Manager', 'Tenant', 'Guest')]),
  paymentMany: PaymentTC.getResolver('findMany').withMiddlewares([requireRole('Admin', 'Manager', 'Tenant', 'Guest')]),
});

// Maintenance Queries — Admin + Manager + Tenant
schemaComposer.Query.addFields({
  maintenanceById: MaintenanceTC.getResolver('findById').withMiddlewares([requireRole('Admin', 'Manager', 'Tenant', 'Guest')]),
  maintenanceMany: MaintenanceTC.getResolver('findMany').withMiddlewares([requireRole('Admin', 'Manager', 'Tenant', 'Guest'), filterByManager]),
});

// Admin Queries — Admin only
schemaComposer.Query.addFields({
  adminById: AdminTC.getResolver('findById').withMiddlewares([requireRole('Admin')]),
  adminMany: AdminTC.getResolver('findMany').withMiddlewares([requireRole('Admin')]),
});

// Manager Queries — Admin + Manager (managers need to query their own profile)
schemaComposer.Query.addFields({
  managerById: ManagerTC.getResolver('findById').withMiddlewares([requireRole('Admin', 'Manager')]),
  managerOne: ManagerTC.getResolver('findOne').withMiddlewares([requireRole('Admin', 'Manager')]),
  managerMany: ManagerTC.getResolver('findMany').withMiddlewares([requireRole('Admin', 'Manager')]),
});

// ============================================================
// MUTATIONS
// ============================================================

// User Mutations — Admin only (removed dangerous bulk-ops: createMany, updateMany, removeMany)
schemaComposer.Mutation.addFields({
  userCreateAccount: createUserAccountResolver.withMiddlewares([requireRole('Admin')]),
  userUpdateAccount: updateUserAccountResolver.withMiddlewares([requireRole('Admin')]),
  userDeleteAccount: deleteUserAccountResolver.withMiddlewares([requireRole('Admin')]),
  userCompleteTempPassword: completeTempPasswordResolver, // Any authenticated user (for their own password)
  createGuestProfile: createGuestProfileResolver, // Any authenticated Guest
});

// Community Mutations — Admin only
schemaComposer.Mutation.addFields({
  communityCreateOne: CommunityTC.getResolver('createOne').withMiddlewares([requireRole('Admin')]),
  communityUpdateById: CommunityTC.getResolver('updateById').withMiddlewares([requireRole('Admin')]),
  communityRemoveById: deleteCommunityResolver.withMiddlewares([requireRole('Admin')]),
  swapCommunityManagers: swapCommunityManagersResolver.withMiddlewares([requireRole('Admin')]),
});

// Unit Mutations — Admin + Manager
schemaComposer.Mutation.addFields({
  unitCreateOne: UnitTC.getResolver('createOne').withMiddlewares([requireRole('Admin', 'Manager')]),
  unitUpdateById: UnitTC.getResolver('updateById').withMiddlewares([requireRole('Admin', 'Manager')]),
});

// Application Mutations
schemaComposer.Mutation.addFields({
  applicationCreateOne: ApplicationTC.getResolver('createOne'), // Any authenticated user can apply
  applicationUpdateById: ApplicationTC.getResolver('updateById').withMiddlewares([requireRole('Admin', 'Manager')]),
  applicationRemoveById: ApplicationTC.getResolver('removeById').withMiddlewares([requireRole('Admin', 'Manager')]),
  acceptApplication: acceptApplicationResolver.withMiddlewares([requireRole('Admin', 'Manager')]),
});

// Tenant Mutations — Admin + Manager
schemaComposer.Mutation.addFields({
  tenantCreateOne: TenantTC.getResolver('createOne').withMiddlewares([requireRole('Admin', 'Manager')]),
  tenantUpdateById: TenantTC.getResolver('updateById').withMiddlewares([requireRole('Admin', 'Manager', 'Tenant')]),
});

// Lease Mutations — Admin + Manager
schemaComposer.Mutation.addFields({
  leaseCreateOne: LeaseTC.getResolver('createOne').withMiddlewares([requireRole('Admin', 'Manager')]),
  leaseUpdateById: LeaseTC.getResolver('updateById').withMiddlewares([requireRole('Admin', 'Manager')]),
});

// Payment Mutations — Admin + Manager + Tenant
schemaComposer.Mutation.addFields({
  paymentCreateOne: PaymentTC.getResolver('createOne').withMiddlewares([requireRole('Admin', 'Manager', 'Tenant')]),
  paymentUpdateById: PaymentTC.getResolver('updateById').withMiddlewares([requireRole('Admin', 'Manager')]),
});

// Maintenance Mutations — Tenant can create, Admin + Manager can update status
schemaComposer.Mutation.addFields({
  maintenanceCreateOne: MaintenanceTC.getResolver('createOne').withMiddlewares([requireRole('Admin', 'Manager', 'Tenant')]),
  maintenanceUpdateById: MaintenanceTC.getResolver('updateById').withMiddlewares([requireRole('Admin', 'Manager')]),
});

// Admin Mutations — Admin only
schemaComposer.Mutation.addFields({
  adminCreateOne: AdminTC.getResolver('createOne').withMiddlewares([requireRole('Admin')]),
  adminUpdateById: AdminTC.getResolver('updateById').withMiddlewares([requireRole('Admin')]),
});

// Manager Mutations — Admin only
schemaComposer.Mutation.addFields({
  managerCreateOne: ManagerTC.getResolver('createOne').withMiddlewares([requireRole('Admin')]),
  managerUpdateById: ManagerTC.getResolver('updateById').withMiddlewares([requireRole('Admin')]),
});

// Chat — Any authenticated user
schemaComposer.Mutation.addFields({
  chat: chatResolver,
});

// Apply Global Auth Middleware LAST (after all fields are registered)
[schemaComposer.Query, schemaComposer.Mutation].forEach(tc => {
  tc.getFieldNames().forEach(field => {
    // Skip auth guard for public endpoints
    if (field === 'communityMany') return;

    const fc = tc.getFieldConfig(field);
    const next = fc.resolve;
    if (next) {
      tc.extendField(field, {
        resolve: (source: any, args: any, context: any, info: any) => authGuard(next, source, args, context, info)
      });
    }
  });
});

export const schema = schemaComposer.buildSchema();
