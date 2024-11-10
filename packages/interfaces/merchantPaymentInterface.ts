import { IssueStatus } from "./issueInterface";
import { IMerchant } from "./merchantInterface";
import { Sorting } from "./sortingInterface";

export enum PaymentStatus {
    PAID = "PAID",
    PENDING_PAYMENT = "PENDING_PAYMENT",
}

export interface IMerchantPayment {
    merchant_payment_id: string;
    from_bank: string | null;
    to_merchant_bank_account_no: string;
    evidence: Buffer | null;
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

    issues: IssueInfo[];
}
interface IssueInfo {
    issue_id: string;
    create_time: Date;
    title: string;
    description: string;
    status: IssueStatus;
}

export const merchantPaymentStatusColorMap: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING_PAYMENT]: "orange",
    [PaymentStatus.PAID]: "green",
};

export interface IMerchantPaymentFilter {
    merchant_payment_id?: string;
    from_bank?: string;
    to_merchant_bank_account_no?: string;
    status?: PaymentStatus;
    create_from?: Date;
    create_to?: Date;

    total_amount_from_transactions?: number;
    transaction_fee_percentage?: number;
    transaction_fees?: number;
    withdrawal_fee_percentage?: number;
    withdrawal_fee?: number;
    final_payment_amount?: number;

    merchant_id?: string;

    sorting?: Sorting;
    search_term?: string;
}
