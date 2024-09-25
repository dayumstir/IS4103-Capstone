// Defines the structure of a instalment plan object

export enum DisputeStatus {
    PENDING_OUTCOME = "PENDING_OUTCOME",
    RESOLVED = "RESOLVED",
}

export interface IDispute {
    dispute_id: string;
    title: string;
    description: string;
    address: string;
    outcome: string;
    status: DisputeStatus;
    images?: Buffer[];

    merchant_id?: string; // Optional foreign key to Merchant
    customer_id?: string; // Optional foreign key to Customer
    admin_id?: string; // Optional foreign key to Admin
}
