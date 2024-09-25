// Manages merchant-related actions
import { Request, Response } from "express";
import * as merchantService from "../services/merchantService";
import logger from "../utils/logger";

// Merchant View Profile
export const getMerchantProfile = async (req: Request, res: Response) => {
    try {
        const merchantId = req.params.merchant_id || req.body.merchant_id;

        if (!merchantId) {
            return res.status(400).json({ error: "Merchant ID is required" });
        }
        const merchant = await merchantService.getMerchantById(merchantId);
        res.status(200).json(merchant);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Merchant Edit Profile
export const editMerchantProfile = async (req: Request, res: Response) => {
    const id = req.params.id || req.body.merchant_id;
    try {
        const updatedMerchant = await merchantService.updateMerchant(
            id,
            req.body,
            req.file?.buffer
        );
        res.status(200).json(updatedMerchant);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// List All Merchants
export const listAllMerchants = async (req: Request, res: Response) => {
    logger.info("Executing listAllMerchants...");
    try {
        const merchants = await merchantService.getAllMerchants();
        res.status(200).json(merchants);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
