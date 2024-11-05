// Handles database operations related to withdrawal Fee Rate
import { prisma } from "./db";
import { IWithdrawalFeeRate } from "@repo/interfaces/withdrawalFeeRateInterface";

// Create a new withdrawal Fee Rate in db
export const createWithdrawalFeeRate= async (
    merchant_size_id: string,
    withdrawalFeeRateData: Omit<IWithdrawalFeeRate, "merchantSize">
) => {
    return prisma.withdrawalFeeRate.create({
        data: {
            ...withdrawalFeeRateData, 
            merchant_size_id
        },
    });
};

// Find all withdrawal Fee Rate in db
export const findAllWithdrawalFeeRate = async () => {
    return prisma.withdrawalFeeRate.findMany({
        orderBy: {
            monthly_revenue_max: "asc",
        },
    });
};

// Find withdrawal Fee Rate by id (unique attribute) in db
export const findWithdrawalFeeRateById = async (withdrawal_fee_rate_id: string) => {
    return prisma.withdrawalFeeRate.findUnique({
        where: { withdrawal_fee_rate_id: withdrawal_fee_rate_id },
    });
};

// Update withdrawal Fee Rate in db
export const updateWithdrawalFeeRate = async (
    withdrawal_fee_rate_id: string,
    updateData: Partial<IWithdrawalFeeRate>
) => {
    return prisma.withdrawalFeeRate.update({
        where: { withdrawal_fee_rate_id: withdrawal_fee_rate_id },
        data: {
            ...updateData,
        },
    });
};


export const deleteWithdrawalFeeRate = async (
    withdrawal_fee_rate_id: string,
) => {
    return prisma.withdrawalFeeRate.delete({
        where: { withdrawal_fee_rate_id: withdrawal_fee_rate_id },
    });
};

