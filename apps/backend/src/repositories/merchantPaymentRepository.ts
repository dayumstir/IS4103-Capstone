// Handles database operations related to merchant payments
import { prisma } from "./db";
import { IMerchantPayment } from "@repo/interfaces/merchantPaymentInterface";

// Create Merchant Payment
export const createMerchantPayment = async (
    merchant_id: string,
    paymentData: Omit<IMerchantPayment, "merchant">
) => {
    return prisma.merchantPayment.create({
        data: { ...paymentData, merchant_id },
    });
};
