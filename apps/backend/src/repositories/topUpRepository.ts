// src/repositories/topUpRepository.ts
import { prisma } from "./db";

// Create Top Up Record
export const createTopUp = async (customer_id: string, amount: number) => {
    return await prisma.topUp.create({
        data: {
            customer_id,
            amount,
        }
    });
};

// Get top-up record by Customer ID
export const getTopUpByCustomerId = async (customer_id: string) => {
    return await prisma.topUp.findMany({
        where: { customer_id }
    });
};
