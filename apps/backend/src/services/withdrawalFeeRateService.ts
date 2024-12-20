// Contains the business logic related to Withdrawal Fee Rate
import { IWithdrawalFeeRate } from "@repo/interfaces/withdrawalFeeRateinterface";
import * as withdrawalFeeRepository from "../repositories/withdrawalFeeRateRepository";
import logger from "../utils/logger";

export const createWithdrawalFeeRate = async (
    merchant_size_id: string,
    withdrawalFeeRateData: Omit<IWithdrawalFeeRate, "merchantSize">
) => {
    logger.info("Executing createWithdrawalFeeRate...");
    const withdrawalFeeRate =
        await withdrawalFeeRepository.createWithdrawalFeeRate(merchant_size_id, withdrawalFeeRateData);
    return withdrawalFeeRate;
};

export const getAllWithdrawalFeeRate  = async () => {
    logger.info("Executing AllWithdrawalFeeRate...");
    const withdrawalFeeRate =
        await withdrawalFeeRepository.findAllWithdrawalFeeRate();
    return withdrawalFeeRate;
};

export const getWithdrawalFeeRateById = async (withdrawal_fee_rate_id: string) => {
    logger.info("Executing getWithdrawalFeeRateById...");
    const withdrawalFeeRate =
        await withdrawalFeeRepository.findWithdrawalFeeRateById(
            withdrawal_fee_rate_id
        );
    if (!withdrawalFeeRate) {
        throw new Error("Withdrawal Fee Rate not found");
    }
    return withdrawalFeeRate;
};

export const updateWithdrawalFeeRate = async (
    withdrawal_fee_rate_id: string,
    updateData: Partial<IWithdrawalFeeRate>
) => {
    logger.info("Executing updateWithdrawalFeeRate..");
    const withdrawalFeeRate = await withdrawalFeeRepository.updateWithdrawalFeeRate(
        withdrawal_fee_rate_id,
        updateData
    );
    if (!withdrawalFeeRate) {
        throw new Error("withdrawalFeeRate not found");
    }
    return withdrawalFeeRate;
};

// Delete WithdrawalFeeRate
export const deleteWithdrawalFeeRate = async (withdrawal_fee_rate_id: string) => {
    logger.info(`Delete withdrawal fee rate: ${withdrawal_fee_rate_id}`, withdrawal_fee_rate_id);

    const withdrawalFeeRate = await withdrawalFeeRepository.deleteWithdrawalFeeRate(withdrawal_fee_rate_id);
    if (!withdrawalFeeRate) {
        throw new Error("withdrawalFeeRate not found");
    }

    return withdrawalFeeRate;
};
