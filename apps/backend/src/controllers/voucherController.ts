// app/backend/src/controllers/voucherController.ts
import { Request, Response, NextFunction } from "express";
import * as voucherService from '../services/voucherService';
import * as customerService from '../services/customerService';
import logger from "../utils/logger";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../utils/error";

// Create Voucher
export const createVoucher = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing createVoucher...");
    const { admin_id } = req;

    if (!admin_id) {
        return next(new UnauthorizedError("Unauthorized: admin_id is missing"));
    }

    try {
        const voucher = await voucherService.createVoucher(req.body, admin_id);
        res.status(201).json(voucher);
    } catch (error) {
        logger.error("Error during voucher creation:", error);
        next(error);
    }
};

// Assign Voucher to a Customer
export const assignVoucher = async (req: Request, res: Response, next: NextFunction) => {
    logger.info('Executing assignVoucher...');
    const { voucher_id, email } = req.body;
    if (!voucher_id || !email) {
        return next(new BadRequestError("voucher_id and customer_email are required"));
    }

    try {
        const customer = await customerService.getCustomerByEmail(email);
        if (!customer) {
            return next(new NotFoundError("Customer not found"));
        }

        const voucherAssigned = await voucherService.assignVoucher(voucher_id, customer.customer_id);
        res.status(201).json(voucherAssigned);
    } catch (error: any) {
        logger.error("Error during voucher assignment:", error);
        if (error.name === "VoucherAlreadyAssigned") {
            return next(new ConflictError("Conflict: Voucher is already assigned to this customer"));
        }
        next(error);
    }
};

// Deactivate Voucher
export const deactivateVoucher = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing deactivateVoucher...");
    const { voucher_id } = req.params;

    if (!voucher_id) {
        return next(new BadRequestError("voucher_id is required"));
    }

    try {
        const voucher = await voucherService.deactivateVoucher(voucher_id);
        res.status(200).json({ message: "Voucher deactivated successfully", voucher });
    } catch (error: any) {
        logger.error("Error during voucher deactivation:", error);
        if (error.name === "VoucherNotFound") {
            return next(new NotFoundError("Voucher does not exist"));
        }
        next(error);
    }
};

// Get All Vouchers
export const getAllVouchers = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing getAllVouchers...");
    try {
        const { search } = req.query;
        const vouchers = search 
            ? await voucherService.searchVoucher(search as string) 
            : await voucherService.getAllVouchers();
        res.status(200).json(vouchers);
    } catch (error) {
        logger.error("Error while retrieving vouchers:", error);
        next(error); 
    }
};

// View Voucher Details
export const getVoucherDetails = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing getVoucherDetails...");
    const { voucher_id } = req.params;

    if (!voucher_id) {
        return next(new BadRequestError("voucher_id is required"));
    }

    try {
        const voucher = await voucherService.getVoucherDetails(voucher_id);
        if (!voucher) {
            return next(new NotFoundError("Voucher does not exist"));
        }
        res.status(200).json(voucher);
    } catch (error) {
        logger.error("Error while retrieving voucher details:", error);
        next(error);
    }
};

// Get Vouchers Assigned to a Customer
export const getCustomerVouchers = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing getCustomerVouchers...");
    const { customer_id } = req.params;

    if (!customer_id) {
        return next(new BadRequestError("customer_id is required"));
    }

    try {
        const voucherAssigned = await voucherService.getCustomerVouchers(customer_id);
        res.status(200).json(voucherAssigned);
    } catch (error) {
        logger.error("Error while retrieving customer vouchers:", error);
        next(error);
    }
};
