import { Request, Response } from "express";
import * as voucherService from '../services/voucherService';
import logger from "../utils/logger";


// Create Voucher
export const createVoucher = async (req: Request, res: Response) => {
    logger.info("Executing createVoucher...");
    try {
        // Extract admin_id from req.admin (populated by the middleware)
        const admin_id = req.admin_id;
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


// Assign Voucher to a customer
export const assignVoucher = async (req: Request, res: Response) => {
    logger.info('Executing assignVoucher...');
    try {
        const { voucher_id, customer_id } = req.body;

        const voucherAssignment = await voucherService.assignVoucher(voucher_id, customer_id);
        res.status(200).json(voucherAssignment);
    } catch (error: any) {
        logger.error("An error occurred:", error);
        res.status(500).json({ error: error.message });
    }
};


// Deactivate Voucher
export const deactivateVoucher = async (req: Request, res: Response) => {
    logger.info("Executing deactivateVoucher...");
    try {
        const { voucher_id } = req.params;

        const voucher = await voucherService.deactivateVoucher(voucher_id);
        res.status(200).json({ message: "Voucher deactivated successfully", voucher });
    } catch (error: any) {
        logger.error("An error occurred:", error);
        res.status(500).json({ error: error.message });
    }
};


// View All Vouchers
export const getAllVouchers = async (req: Request, res: Response) => {
    logger.info("Executing getAllVouchers...");
    try {
        const { search } = req.query;

        let vouchers;
        if (search) {
            vouchers = await voucherService.searchVoucher(search as string);
        } else {
            vouchers = await voucherService.getAllVouchers();
        }

        res.status(200).json(vouchers);
    } catch (error: any) {
        logger.error("An error occurred:", error);
        res.status(500).json({ error: error.message });
    }
};


// Search Voucher
export const searchVoucher = async (req: Request, res: Response) => {
    logger.info("Executing searchVoucher...");
    try {
        const { searchTerm } = req.query;

        const vouchers = await voucherService.searchVoucher(searchTerm as string);
        res.status(200).json(vouchers);
    } catch (error: any) {
        logger.error("An error occurred:", error);
        res.status(500).json({ error: error.message });
    }
};


// View Voucher Details
export const getVoucherDetails = async (req: Request, res: Response) => {
    logger.info("Executing getVoucherDetails...");
    try {
        const { voucher_id } = req.params;

        const voucher = await voucherService.getVoucherDetails(voucher_id);
        res.status(200).json(voucher);
    } catch (error: any) {
        logger.error("An error occurred:", error);
        res.status(500).json({ error: error.message });
    }
};
