// Manages merchant-related actions
import { Request, Response } from "express";
import * as merchantService from "../services/merchantService";

// Merchant View Profile
export const getProfile = async (req: Request, res: Response) => {
    try {
        const merchant = await merchantService.getMerchantById(req.body.merchant_id);
        res.status(200).json(merchant);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Merchant Edit Profile
export const editProfile = async (req: Request, res: Response) => {
    try {
        const updatedMerchant = await merchantService.updateMerchant(
            req.body.merchant_id,
            req.body
        );
        res.status(200).json(updatedMerchant);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
