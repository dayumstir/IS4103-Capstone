import { CustomerStatus } from "./customerStatusInterface";

export interface ICustomer {
    customer_id: string;
    name: string;
    profile_picture: Buffer;
    email: string;
    password: string;
    contact_number: string;
    address: string;
    date_of_birth: Date;
    status: CustomerStatus;  
    wallet_balance: number; 
    credit_score: number;
    forgot_password: boolean;
    
    credit_tier_id: string;
}
