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
export const findInstalmentPaymentById = async (instalment_payment_id: string) => {
    return prisma.instalmentPayment.findUnique({
      where: { instalment_payment_id: instalment_payment_id },
        include: {
            transaction: {
                include: {
                    merchant: true,
                },
            },
        },
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
                    instalment_plan: true,
                },
            },
        },
    });
};

// Update instalment payment in db
export const updateInstalmentPayment = async (
    instalment_payment_id: string,
    updateData: Partial<IInstalmentPayment>
  ) => {
    const {
      voucher_assigned_id,
      cashback_wallet_id,
      ...otherUpdateData
    } = updateData;
  
    // Prepare the data object for the update
    const dataToUpdate: any = {
      ...otherUpdateData,
    };
  
    // Conditionally include the voucher_assigned update
    if (voucher_assigned_id) {
      dataToUpdate.voucher_assigned = { connect: { voucher_assigned_id } };
    }
  
    // Conditionally include the cashback_wallet update
    if (cashback_wallet_id) {
      dataToUpdate.cashback_wallet = { connect: { cashback_wallet_id } };
    }
  
    return await prisma.instalmentPayment.update({
      where: { instalment_payment_id },
      data: dataToUpdate,
    });
  };

// Find all instalment payments by transaction_id
export const findInstalmentPaymentsByTransactionId = async (transaction_id: string) => {
    return prisma.instalmentPayment.findMany({
        where: { transaction_id },
    });
};
