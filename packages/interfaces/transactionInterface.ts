// Defines the structure of a transaction object

import { ICustomer } from "../../apps/backend/src/interfaces/customerInterface";
import { IInstalmentPlan } from "../../apps/backend/src/interfaces/instalmentPlanInterface";
import { IMerchant } from "../../apps/backend/src/interfaces/merchantInterface";
import { IssueStatus } from "./issueInterface";
import { Sorting } from "./sortingInterface";

export enum TransactionStatus {
    FULLY_PAID = "FULLY_PAID",
    IN_PROGRESS = "IN_PROGRESS",
}
export interface ITransaction {
    transaction_id: string;
    amount: number;
    date_of_transaction: Date;
    fully_paid_date: Date;
    status: TransactionStatus;
    reference_no: string;
    cashback_percentage: number;
    customer_id: string;
    merchant_id: string;
    merchant_payment_id: string;
    instalment_plan_id: string;
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
    instalment_plan: IInstalmentPlan;
    issues: IssueInfo[];
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
