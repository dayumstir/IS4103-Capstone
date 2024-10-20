// interfaces/topUpInterface.ts
export interface ITopUp {
    topUp_id: string;
    amount: number;

    createdAt: Date;

    customer_id: string;
}
