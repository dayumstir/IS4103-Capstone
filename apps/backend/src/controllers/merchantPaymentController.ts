// Manages merchant payment related actions
import { Request, Response } from "express";
import * as merchantPaymentService from "../services/merchantPaymentService";

// Create Merchant Payment
export const createMerchantPayment = async (req: Request, res: Response) => {
    try {
        const merchant_id = req.merchant_id;

        if (!merchant_id) {
            return res.status(400).json({ error: "merchant_id is required" });
        }

        const merchantPayment =
            await merchantPaymentService.createMerchantPayment(
                merchant_id,
                req.body
            );
        res.status(200).json(merchantPayment);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
