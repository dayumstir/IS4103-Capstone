// packages/interfaces/ratingInterface.ts
import { TransactionResult } from "./transactionInterface";

export interface IRating {
  rating_id: string;
  title: string;
  description: string;
  rating: string;

  createdAt: Date;

  transaction_id?: string;
  transaction?: TransactionResult;
}