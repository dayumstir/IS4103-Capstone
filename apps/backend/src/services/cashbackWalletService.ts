// app/backend/src/services/cashbackWalletService.ts
import * as cashbackWalletRepository from "../repositories/cashbackWalletRepository";
import logger from "../utils/logger";
import { NotFoundError } from "../utils/error";

// Create Cashback Wallet
export const createCashbackWallet = async (customer_id: string, merchant_id: string) => {
    logger.info(`Creating cashback wallet for customer: ${customer_id} and merchant: ${merchant_id}`, customer_id, merchant_id);

    const cashbackWallet = await cashbackWalletRepository.createCashbackWallet(customer_id, merchant_id);

    return cashbackWallet;
};

// Update Cashback Wallet Balance
export const updateCashbackWalletBalance = async (cashback_wallet_id: string, amount: number) => {
    logger.info(`Updating cashback wallet balance: ${cashback_wallet_id} by amount: ${amount}`, cashback_wallet_id, amount);

    const cashbackWallet = await cashbackWalletRepository.updateCashbackWalletBalance(cashback_wallet_id, amount);
    if (!cashbackWallet) {
        throw new NotFoundError("Cashback Wallet not found");
    }

    return cashbackWallet;
};

// Get Cashback Wallets by customer_id
export const getCashbackWalletsByCustomerId = async (customer_id: string) => {
    logger.info(`Fetching cashback wallets for customer: ${customer_id}`, customer_id);
    return await cashbackWalletRepository.getCashbackWalletsByCustomerId(customer_id);
};
