import { UnitTC } from './models/Unit.js';
import { CommunityTC } from './models/Community.js';
import { LeaseTC } from './models/Lease.js';
import { TenantTC } from './models/Tenant.js';
import { MaintenanceTC } from './models/Maintenance.js';
import { PaymentTC, PaymentModel } from './models/Payment.js';
import { ApplicationTC } from './models/Application.js';
import { ManagerTC } from './models/Manager.js';
import { UserTC } from './models/User.js';

// Community Relations
CommunityTC.addRelation('unitCount', {
    resolver: () => UnitTC.getResolver('count'),
    prepareArgs: {
        filter: (source: any) => ({ community_id: source._id }),
    },
    projection: { _id: 1 },
});

CommunityTC.addRelation('units', {
    resolver: () => UnitTC.getResolver('findMany'),
    prepareArgs: {
        filter: (source: any) => ({ community_id: source._id }),
    },
    projection: { _id: 1 },
});

// Unit Relations
UnitTC.addRelation('community', {
    resolver: () => CommunityTC.getResolver('findById'),
    prepareArgs: {
        _id: (source: any) => source.community_id,
    },
    projection: { community_id: 1 },
});

// Lease Relations
LeaseTC.addRelation('unit', {
    resolver: () => UnitTC.getResolver('findById'),
    prepareArgs: {
        _id: (source: any) => source.apartment_id,
    },
    projection: { apartment_id: 1 },
});

LeaseTC.addRelation('tenant', {
    resolver: () => TenantTC.getResolver('findById'),
    prepareArgs: {
        _id: (source: any) => source.tenant_id,
    },
    projection: { tenant_id: 1 },
});



// Maintenance Relations
MaintenanceTC.addRelation('unit', {
    resolver: () => UnitTC.getResolver('findById'),
    prepareArgs: {
        _id: (source: any) => source.apartment_id,
    },
    projection: { apartment_id: 1 },
});

MaintenanceTC.addRelation('tenant', {
    resolver: () => TenantTC.getResolver('findById'),
    prepareArgs: {
        _id: (source: any) => source.tenant_id,
    },
    projection: { tenant_id: 1 },
});

// Payment Relations
PaymentTC.addRelation('lease', {
    resolver: () => LeaseTC.getResolver('findById'),
    prepareArgs: {
        _id: (source: any) => source.lease_id,
    },
    projection: { lease_id: 1 },
});

PaymentTC.addRelation('tenant', {
    resolver: () => TenantTC.getResolver('findById'),
    prepareArgs: {
        _id: (source: any) => source.tenant_id,
    },
    projection: { tenant_id: 1 },
});

// Tenant Relations
TenantTC.addRelation('lease', {
    resolver: () => LeaseTC.getResolver('findById'),
    prepareArgs: {
        _id: (source: any) => source.lease_id,
    },
    projection: { lease_id: 1 },
});

TenantTC.addRelation('leases', {
    resolver: () => LeaseTC.getResolver('findMany'),
    prepareArgs: {
        filter: (source: any) => ({ tenant_id: source._id }),
    },
    projection: { _id: 1 },
});

TenantTC.addRelation('payments', {
    resolver: () => PaymentTC.getResolver('findMany'),
    prepareArgs: {
        filter: (source: any) => ({ tenant_id: source._id }),
    },
    projection: { _id: 1 },
});

TenantTC.addRelation('maintenance', {
    resolver: () => MaintenanceTC.getResolver('findMany'),
    prepareArgs: {
        filter: (source: any) => ({ tenant_id: source._id }),
    },
    projection: { _id: 1 },
});

TenantTC.addRelation('user', {
    resolver: () => UserTC.getResolver('findOne'),
    prepareArgs: {
        filter: (source: any) => ({ linked_id: source._id }),
    },
    projection: { _id: 1 },
});

// Application Relations
ApplicationTC.addRelation('unit', {
    resolver: () => UnitTC.getResolver('findById'),
    prepareArgs: {
        _id: (source: any) => source.apartment_id,
    },
    projection: { apartment_id: 1 },
});

// Manager Relations
ManagerTC.addRelation('community', {
    resolver: () => CommunityTC.getResolver('findOne'),
    prepareArgs: {
        filter: (source: any) => ({ "manager.manager_id": source._id }),
    },
    projection: { _id: 1 },
});

// User Relations
UserTC.addRelation('tenant_profile', {
    resolver: () => TenantTC.getResolver('findById'),
    prepareArgs: {
        _id: (source: any) => source.linked_id,
    },
    projection: { linked_id: 1 },
});
