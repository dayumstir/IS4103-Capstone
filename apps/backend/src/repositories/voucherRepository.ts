import { prisma } from "./db";
import { IVoucher } from "../interfaces/voucherInterface";
import { VoucherStatus } from "../interfaces/voucherStatusInterface";


// Create Voucher
export const createVoucher = async (voucherData: IVoucher) => {
    return await prisma.voucher.create({ 
        data: voucherData
    });
}; 


// Get all vouchers
export const getAllVouchers = async () => {
    return await prisma.voucher.findMany();
};


// Get voucher by id
export const getVoucherById = async(voucher_id: string) => {
    return await prisma.voucher.findUnique({
        where: { voucher_id },
    });
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


// Assign Voucher to Customer
export const assignVoucher = async (voucher_id: string, customer_id: string, usage_limit: number) => {
    return await prisma.voucherAssigned.create({
        data: {
            status: VoucherStatus.AVAILABLE,
            voucher_id,
            customer_id,
            remaining_uses: usage_limit,
            used_installment_payment_id: "Placeholder"
        }
    });
};


// Deactivate Voucher
export const deactivateVoucher = async (voucher_id: string) => {
    await prisma.voucher.update({
        where: { voucher_id },
        data: { is_active: false }  // Deactivate the voucher
    });

    return await prisma.voucherAssigned.updateMany({
        where: { voucher_id },
        data: { status: VoucherStatus.UNAVAILABLE}  // Set all assigned vouchers to UNAVAILABLE
    });
};


// Get Customer Vouchers
export const getCustomerVouchers = async (customer_id: string) => {
    return await prisma.voucherAssigned.findMany({
        where: { customer_id },
        include: {
            voucher: true, // Include voucher details
        },
    });
};
