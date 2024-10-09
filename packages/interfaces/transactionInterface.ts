// Defines the structure of a transaction object

import { ICustomer } from "./customerInterface";
import { IInstalmentPayment } from "./instalmentPaymentInterface";
import { IInstalmentPlan } from "./instalmentPlanInterface";
import { IMerchant, IMerchantPayment } from "./merchantInterface";

export interface ITransaction {
    transaction_id: string;
    amount: number;
    date_of_transaction: Date;
    status: TransactionStatus;
    fully_paid_date: Date | null;
    reference_no: string;
    cash_back_percentage: number;

    customer_id: string;
    customer: ICustomer;

    merchant_id: string;
    merchant: IMerchant;

    instalment_plan_id: string;
    instalment_plan: IInstalmentPlan;

    instalment_payments: IInstalmentPayment[];
}

export enum TransactionStatus {
    IN_PROGRESS = "IN_PROGRESS",
    FULLY_PAID = "FULLY_PAID",
}
