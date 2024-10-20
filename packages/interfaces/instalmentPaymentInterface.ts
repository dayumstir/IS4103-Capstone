// packages/interfaces/instalmentPaymentInterface.ts
import { TransactionResult } from "./transactionInterface";
import { IVoucherAssigned } from "./voucherInterface";
import { ICashbackWallet } from "./cashbackWalletInterface";

export interface IInstalmentPayment {
    instalment_payment_id: string;
    amount_due: number;
    late_payment_amount_due: number;
    status: InstalmentPaymentStatus;
    due_date: Date;
    paid_date?: Date;
    instalment_number: number;

    transaction_id: string;
    transaction: TransactionResult;

    voucher_assigned_id?: string;
    voucher_assigned?: IVoucherAssigned;
    amount_discount_from_voucher?: number;

    amount_deducted_from_wallet?: number;

    cashback_wallet?: ICashbackWallet;
    amount_deducted_from_cashback_wallet?: number;
}

export enum InstalmentPaymentStatus {
    PAID = "PAID",
    UNPAID = "UNPAID",
}
