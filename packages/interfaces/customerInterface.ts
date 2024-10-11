// Defines the structure of a customer object

import { ICreditTier } from "./creditTierInterface";

export enum CustomerStatus {
  PENDING_EMAIL_VERIFICATION = "PENDING_EMAIL_VERIFICATION",
  PENDING_PHONE_VERIFICATION = "PENDING_PHONE_VERIFICATION",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED"
}

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

  credit_tier_id: string;
  credit_tier: ICreditTier;
}
