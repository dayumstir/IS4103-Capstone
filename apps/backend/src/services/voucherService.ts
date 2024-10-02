// Contains the business logic related to vouchers
import { IVoucher } from "../interfaces/voucherInterface";
import * as voucherRepository from "../repositories/voucherRepository";
import logger from "../utils/logger";


// Create Voucher
export const createVoucher = async (voucherData: IVoucher, admin_id: string) => {
    logger.info('Executing createVoucher...');

    const voucher = await voucherRepository.createVoucher({
        ...voucherData,
        created_by_admin: admin_id
    });

    return voucher;
};


// Assign Voucher
export const assignVoucher = async (voucher_id: string, customer_id: string) => {
    logger.info('Executing assignVoucher...');
    const voucher = await voucherRepository.getVoucherById(voucher_id);
    if (!voucher) {
        throw new Error('Voucher not found');
    }

    if (!voucher.is_active) {
        throw new Error('Voucher is inactive');
    }

    const voucherAssigned = await voucherRepository.assignVoucher(voucher_id, customer_id, voucher.usage_limit);
    return voucherAssigned;
};


// Deactivate Voucher
export const deactivateVoucher = async (voucher_id: string) => {
    logger.info("Executing deactivateVoucher...");
    const voucher = await voucherRepository.deactivateVoucher(voucher_id);
    if (!voucher) {
        throw new Error("Voucher not found");
    }
    return voucher;
};


// View All Vouchers
export const getAllVouchers = async () => {
    logger.info("Executing getAllVouchers...");
    const vouchers = await voucherRepository.getAllVouchers();
    return vouchers;
};


// Search Voucher
export const searchVoucher = async (searchTerm: string) => {
    logger.info("Executing searchVoucher...");
    const vouchers = await voucherRepository.searchVoucher(searchTerm);
    return vouchers;
};


// View Voucher Details
export const getVoucherDetails = async (voucher_id: string) => {
    logger.info("Executing getVoucherDetails...");
    const voucher = await voucherRepository.getVoucherDetails(voucher_id);
    if (!voucher) {
        throw new Error("Voucher not found");
    }
    return voucher;
};
