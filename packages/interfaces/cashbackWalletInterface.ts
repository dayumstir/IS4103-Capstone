import { ICustomer } from "./customerInterface";
import { IMerchant } from "./merchantInterface";

export interface ICashbackWallet {
    cashbackWalletId: string;
    balance: number;

    customerId: string;
    customer: ICustomer;

    merchantId: string; // Can only be used at this merchant
    merchant: IMerchant;
}
