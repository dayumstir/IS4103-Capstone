// Manages Merchant Size related actions
import { Request, Response } from "express";
import * as merchantSizeService from "../services/merchantSizeService";
import logger from "../utils/logger";

// Create Merchant Size
export const createMerchantSize = async (req: Request, res: Response) => {
    try {
        const merchantSize = await merchantSizeService.createMerchantSize(
            req.body
        );
        res.status(201).json(merchantSize);
    } catch (error: any) {
        logger.error(`Error in createMerchantSize: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

// Get All Merchant Size
export const getAllMerchantSize  = async (req: Request, res: Response) => {
    try {
        const merchantSizes =
            await merchantSizeService.getAllMerchantSize();

        res.status(200).json(merchantSizes);
    } catch (error: any) {
        logger.error(`Error in createMerchantSize: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

// Get Merchant Size
export const getMerchantSize  = async (req: Request, res: Response) => {
    try {
        const merchantSize =
            await merchantSizeService.getMerchantSizeById(
                req.params.merchant_size_id
            );
        res.status(200).json(merchantSize);
    } catch (error: any) {
        logger.error(`Error in getMerchantSize : ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

// Edit Merchant Size
export const editMerchantSize = async (req: Request, res: Response) => {
    try {
        const updatedMerchantSize = 
            await merchantSizeService.updateMerchantSize(
                req.params.merchant_size_id,
                req.body
            );
        res.status(200).json(updatedMerchantSize);
    } catch (error: any) {
        logger.error(`Error in editMerchantSize: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};
