import { gql } from "@apollo/client";

export const UPDATE_USER = gql`
  mutation UpdateUser($_id: MongoID!, $name: String, $email: String, $role: String) {
    userUpdateAccount(_id: $_id, name: $name, email: $email, role: $role) {
      _id
      name
      email
      role
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUserAccount($name: String!, $email: String!, $password: String!, $role: String!, $phone: String) {
    userCreateAccount(name: $name, email: $email, password: $password, role: $role, phone: $phone) {
      _id
      name
      email
      role
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($_id: MongoID!) {
    userDeleteAccount(_id: $_id) {
      _id
    }
  }
`;

export const CREATE_TENANT = gql`
  mutation CreateTenantAccount($name: String!, $email: String!, $password: String!) {
    userCreateAccount(name: $name, email: $email, password: $password, role: "Tenant") {
      _id
      name
      email
      role
    }
  }
`;

export const UPDATE_TENANT = gql`
  mutation UpdateTenant($_id: MongoID!, $name: String, $email: String, $phone: String) {
    userUpdateAccount(_id: $_id, name: $name, email: $email, role: "Tenant") {
      _id
      name
      email
    }
  }
`;

export const DELETE_TENANT = gql`
  mutation DeleteTenant($_id: MongoID!) {
    userDeleteAccount(_id: $_id) {
      _id
      name
    }
  }
`;

export const CREATE_COMMUNITY = gql`
  mutation CreateCommunity($record: CreateOneCommunityInput!) {
    communityCreateOne(record: $record) {
      record {
        _id
        name
      }
    }
  }
`;

export const UPDATE_COMMUNITY = gql`
  mutation UpdateCommunity($_id: MongoID!, $name: String, $location: String, $description: String, $images: [String], $manager: UpdateByIdCommunityManagerInput) {
    communityUpdateById(_id: $_id, record: { name: $name, location: $location, description: $description, images: $images, manager: $manager }) {
      record {
        _id
        name
        location
        description
        images
        manager {
          manager_id
          name
          email
          phone
        }
      }
    }
  }
`;

export const DELETE_COMMUNITY = gql`
  mutation DeleteCommunity($id: MongoID!) {
    communityRemoveById(_id: $id) {
      name
    }
  }
`;

export const CREATE_LEASE = gql`
  mutation CreateLease($record: CreateOneLeaseInput!) {
    leaseCreateOne(record: $record) {
      record {
        _id
        start_date
        end_date
        status
      }
    }
  }
`;

export const UPDATE_LEASE = gql`
  mutation UpdateLease($_id: MongoID!, $start_date: Date, $end_date: Date, $status: EnumLeaseStatus, $monthly_rent: Float, $security_deposit: Float) {
    leaseUpdateById(_id: $_id, record: { start_date: $start_date, end_date: $end_date, status: $status, monthly_rent: $monthly_rent, security_deposit: $security_deposit }) {
      record {
        _id
        start_date
        end_date
        status
        monthly_rent
        security_deposit
      }
    }
  }
`;

export const CREATE_UNIT = gql`
  mutation CreateUnit($record: CreateOneUnitInput!) {
    unitCreateOne(record: $record) {
      record {
        _id
        apartment_no
      }
    }
  }
`;

export const UPDATE_UNIT = gql`
  mutation UpdateUnit($_id: MongoID!, $record: UpdateByIdUnitInput!) {
  unitUpdateById(_id: $_id, record: $record) {
      record {
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
`;

export const DELETE_UNIT = gql`
  mutation DeleteUnit($id: MongoID!) {
  unitRemoveById(_id: $id) {
    recordId
  }
}
`;

export const COMPLETE_TEMP_PASSWORD = gql`
  mutation CompleteTempPassword($email: String!) {
  userCompleteTempPassword(email: $email) {
    _id
    is_temp_password
  }
}
`;

export const UPDATE_APPLICATION_STATUS = gql`
  mutation UpdateApplicationStatus($id: MongoID!, $status: EnumApplicationStatus!) {
  applicationUpdateById(_id: $id, record: { status: $status }) {
      record {
      _id
      status
    }
  }
}
`;

export const UPDATE_MAINTENANCE_STATUS = gql`
  mutation UpdateMaintenanceStatus($id: MongoID!, $status: EnumMaintenanceStatus!) {
  maintenanceUpdateById(_id: $id, record: { status: $status }) {
      record {
      _id
      status
    }
  }
}
`;

export const CREATE_MAINTENANCE_REQUEST = gql`
  mutation CreateMaintenanceRequest($record: CreateOneMaintenanceInput!) {
  maintenanceCreateOne(record: $record) {
      record {
      _id
      issue_description
      status
    }
  }
}
`;

export const CREATE_APPLICATION = gql`
  mutation CreateApplication($record: CreateOneApplicationInput!) {
  applicationCreateOne(record: $record) {
      record {
      _id
      applicant_name
      status
    }
  }
}
`;

export const DELETE_APPLICATION = gql`
  mutation DeleteApplication($id: MongoID!) {
  applicationRemoveById(_id: $id) {
    recordId
  }
}
`;

export const ACCEPT_APPLICATION = gql`
  mutation AcceptApplication($application_id: MongoID!, $start_date: Date!, $end_date: Date!, $monthly_rent: Float!, $security_deposit: Float!) {
  acceptApplication(application_id: $application_id, start_date: $start_date, end_date: $end_date, monthly_rent: $monthly_rent, security_deposit: $security_deposit) {
    _id
    status
    start_date
    end_date
  }
}
`;

export const CHAT = gql`
  mutation Chat($message: String!) {
    chat(message: $message) {
      message
      data
    }
  }
`;

export const CREATE_PAYMENT = gql`
  mutation CreatePayment($record: CreateOnePaymentInput!) {
    paymentCreateOne(record: $record) {
      record {
        _id
        amount
        payment_date
        status
        payment_method
      }
    }
  }
`;
export const SWAP_COMMUNITY_MANAGERS = gql`
  mutation SwapCommunityManagers($community1Id: ID!, $community2Id: ID!) {
    swapCommunityManagers(community1Id: $community1Id, community2Id: $community2Id) {
      success
      message
    }
  }
`;
