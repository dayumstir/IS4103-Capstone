// Defines the structure of a transaction object

export interface ITransaction {
  transaction_id: number;
  amount: number;
  date: Date;
  status: string;
  customer_id: number;
  merchant_id: number;
  merchant_payment_id: number;
  installment_plan_id: number;
}
