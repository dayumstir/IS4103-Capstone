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

// Get Merchant Payments
export const getMerchantPayments = async (search: string) => {
    const payments = await prisma.merchantPayment.findMany({
        where: {
            OR: [
                {
                    merchant: {
                        name: { contains: search, mode: "insensitive" },
                    },
                },
                {
                    merchant: {
                        email: { contains: search, mode: "insensitive" },
                    },
                },
                {
                    total_amount_from_transactions: {
                        equals: parseFloat(search) || undefined,
                    },
                },
                {
                    final_payment_amount: {
                        equals: parseFloat(search) || undefined,
                    },
                },
            ],
        },
        include: {
            merchant: true,
        },
    });
    return payments;
};

// Get Merchant Payment by ID
export const getMerchantPaymentById = async (merchant_payment_id: string) => {
    const payment = await prisma.merchantPayment.findUnique({
        where: { merchant_payment_id },
    });
    return payment;
};

// Update Merchant Payment
export const updateMerchantPayment = async (
    merchant_payment_id: string,
    paymentData: Partial<Omit<IMerchantPayment, "merchant">>
) => {
    const payment = await prisma.merchantPayment.update({
        where: { merchant_payment_id },
        data: {
            ...paymentData,
            evidence: {
                set: paymentData.evidence
                    ? Buffer.from(paymentData.evidence)
                    : undefined,
            },
        },
    });
    return payment;
};
