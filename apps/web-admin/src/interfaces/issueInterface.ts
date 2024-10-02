export enum IssueStatus {
    PENDING_OUTCOME = "PENDING_OUTCOME",
    RESOLVED = "RESOLVED",
    CANCELLED = "CANCELLED",
}

export interface IIssue {
    issue_id: string;
    title: string;
    description: string;
    outcome: string;
    status: IssueStatus;
    images?: Buffer[];
    create_time: string;
    updated_at: string;

    merchant_id?: string; // Optional foreign key to Merchant
    customer_id?: string; // Optional foreign key to Customer
    admin_id?: string; // Optional foreign key to Admin
}