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
