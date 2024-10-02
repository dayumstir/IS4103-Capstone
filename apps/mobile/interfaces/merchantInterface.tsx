export enum MerchantStatus {
  PENDING_EMAIL_VERIFICATION = "PENDING_EMAIL_VERIFICATION",
  PENDING_PHONE_VERIFICATION = "PENDING_PHONE_VERIFICATION",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

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
}
