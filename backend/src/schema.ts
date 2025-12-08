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
import { createUserAccountResolver, updateUserAccountResolver, completeTempPasswordResolver, deleteUserAccountResolver, deleteCommunityResolver } from './resolvers/customUserResolvers.js';
import { acceptApplicationResolver } from './resolvers/customApplicationResolvers.js';
import { filterByManager } from './resolvers/managerResolvers.js';
import { chatResolver } from './resolvers/chatResolvers.js';
import './relations.js';

const schemaComposer = new SchemaComposer();

// User
schemaComposer.Query.addFields({
  userById: UserTC.getResolver('findById'),
  userByIds: UserTC.getResolver('findByIds'),
  userOne: UserTC.getResolver('findOne'),
  userMany: UserTC.getResolver('findMany'),
  userCount: UserTC.getResolver('count'),
  userConnection: UserTC.getResolver('connection'),
  userPagination: UserTC.getResolver('pagination'),
});

schemaComposer.Mutation.addFields({
  userCreateOne: UserTC.getResolver('createOne'),
  userCreateMany: UserTC.getResolver('createMany'),
  userUpdateById: UserTC.getResolver('updateById'),
  userUpdateOne: UserTC.getResolver('updateOne'),
  userUpdateMany: UserTC.getResolver('updateMany'),
  userRemoveById: UserTC.getResolver('removeById'),
  userRemoveOne: UserTC.getResolver('removeOne'),
  userRemoveMany: UserTC.getResolver('removeMany'),
  userCreateAccount: createUserAccountResolver,
  userUpdateAccount: updateUserAccountResolver,
  userDeleteAccount: deleteUserAccountResolver,
  userCompleteTempPassword: completeTempPasswordResolver,
});

// Community
schemaComposer.Query.addFields({
  communityById: CommunityTC.getResolver('findById'),
  communityMany: CommunityTC.getResolver('findMany'),
  communityCount: CommunityTC.getResolver('count'),
});

schemaComposer.Mutation.addFields({
  communityCreateOne: CommunityTC.getResolver('createOne'),
  communityUpdateById: CommunityTC.getResolver('updateById'),
  communityRemoveById: deleteCommunityResolver,
});

// Unit
schemaComposer.Query.addFields({
  unitById: UnitTC.getResolver('findById'),
  unitMany: UnitTC.getResolver('findMany'),
  unitCount: UnitTC.getResolver('count'),
});

schemaComposer.Mutation.addFields({
  unitCreateOne: UnitTC.getResolver('createOne'),
  unitUpdateById: UnitTC.getResolver('updateById'),
});

// Application
schemaComposer.Query.addFields({
  applicationById: ApplicationTC.getResolver('findById'),
  applicationMany: ApplicationTC.getResolver('findMany').withMiddlewares([filterByManager]),
});

schemaComposer.Mutation.addFields({
  applicationCreateOne: ApplicationTC.getResolver('createOne'),
  applicationUpdateById: ApplicationTC.getResolver('updateById'),
  applicationRemoveById: ApplicationTC.getResolver('removeById'),
  acceptApplication: acceptApplicationResolver,
});

// Tenant
schemaComposer.Query.addFields({
  tenantById: TenantTC.getResolver('findById'),
  tenantMany: TenantTC.getResolver('findMany').withMiddlewares([filterByManager]),
  tenantCount: TenantTC.getResolver('count'),
});

schemaComposer.Mutation.addFields({
  tenantCreateOne: TenantTC.getResolver('createOne'),
  tenantUpdateById: TenantTC.getResolver('updateById'),
});

// Lease
schemaComposer.Query.addFields({
  leaseById: LeaseTC.getResolver('findById'),
  leaseMany: LeaseTC.getResolver('findMany'),
});

schemaComposer.Mutation.addFields({
  leaseCreateOne: LeaseTC.getResolver('createOne'),
  leaseUpdateById: LeaseTC.getResolver('updateById'),
});

// Payment
schemaComposer.Query.addFields({
  paymentById: PaymentTC.getResolver('findById'),
  paymentMany: PaymentTC.getResolver('findMany'),
});

schemaComposer.Mutation.addFields({
  paymentCreateOne: PaymentTC.getResolver('createOne'),
  paymentUpdateById: PaymentTC.getResolver('updateById'),
});

// Maintenance
schemaComposer.Query.addFields({
  maintenanceById: MaintenanceTC.getResolver('findById'),
  maintenanceMany: MaintenanceTC.getResolver('findMany').withMiddlewares([filterByManager]),
});

schemaComposer.Mutation.addFields({
  maintenanceCreateOne: MaintenanceTC.getResolver('createOne'),
  maintenanceUpdateById: MaintenanceTC.getResolver('updateById'),
});

// Admin
schemaComposer.Query.addFields({
  adminById: AdminTC.getResolver('findById'),
  adminMany: AdminTC.getResolver('findMany'),
});

schemaComposer.Mutation.addFields({
  adminCreateOne: AdminTC.getResolver('createOne'),
  adminUpdateById: AdminTC.getResolver('updateById'),
});

// Manager
schemaComposer.Query.addFields({
  managerById: ManagerTC.getResolver('findById'),
  managerMany: ManagerTC.getResolver('findMany'),
});


schemaComposer.Mutation.addFields({
  managerCreateOne: ManagerTC.getResolver('createOne'),
  managerUpdateById: ManagerTC.getResolver('updateById'),
  chat: chatResolver,
});

export const schema = schemaComposer.buildSchema();
