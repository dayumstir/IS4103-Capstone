// Defines the structure of a transaction object


export interface ITransaction {
    transaction_id: string;
    amount: number;
    date: Date;
    status: string;   // TODO: Implement as enum
    customer_id: string;
    merchant_id: string;
    merchant_payment_id: string;
    installment_plan_id: string;
}
