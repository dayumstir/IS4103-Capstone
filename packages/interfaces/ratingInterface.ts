// packages/interfaces/ratingInterface.ts
export interface IRating {
  rating_id: string;
  title: string;
  description: string;
  rating: string;

  created_at: Date;

  transaction_id?: string;
}