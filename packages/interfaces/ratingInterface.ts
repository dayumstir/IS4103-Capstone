// packages/interfaces/ratingInterface.ts
import { ITransaction } from "./transactionInterface";

export interface IRating {
  rating_id: string;
  title: string;
  description: string;
  rating: string;

  created_at: Date;

  transaction_id?: string;
  transaction?: ITransaction;
}