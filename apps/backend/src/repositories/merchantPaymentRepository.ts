// Handles database operations related to merchant payments
import { prisma } from "./db";
import { IMerchantPayment } from "@repo/interfaces/merchantPaymentInterface";

// Create Merchant Payment
export const createMerchantPayment = async (
    merchant_id: string,
    paymentData: Omit<IMerchantPayment, "merchant">
) => {
    const payment = await prisma.merchantPayment.create({
        data: { ...paymentData, merchant_id },
    });

    await prisma.merchant.update({
        where: { merchant_id },
        data: {
            wallet_balance: {
                decrement: paymentData.total_amount_from_transactions,
            },
        },
    });

    return payment;
};
