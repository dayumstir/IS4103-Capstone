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

        const merchantPayment = await merchantPaymentService.createMerchantPayment(
            merchant_id,
            req.body
        );
        res.status(200).json(merchantPayment);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Get Merchant Payments
export const getMerchantPayments = async (req: Request, res: Response) => {
    try {
        const admin_id = req.admin_id;
        if (!admin_id) {
            return res.status(400).json({ error: "admin_id is required" });
        }
        const { search } = req.query;
        const payments = await merchantPaymentService.getMerchantPayments(search as string);
        res.status(200).json(payments);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Get Merchant Payments By Filter
export const getMerchantPaymentsByFilter = async (req: Request, res: Response) => {
    try {
        const payments = await merchantPaymentService.getMerchantPaymentsByFilter(req.body);
        res.status(200).json(payments);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Get Merchant Payment by ID
export const getMerchantPaymentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const payment = await merchantPaymentService.getMerchantPaymentById(id);
        res.status(200).json(payment);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Update Merchant Payment
export const updateMerchantPayment = async (req: Request, res: Response) => {
    const admin_id = req.admin_id;
    if (!admin_id) {
        return res.status(400).json({ error: "admin_id is required" });
    }
    try {
        const { id } = req.params;
        const payment = await merchantPaymentService.updateMerchantPayment(id, req.body);
        res.status(200).json(payment);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Calculate Withdrawal Info
export const calculateWithdrawalInfo = async (req: Request, res: Response) => {
    const merchant_id = req.merchant_id;
    if (!merchant_id) {
        return res.status(400).json({ error: "merchant_id is required" });
    }
    const info =
        await merchantPaymentService.calculateWithdrawalInfo(merchant_id);
    res.status(200).json(info);
};
