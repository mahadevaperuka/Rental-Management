import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GetUsers {
    userMany {
      _id
      name
      email
      role
    createdAt
      last_login
      tenant_profile {
        _id
        lease {
          _id
          start_date
          end_date
          monthly_rent
          security_deposit
          status
        }
      }
    }
  }
`;

export const GET_TENANTS = gql`
  query GetTenants {
    tenantMany {
      _id
      name
      email
      phone
      joined_date
      lease {
        _id
        start_date
        end_date
        monthly_rent
        security_deposit
        status
        unit {
            _id
            apartment_no
            community {
                _id
                name
            }
        }
      }
    }
  }
`;

export const GET_COMMUNITIES_AND_MANAGERS = gql`
  query GetCommunitiesAndManagers {
    communityMany {
      _id
      name
      location
      description
      images
      manager {
        manager_id
        name
        email
      }
      unitCount
    }
    managerMany {
      _id
      name
      email
      phone
      community {
        _id
        name
      }
    }
  }
`;

export const GET_MANAGER_BY_EMAIL = gql`
  query GetManagerByEmail($email: String!) {
    managerOne(filter: { email: $email }) {
      _id
      community {
        _id
        name
        units {
          _id
          apartment_no
          floor
          bedrooms
          bathrooms
          rent
          status
          images
        }
      }
    }
  }
`;

export const GET_LANDING_DATA = gql`
  query GetLandingData {
    communityMany {
      _id
      name
      location
      description
      images
      units {
        _id
        apartment_no
        bedrooms
        bathrooms
        rent
        status
        images
      }
    }
  }
`;

export const GET_APPLICATIONS = gql`
  query GetApplications {
    applicationMany {
      _id
      applicant_name
      email
      phone
      date_applied
      status
      documents
        unit {
        _id
        apartment_no
        rent
        community {
            _id
            name
        }
      }
    }
  }
`;

export const GET_MAINTENANCE_REQUESTS = gql`
  query GetMaintenanceRequests {
    maintenanceMany {
      _id
      issue_description
      priority
      status
      reported_date
      unit {
        _id
        apartment_no
        community {
            _id
            name
        }
      }
      tenant {
        _id
        name
        email
        phone
      }
    }
  }
`;

export const GET_ADMIN_STATS = gql`
  query GetAdminStats {
    communityCount
    unitCount
    tenantCount
    userCount
  }
`;

export const GET_UNITS = gql`
  query GetUnits($filter: FilterFindManyUnitInput) {
    unitMany(filter: $filter) {
        _id
        apartment_no
        bedrooms
        bathrooms
        rent
        status
        images
      community {
            _id
            name
            location
        }
    }
}
`;

export const GET_MY_LEASE = gql`
  query GetMyLease($filter: FilterFindManyLeaseInput) {
    leaseMany(filter: $filter) {
      _id
      start_date
      end_date
      monthly_rent
      status
      unit {
        _id
        apartment_no
        bedrooms
        bathrooms
        community {
          _id
          name
          location
        }
      }
    }
  }
`;

export const GET_MY_PAYMENTS = gql`
  query GetMyPayments($filter: FilterFindManyPaymentInput) {
    paymentMany(filter: $filter) {
      _id
      amount
      payment_date
      status
      payment_method
    }
  }
`;

export const GET_MY_UNIT_ID = gql`
  query GetMyUnitId($filter: FilterFindManyLeaseInput) {
    leaseMany(filter: $filter) {
      _id
      unit {
        _id
      }
    }
  }
`;

export const GET_MY_REQUESTS = gql`
  query GetMyMaintenanceRequests($filter: FilterFindManyMaintenanceInput) {
    maintenanceMany(filter: $filter) {
      _id
      title: issue_description
      description: issue_description
      status
      priority
      createdAt: reported_date
    }
  }
`;

export const GET_MY_COMMUNITY = gql`
  query GetMyCommunity($id: MongoID!) {
    managerById(_id: $id) {
      community {
        _id
        name
        location
        description
        images
      }
    }
  }
`;

export const GET_MANAGER_UNITS_PAGE_DATA = gql`
  query GetManagerUnitsPageData($id: MongoID!) {
    managerById(_id: $id) {
      community {
        _id
        name
        units {
          _id
          apartment_no
          floor
          bedrooms
          bathrooms
          rent
          status
          images
        }
      }
    }
  }
`;

export const GET_MY_APPLICATIONS = gql`
  query GetMyApplications($email: String!) {
    applicationMany(filter: { email: $email }) {
      _id
      date_applied
      status
      unit {
        _id
        apartment_no
        rent
        community {
          _id
          name
          location
        }
      }
    }
  }
`;
