// packages/interfaces/cashbackWalletInterface.ts
import { ICustomer } from "./customerInterface";
import { IMerchant } from "./merchantInterface";
import { IInstalmentPayment } from "./instalmentPaymentInterface";

export interface ICashbackWallet {
    cashback_wallet_id: string;
    wallet_balance: number;

    createdAt: Date;
    updatedAt: Date;

    customer_id: string;
    customer: ICustomer;
    merchant_id: string;
    merchant: IMerchant;
    instalment_payments: IInstalmentPayment[];
}
