import { MerchantStatus } from "./merchantStatus";

export interface IMerchant {
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
