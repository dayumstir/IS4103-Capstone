// Defines the structure of a customer object
export interface ICustomer {
    customer_ID: Number,
    name: string,
    profile_picture: string,
    email: string,
    password: string,
    contact_number: string,
    address: string,
    date_of_birth: Date,
    status: string,
    credit_score: Number,
    credit_tier_id: Number
}