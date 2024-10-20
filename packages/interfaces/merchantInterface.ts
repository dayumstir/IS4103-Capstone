// packages/interfaces/merchantInterface.ts
import { ITransaction } from "./transactionInterface";

export enum MerchantStatus {
    PENDING_EMAIL_VERIFICATION = "PENDING_EMAIL_VERIFICATION",
    PENDING_PHONE_VERIFICATION = "PENDING_PHONE_VERIFICATION",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
}

export interface IMerchant {
    merchant_id: string;
    name: string;
    email: string;
    password: string;
    contact_number: string;
    address: string;
    qr_code: string;
    status: MerchantStatus;
    profile_picture?: Buffer;
    cashback: number;
}

export interface IMerchantPayment {
    merchant_payment_id: string;
    from_bank_id: string;
    evidence: string;
    amount: number;

    merchant_bank_id: string;
    merchant_id: string;

    transactions: ITransaction[];
}
