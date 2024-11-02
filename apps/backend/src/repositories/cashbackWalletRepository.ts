// app/backend/src/repositories/cashbackWalletRepository.ts
import { prisma } from "./db";

// Create Cashback Wallet
export const createCashbackWallet = async (customer_id: string, merchant_id: string) => {
    return await prisma.cashbackWallet.create({ 
        data: {
            customer_id,
            merchant_id
        }
    });
};

// Update Cashback Wallet balance
export const updateCashbackWalletBalance = async (cashback_wallet_id: string, amount: number) => {
    return await prisma.cashbackWallet.update({
        where: { cashback_wallet_id},
        data: {
            wallet_balance: {
                increment: amount
            },
        },
    });
};

// Get Cashback Wallets by customer_id
export const getCashbackWalletsByCustomerId = async (customer_id: string) => {
    return await prisma.cashbackWallet.findMany({
        where: { customer_id },
        include: {
            merchant: true
        },
    });
};

// Get Cashback Wallet by customer_id and merchant_id
export const getCashbackWalletByCustomerAndMerchant = async (customer_id: string, merchant_id: string) => {
    return await prisma.cashbackWallet.findFirst({
        where: { customer_id, merchant_id },
    });
};
