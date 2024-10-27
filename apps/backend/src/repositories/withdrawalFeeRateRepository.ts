// Handles database operations related to withdrawal Fee Rate
import { prisma } from "./db";
import { IWithdrawalFeeRate } from "@repo/interfaces/withdrawalFeeRateInterface";

// Create a new withdrawal Fee Rate in db
export const createWithdrawalFeeRate= async (
    withdrawalFeeRateData: IWithdrawalFeeRate
) => {
    return prisma.withdrawalFeeRate.create({
        data: {
            ...withdrawalFeeRateData,
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
