// packages/interfaces/cashbackWalletInterface.ts
import { ICustomer } from "./customerInterface";
import { IMerchant } from "./merchantInterface";
import { IInstalmentPayment } from "./instalmentPaymentInterface";

export interface ICashbackWallet {
    cashback_wallet_id: string;
    amount: number;

    customer_id: string;
    customer: ICustomer;

    merchant_id: string; // Can only be used at this merchant
    merchant: IMerchant;

    instalment_payment_id?: string;
    instalment_payment?: IInstalmentPayment;
}
