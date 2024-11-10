// packages/interfaces/issueInterface.ts
import { IMerchantPayment } from "./merchantPaymentInterface";
import { Sorting } from "./sortingInterface";
import { ITransaction } from "./transactionInterface";

export enum IssueStatus {
    PENDING_OUTCOME = "PENDING_OUTCOME",
    RESOLVED = "RESOLVED",
    CANCELLED = "CANCELLED",
}

export const statusColorMap: Record<IssueStatus, string> = {
    [IssueStatus.PENDING_OUTCOME]: "orange",
    [IssueStatus.RESOLVED]: "green",
    [IssueStatus.CANCELLED]: "red",
};

export enum IssueCategory {
    ACCOUNT = "ACCOUNT",
    TRANSACTION = "TRANSACTION",
    MERCHANT_PAYMENT = "MERCHANT_PAYMENT",
    OTHERS = "OTHERS",
}

export interface IIssue {
    issue_id: string;
    title: string;
    description: string;
    category: IssueCategory;
    outcome?: string;
    status: IssueStatus;
    images?: Buffer[];
    create_time: Date;
    updated_at: Date;

    merchant_id?: string; // Optional foreign key to Merchant
    customer_id?: string; // Optional foreign key to Customer
    admin_id?: string; // Optional foreign key to Admin
    transaction_id?: string; // Optional foreign key to Transaction
    merchant_payment_id?: string;
}

export interface IssueFilter {
    issue_id?: string;
    title?: string;
    description?: string;
    address?: string;
    outcome?: string;
    status?: IssueStatus;
    merchant_id?: string;
    customer_id?: string;
    admin_id?: string;
    sorting: Sorting;
    create_from?: Date;
    create_to?: Date;
    update_from?: Date;
    update_to?: Date;
    search_term?: string;
}

export interface IssueResult {
    issue_id: string;
    title: string;
    description: string;
    category: IssueCategory;
    outcome: string;
    status: IssueStatus;
    images?: Buffer[];
    create_time: Date;
    updated_at: Date;

    transaction: ITransaction;
    merchantPayment: IMerchantPayment;
}
