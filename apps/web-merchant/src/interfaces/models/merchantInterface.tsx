import { MerchantStatus } from "./merchantStatus";

// Defines the structure of a merchant object
export interface IMerchant {
  merchant_id: string;
  name: string;
  email: string;
  password: string;
  contact_number: string;
  address: string;
  profile_picture?: Buffer;
  status: MerchantStatus;
  qr_code: string;
  cashback: number;
}
