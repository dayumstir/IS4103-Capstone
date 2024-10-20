// src/repositories/voucherRepository.ts
import { prisma } from "./db";
import { IVoucher, VoucherAssignedStatus } from "@repo/interfaces";
import { NotFoundError, BadRequestError } from "../utils/error";

// Create Voucher
export const createVoucher = async (voucherData: IVoucher) => {
    return await prisma.voucher.create({ 
        data: voucherData
    });
}; 

// Assign Voucher to Customer
export const assignVoucher = async (voucher_id: string, customer_id: string, usage_limit: number) => {
    return await prisma.voucherAssigned.create({
        data: {
            status: VoucherAssignedStatus.AVAILABLE,
            voucher_id,
            customer_id,
            remaining_uses: usage_limit,
        }
    });
};

// Deactivate Voucher
export const deactivateVoucher = async (voucher_id: string) => {
    const deactivateVoucher = await prisma.voucher.update({
        where: { voucher_id },
        data: { is_active: false }
    });

    await prisma.voucherAssigned.updateMany({
        where: { voucher_id },
        data: { status: VoucherAssignedStatus.UNAVAILABLE }
    });

    return deactivateVoucher;
};

// Get all vouchers
export const getAllVouchers = async () => {
    return await prisma.voucher.findMany();
};

// Search for voucher by title
export const searchVoucher = async (searchTerm: string) => {
    return await prisma.voucher.findMany({
        where: { title: { contains: searchTerm, mode: "insensitive"} },
    });
};

// Get voucher by id
export const getVoucherById = async(voucher_id: string) => {
    return await prisma.voucher.findUnique({
        where: { voucher_id },
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

// Get Customer AssignedVouchers
export const getCustomerVouchers = async (customer_id: string) => {
    return await prisma.voucherAssigned.findMany({
        where: { customer_id },
        include: {
            voucher: true,
        },
    });
};

// Use Voucher
export const useVoucher = async (voucher_assigned_id: string) => {
    return await prisma.$transaction(async (transaction) => {
        const voucherAssigned = await transaction.voucherAssigned.findUnique({
            where: { voucher_assigned_id },
        });

        if (!voucherAssigned) {
            throw new NotFoundError("Voucher not found");
        }

        if (voucherAssigned.status !== VoucherAssignedStatus.AVAILABLE) {
            throw new BadRequestError("Voucher is not available");
        }

        if (voucherAssigned.remaining_uses <= 0) {
            throw new BadRequestError("Voucher has no remaining uses");
        }

        // Decrement remaining uses
        const updatedVoucherAssigned = await transaction.voucherAssigned.update({
            where: { voucher_assigned_id },
            data: { 
                remaining_uses: { decrement: 1 },
            },
        });

        // Update status to USED if no remaining uses
        if (updatedVoucherAssigned.remaining_uses === 0) {
            const finalVoucherAssigned = await transaction.voucherAssigned.update({
                where: { voucher_assigned_id },
                data: { 
                    status: VoucherAssignedStatus.USED 
                },
            });
            return finalVoucherAssigned;
        }

        return updatedVoucherAssigned;
    });
};
