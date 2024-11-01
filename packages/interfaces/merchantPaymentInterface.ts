import { IMerchant } from "./merchantInterface";

export enum PaymentStatus {
    PAID = "PAID",
    PENDING_PAYMENT = "PENDING_PAYMENT",
}

export interface IMerchantPayment {
    merchant_payment_id: string;
    from_bank: string;
    to_merchant_bank_account_no: string;
    evidence: Buffer;
    status: PaymentStatus;
    created_at: Date;

    total_amount_from_transactions: number;
    transaction_fee_percentage: number;
    transaction_fees: number;
    withdrawal_fee_percentage: number;
    withdrawal_fee: number;
    final_payment_amount: number;

    merchant_id: string;
    merchant: IMerchant;
}
