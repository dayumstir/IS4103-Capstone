import { prisma } from "./db";
import { IVoucher } from "../interfaces/voucherInterface";


// Admin Create Voucher
export const createVoucher = async (voucherData: IVoucher) => {
    return await prisma.voucher.create({ 
        data: voucherData
    });
}; 
