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
