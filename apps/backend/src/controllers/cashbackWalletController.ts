// app/backend/src/controllers/cashbackWalletController.ts
import { Request, Response, NextFunction } from "express";
import * as cashbackWalletService from '../services/cashbackWalletService';
import logger from "../utils/logger";
import { BadRequestError, NotFoundError } from "../utils/error";

// Get Cashback Wallets by customer_id
export const getCashbackWalletsByCustomerId = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing getCashbackWalletsByCustomerId...");
    const { customer_id } = req.params;

    if (!customer_id) {
        return next(new BadRequestError("customer_id is required"));
    }

    try {
        const cashbackWallets = await cashbackWalletService.getCashbackWalletsByCustomerId(customer_id);
        res.status(200).json(cashbackWallets);
    } catch (error) {
        logger.error("Error during fetching cashback wallets:", error);
        next(error);
    }
};
