// Defines the structure of a customer object
export interface ICustomer {
    customer_id: string;
    name: string;
    profile_picture: string;
    email: string;
    password: string;
    contact_number: string;
    address: string;
    date_of_birth: Date;
    status: string;     // TODO: Implement as enum
    credit_score: number;
    credit_tier_id: string;
}
