import { IVoucher } from "../interfaces/voucherInterface";
import * as voucherRepository from "../repositories/voucherRepository";
import logger from "../utils/logger";


// Admin Create Voucher
export const createVoucher = async (voucherData: IVoucher, admin_id: string) => {
    logger.info('Executing createVoucher...');

    const voucher = await voucherRepository.createVoucher({
        ...voucherData,
        created_by_admin: admin_id
    });

    return voucher;
};


// Admin Assign Voucher
export const assignVoucher = async (voucher_id: string, customer_id: string) => {
    logger.info('Executing assignVoucher...');

    const voucherAssigned = await voucherRepository.assignVoucher(voucher_id, customer_id);
    return voucherAssigned;
};


// Admin Remove Voucher
export const removeVoucher = async (voucher_id: string) => {
    logger.info("Executing removeVoucher...");

    const voucher = await voucherRepository.removeVoucher(voucher_id);
    return voucher;
};


// Admin View All Vouchers
export const getAllVouchers = async () => {
    logger.info("Executing getAllVouchers...");

    const vouchers = await voucherRepository.getAllVouchers();
    return vouchers;
};


// Admin Search Voucher
export const searchVoucher = async (searchTerm: string) => {
    logger.info("Executing searchVoucher...");

    const vouchers = await voucherRepository.searchVoucher(searchTerm);
    return vouchers;
};


// Admin View Voucher Details
export const getVoucherDetails = async (voucher_id: string) => {
    logger.info("Executing getVoucherDetails...");

    const voucher = await voucherRepository.getVoucherDetails(voucher_id);
    return voucher;
};
