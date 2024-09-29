import { prisma } from "./db";
import { IVoucher } from "../interfaces/voucherInterface";
import { IVoucherAssigned } from "../interfaces/voucherAssignedInterface";
import { VoucherStatus } from "../interfaces/voucherStatusInterface";


// Admin Create Voucher
export const createVoucher = async (voucherData: IVoucher) => {
    return await prisma.voucher.create({ 
        data: voucherData
    });
}; 


// Admin Assign Voucher
export const assignVoucher = async (voucher_id: string, customer_id: string) => {
    return await prisma.voucherAssigned.create({
        data: {
            status: VoucherStatus.AVAILABLE,
            voucher_id,
            customer_id,
            used_installment_payment_id: "Placeholder"
        }
    });
};


// Admin Remove Voucher
export const removeVoucher = async (voucher_id: string) => {
    // First, change the status in all related voucherAssigned entities
    await prisma.voucherAssigned.updateMany({
        where: { voucher_id },
        data: { status: VoucherStatus.UNAVAILABLE },
    });

    // Then, delete the voucher itself
    return await prisma.voucher.delete({
        where: { voucher_id },
    });
};


// Get all vouchers
export const getAllVouchers = async () => {
    return await prisma.voucher.findMany();
};


// Search for voucher by title or description
export const searchVoucher = async (searchTerm: string) => {
    return await prisma.voucher.findMany({
        where: {
            OR: [
                { title: { contains: searchTerm, mode: "insensitive" } },
                { description: { contains: searchTerm, mode: "insensitive" } },
            ],
        },
    });
};


// Get voucher details, including all customers assigned to the voucher
export const getVoucherDetails = async (voucher_id: string) => {
    return await prisma.voucher.findUnique({
        where: { voucher_id },
        include: {
            vouchersAssigned: {
                include: {
                    customer: true, // Include customer details
                },
            },
        },
    });
};
