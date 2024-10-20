// src/repositories/paymentHistoryRepository.ts
import { prisma } from "./db";
import { PaymentType } from "@repo/interfaces";

// Create Payment History
export const createPaymentHistory = async (customer_id: string, amount: number, payment_type: PaymentType) => {
    return await prisma.paymentHistory.create({
        data: {
            customer_id,
            amount,
            payment_type,
        }
    });
};

// Get all payment history records by Customer ID
export const getPaymentHistoryByCustomerId = async (customer_id: string) => {
    return await prisma.paymentHistory.findMany({
        where: { customer_id },
        orderBy: { payment_date: "desc" }
    });
};
