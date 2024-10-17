// Handles database operations related to instalment payments
import { prisma } from "./db";
import {
    IInstalmentPayment,
    InstalmentPaymentStatus,
} from "@repo/interfaces/instalmentPaymentInterface";

// Find all instalment payments in db
export const findAllInstalmentPayments = async () => {
    return prisma.instalmentPayment.findMany({
        orderBy: {
            due_date: "asc",
        },
    });
};

// Find instalment payment by id (unique attribute) in db
export const findInstalmentPaymentById = async (
    instalment_payment_id: string
) => {
    return prisma.instalmentPayment.findUnique({
        where: { instalment_payment_id: instalment_payment_id },
    });
};

export const findCustomerOutstandingInstalmentPayments = async (
    customer_id: string
) => {
    return prisma.instalmentPayment.findMany({
        where: {
            status: InstalmentPaymentStatus.UNPAID,
            transaction: { customer_id: customer_id },
        },
        orderBy: {
            due_date: "asc",
        },
        include: {
            transaction: {
                include: {
                    merchant: true,
                },
            },
        },
    });
};

// Update instalment payment in db
export const updateInstalmentPayment = async (
    instalment_payment_id: string,
    updateData: Omit<IInstalmentPayment, "transaction" | "voucher_assigned">
) => {
    const {
        voucher_assigned_id,
        transaction_id,
        cashback_wallet_id,
        ...otherUpdateData
    } = updateData;

    return await prisma.instalmentPayment.update({
        where: { instalment_payment_id: instalment_payment_id },
        data: {
            ...otherUpdateData,
            transaction: { connect: { transaction_id: transaction_id } },
            voucher_assigned: voucher_assigned_id
                ? { connect: { voucher_assigned_id: voucher_assigned_id } }
                : undefined,
            cashback_wallet: cashback_wallet_id
                ? { connect: { cashback_wallet_id: cashback_wallet_id } }
                : undefined,
        },
    });
};
