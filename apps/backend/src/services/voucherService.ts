// src/services/voucherService.ts
import { IVoucher } from "@repo/interfaces";
import * as voucherRepository from "../repositories/voucherRepository";
import logger from "../utils/logger";
import { NotFoundError, BadRequestError } from "../utils/error";

// Create Voucher
export const createVoucher = async (voucherData: IVoucher, admin_id: string) => {
    logger.info(`Creating voucher by admin: ${admin_id}`, admin_id);

    const voucher = await voucherRepository.createVoucher({
        ...voucherData,
        created_by_admin: admin_id
    });

    return voucher;
};

// Assign Voucher
export const assignVoucher = async (voucher_id: string, customer_id: string) => {
    logger.info(`Assigning voucher: ${voucher_id} to customer: ${customer_id}`, voucher_id, customer_id);

    const voucher = await voucherRepository.getVoucherById(voucher_id);
    if (!voucher) {
        throw new NotFoundError("Voucher not found");
    }

    if (!voucher.is_active) {
        throw new BadRequestError("Voucher is inactive");
    }

    return await voucherRepository.assignVoucher(voucher_id, customer_id, voucher.usage_limit);
};

// Deactivate Voucher
export const deactivateVoucher = async (voucher_id: string) => {
    logger.info(`Deactivating voucher: ${voucher_id}`, voucher_id);

    const voucher = await voucherRepository.deactivateVoucher(voucher_id);
    if (!voucher) {
        throw new NotFoundError("Voucher not found");
    }

    return voucher;
};

// View All Vouchers
export const getAllVouchers = async () => {
    logger.info("Fetching all vouchers");
    return await voucherRepository.getAllVouchers();;
};

// Search Voucher
export const searchVoucher = async (searchTerm: string) => {
    logger.info(`Searching vouchers with term: ${searchTerm}`, searchTerm);
    return await voucherRepository.searchVoucher(searchTerm);
};

// View Voucher Details
export const getVoucherDetails = async (voucher_id: string) => {
    logger.info(`Fetching voucher details for: ${voucher_id}`, voucher_id);

    const voucher = await voucherRepository.getVoucherDetails(voucher_id);
    if (!voucher) {
        throw new NotFoundError("Voucher not found");
    }

    return voucher;
};

// Get Customer Vouchers
export const getCustomerVouchers = async (customer_id: string) => {
    logger.info(`Fetching vouchers for customer: ${customer_id}`, customer_id);
    return await voucherRepository.getCustomerVouchers(customer_id);
};

// Use Voucher
export const useVoucher = async (voucher_assigned_id: string) => {
    logger.info(`Using voucher: ${voucher_assigned_id}`, voucher_assigned_id);

    const voucherAssigned = await voucherRepository.useVoucher(voucher_assigned_id);
    
    return voucherAssigned;
};
