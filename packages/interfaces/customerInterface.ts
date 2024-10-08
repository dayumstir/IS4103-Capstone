// Defines the structure of a customer object

import { ICreditTier } from "./creditTierInterface";

export interface ICustomer {
    customer_id: string;
    name: string;
    profile_picture: Buffer;
    email: string;
    password: string;
    contact_number: string;
    address: string;
    date_of_birth: Date;
    status: string;
    credit_score: number;

    credit_tier_id: string;
    credit_tier: ICreditTier;
}
