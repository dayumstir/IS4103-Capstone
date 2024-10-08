// Defines the structure of a transaction object

import { ICustomer } from "./customerInterface";
import { IInstalmentPlan } from "./instalmentPlanInterface";
import { IMerchant, IMerchantPayment } from "./merchantInterface";

export interface ITransaction {
    transaction_id: string;
    amount: number;
    date_of_transaction: Date;
    status: string;
    fully_paid_date: Date | null;
    reference_no: string;
    cash_back_percentage: number;

    customer_id: string;
    customer: ICustomer;

    merchant_id: string;
    merchant: IMerchant;

    instalment_plan_id: string;
    instalment_plan: IInstalmentPlan;

    merchant_payment_id?: string;
    merchant_payment?: IMerchantPayment;
}
