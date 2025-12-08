export const INTENTS = {
    // Tenant Intents
    GET_MY_LEASE: {
        name: 'GET_MY_LEASE',
        description: 'Get details about the current Active leases including rent, start date, and end date.',
        query: `
            query GetMyLease($linked_id: MongoID!) {
                leaseMany(filter: { tenant_id: $linked_id, status: Active }) {
                    _id
                    start_date
                    end_date
                    monthly_rent
                    security_deposit
                    status
                    unit {
                        apartment_no
                        community {
                            name
                        }
                    }
                }
            }
        `
    },
    GET_MY_PAYMENTS: {
        name: 'GET_MY_PAYMENTS',
        description: 'Get recent payment history and status.',
        query: `
            query GetMyPayments($linked_id: MongoID!) {
                paymentMany(filter: { tenant_id: $linked_id }, sort: DATE_DESC, limit: 5) {
                    _id
                    amount
                    date
                    status
                    payment_method
                }
            }
        `
    },
    GET_MY_MAINTENANCE: {
        name: 'GET_MY_MAINTENANCE',
        description: 'Get status of reported maintenance issues.',
        query: `
            query GetMyMaintenance($linked_id: MongoID!) {
                maintenanceMany(filter: { tenant_id: $linked_id }, sort: _ID_ASC) {
                    _id
                    issue_description
                    status
                    priority
                    reported_date
                }
            }
        `
    },
    GET_COMMUNITY_INFO: {
        name: 'GET_COMMUNITY_INFO',
        description: 'Get manager contact info and community details.',
        query: `
            query GetCommunityInfo($linked_id: MongoID!) {
                tenantMany(filter: { _id: $linked_id }) {
                    lease {
                        unit {
                            community {
                                description
                                location
                                name
                                manager {
                                    name
                                    phone
                                    email
                                }
                            }
                        }
                    }
                }
            }
        `
    },

    // Manager Intents
    GET_PENDING_APPLICATIONS: {
        name: 'GET_PENDING_APPLICATIONS',
        description: 'Get list of pending applications.',
        query: `
            query GetPendingApplications {
                applicationMany(filter: { status: Pending }) {
                    _id
                    applicant_name
                    email
                    date_applied
                    unit {
                        apartment_no
                    }
                }
            }
        `
    },
    GET_OPEN_MAINTENANCE: {
        name: 'GET_OPEN_MAINTENANCE',
        description: 'Get open maintenance requests.',
        query: `
            query GetOpenMaintenance {
                maintenanceMany(filter: { status: Open }) {
                    _id
                    issue_description
                    priority
                    reported_date
                    tenant {
                        name
                        lease {
                            unit {
                                apartment_no
                            }
                        }
                    }
                }
            }
        `
    },
    GET_OCCUPANCY_STATS: {
        name: 'GET_OCCUPANCY_STATS',
        description: 'Get total units vs occupied units.',
        query: `
            query GetOccupancyStats {
                unitMany {
                    _id
                    status
                }
            }
        `
    },
    GET_TENANTS: {
        name: 'GET_TENANTS',
        description: 'Get list of tenants who have active leases.',
        query: `
            query GetTenants {
                tenantMany {
                        email
                        name
                        phone
                        lease {
                            apartment_id
                            unit {
                                apartment_no
                                community {
                                    name
                                }
                            }
                        }
                }
            }
        `
    },
};
