// Defines the structure of a instalment plan object
import { Sorting } from "./sortingInterface";

export enum IssueStatus {
    PENDING_OUTCOME = "PENDING_OUTCOME",
    RESOLVED = "RESOLVED",
}

export interface IIssue {
    issue_id: string;
    title: string;
    description: string;
    outcome: string;
    status: IssueStatus;
    images?: Buffer[];
    createTime: Date;

    merchant_id?: string; // Optional foreign key to Merchant
    customer_id?: string; // Optional foreign key to Customer
    admin_id?: string; // Optional foreign key to Admin
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
}
