// packages/interfaces/paymentHistoryInterface.ts
export interface IPaymentHistory {
    payment_history_id: string;
    amount: number;
    payment_date: Date;
    payment_type: PaymentType;

    customer_id: string;
}

export enum PaymentType {
    TOP_UP = "TOP_UP",
    INSTALMENT_PAYMENT = "INSTALMENT_PAYMENT",
    REFUND = "REFUND",
    OTHER = "OTHER",
}
