// Defines the structure of an issue object
import { Sorting } from "./sortingInterface";

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
  create_time: Date;
  updated_at: Date;

  merchant_id?: string; // Optional foreign key to Merchant
  customer_id?: string; // Optional foreign key to Customer
  admin_id?: string; // Optional foreign key to Admin
  transaction_id?: string; // Optional foreign key to Transaction
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
