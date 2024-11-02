// app/backend.src/repositories/paymentHistoryRepository.ts
import { prisma } from "./db";
import { PaymentType } from "@repo/interfaces";

// Create Payment History
export const createPaymentHistory = async (amount: number, payment_type: PaymentType, customer_id: string) => {
    return await prisma.paymentHistory.create({
        data: {
            amount,
            payment_type,
            customer_id,
        }
    });
};

// Get all payment history records by Customer ID
export const getPaymentHistoryByCustomerId = async (customer_id: string) => {
    return await prisma.paymentHistory.findMany({
        where: { customer_id },
        orderBy: { payment_date: "desc" },
    });
};
