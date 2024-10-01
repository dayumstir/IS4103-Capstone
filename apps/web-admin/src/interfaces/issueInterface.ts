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