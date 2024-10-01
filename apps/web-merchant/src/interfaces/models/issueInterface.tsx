// Defines the structure of a instalment plan object

import { Sorting } from "../sortingInterface";

export enum IssueStatus {
  PENDING_OUTCOME = "PENDING_OUTCOME",
  RESOLVED = "RESOLVED",
}

export const statusColorMap: Record<IssueStatus, string> = {
  [IssueStatus.PENDING_OUTCOME]: "orange",
  [IssueStatus.RESOLVED]: "green",
};

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
  createFrom?: Date;
  createTo?: Date;
  updateFrom?: Date;
  updateTo?: Date;
}
