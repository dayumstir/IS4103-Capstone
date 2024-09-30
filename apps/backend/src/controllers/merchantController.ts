// Manages merchant-related actions
import { Request, Response } from "express";
import * as merchantService from "../services/merchantService";
import logger from "../utils/logger";


// Merchant View Profile
export const getMerchantProfile = async (req: Request, res: Response) => {
    try {
        const merchant_id = req.params.merchant_id || req.merchant_id;

        if (!merchant_id) {
            return res.status(400).json({ error: "merchant_id is required" });
        }
        const merchant = await merchantService.getMerchantById(merchant_id);
        res.status(200).json(merchant);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};


// Merchant Edit Profile
export const editMerchantProfile = async (req: Request, res: Response) => {
    try {
        const merchant_id = req.params.merchant_id || req.merchant_id;

        if (!merchant_id) {
            return res.status(400).json({ error: "merchant_id is required" });
        }
        const updatedMerchant = await merchantService.updateMerchant(
            merchant_id,
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
    const { search } = req.query;
  try {
    let merchants;
    if (search) {
      merchants = await merchantService.searchMerchants(search as string);
    } else {
      // Get all merchants if no search term is provided
      merchants = await merchantService.getAllMerchants();
    }
    res.status(200).json(merchants);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
