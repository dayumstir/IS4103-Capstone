// packages/interfaces/transactionInterface.ts
import { IInstalmentPayment } from "./instalmentPaymentInterface";
import { IInstalmentPlan } from "./instalmentPlanInterface";
import { IMerchant } from "./merchantInterface";
import { IssueStatus } from "./issueInterface";
import { Sorting } from "./sortingInterface";
import { IRating } from "./ratingInterface";

export enum TransactionStatus {
    FULLY_PAID = "FULLY_PAID",
    IN_PROGRESS = "IN_PROGRESS",
}

export interface ITransaction {
    transaction_id: string;
    amount: number;
    date_of_transaction: Date;
    status: TransactionStatus;
    fully_paid_date?: Date;
    reference_no: string;
    cashback_percentage: number;
    customer_id: string;
    merchant_id: string;
    instalment_plan_id: string;
    merchant_payment_id?: string;
    rating?: IRating;
}

export interface TransactionFilter {
    transaction_id?: string;
    amount?: number;
    date?: Date;
    status?: TransactionStatus;
    customer_id?: string;
    merchant_id?: string;
    merchant_payment_id?: string;
    instalment_plan_id?: string;
    sorting?: Sorting;
    create_from?: Date;
    create_to?: Date;
    search_term?: string;
}

export interface TransactionResult {
    transaction_id: string;
    amount: number;
    date_of_transaction: Date;
    fully_paid_date: Date;
    status: TransactionStatus;
    reference_no: string;
    cashback_percentage: number;

    customer: CustomerInfo;
    merchant: IMerchant;
    instalment_plan: IInstalmentPlan;
    issues: IssueInfo[];
    instalment_payments: IInstalmentPayment[];
    rating?: IRating;
}

interface CustomerInfo {
    customer_id: string;
    email: string;
    name: string;
}

interface IssueInfo {
    issue_id: string;
    create_time: Date;
    title: string;
    description: string;
    status: IssueStatus;
}

export const transactionStatusColorMap: Record<TransactionStatus, string> = {
    [TransactionStatus.IN_PROGRESS]: "orange",
    [TransactionStatus.FULLY_PAID]: "green",
};

export interface TransactionStats {
    volumeIncrease: number;
    activeCustomers: number;
    totalCustomers: number;
    customerGrowth: number;
    avgTransactionSize: number;
    avgTransactionChange: number;
    currentDefaultRate: number;
    defaultRateChange: number;
    dailyVolume: {
        date: string;
        volume: number;
    }[];
    monthlyVolume: {
        date: string;
        volume: number;
    }[];
    yearlyVolume: {
        date: string;
        volume: number;
    }[];
}
