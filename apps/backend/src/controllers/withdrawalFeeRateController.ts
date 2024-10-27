// Manages withdrawal Fee Rate related actions
import { Request, Response } from "express";
import * as withdrawalFeeRateService from "../services/withdrawalFeeRateService";
import logger from "../utils/logger";

// Create Withdrawal Fee Rate
export const createWithdrawalFeeRate = async (req: Request, res: Response) => {
    try {
        const withdrawalFeeRate = await withdrawalFeeRateService.createWithdrawalFeeRate(
            req.body
        );
        res.status(201).json(withdrawalFeeRate);
    } catch (error: any) {
        logger.error(`Error in createWithdrawalFeeRate: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

// Get All Withdrawal Fee Rate
export const getAllWithdrawalFeeRate  = async (req: Request, res: Response) => {
    try {
        const withdrawalFeeRates =
            await withdrawalFeeRateService.getAllWithdrawalFeeRate();
        res.status(200).json(withdrawalFeeRates);
    } catch (error: any) {
        logger.error(`Error in createWithdrawalFeeRate: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

// Get Withdrawal Fee Rate
export const getWithdrawalFeeRate  = async (req: Request, res: Response) => {
    try {
        const withdrawalFeeRate =
            await withdrawalFeeRateService.getWithdrawalFeeRateById(
                req.params.withdrawal_fee_rate_id
            );
        res.status(200).json(withdrawalFeeRate);
    } catch (error: any) {
        logger.error(`Error in getWithdrawalFeeRate : ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

// Edit Withdrawal Fee Rate
export const editWithdrawalFeeRate = async (req: Request, res: Response) => {
    try {
        const updatedWithdrawalFeeRate = 
            await withdrawalFeeRateService.updateWithdrawalFeeRate(
                req.params.withdrawal_fee_rate_id,
                req.body
            );
        res.status(200).json(updatedWithdrawalFeeRate);
    } catch (error: any) {
        logger.error(`Error in editWithdrawalFeeRate: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};
