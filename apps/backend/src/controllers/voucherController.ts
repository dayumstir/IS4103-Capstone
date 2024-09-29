import { Request, Response } from "express";
import * as voucherService from '../services/voucherService';
import logger from "../utils/logger";


// Admin Create Voucher
export const createVoucher = async (req: Request, res: Response) => {
    logger.info("Executing createVoucher...");
    try {
        // Extract admin_id from req.admin (populated by the middleware)
        const admin_id = req.admin?.admin_id;
        if (!admin_id) {
            return res.status(401).json({ error: "admin_id is required" });
        }

        // Create the voucher using the admin_id
        const voucher = await voucherService.createVoucher(req.body, admin_id);
        res.status(201).json(voucher);
    } catch (error: any) {
        logger.error("An error occurred:", error);
        res.status(500).json({ error: error.message });
    }
};
