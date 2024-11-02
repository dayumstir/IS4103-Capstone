// Contains the business logic related to instalment payments
import { IInstalmentPayment, InstalmentPaymentStatus } from "@repo/interfaces/instalmentPaymentInterface";
import { TransactionStatus } from "@repo/interfaces/transactionInterface";
import * as instalmentPaymentRepository from "../repositories/instalmentPaymentRepository";
import * as transactionRepository from "../repositories/transactionRepository";
import logger from "../utils/logger";

export const getAllInstalmentPayments = async () => {
    logger.info("Executing getAllInstalmentPayments...");
    const instalmentPayments = await instalmentPaymentRepository.findAllInstalmentPayments();
    return instalmentPayments;
};

export const getCustomerOutstandingInstalmentPayments = async (customer_id: string) => {
    logger.info("Executing getCustomerOutstandingInstalmentPayments...");
    const instalmentPayments = await instalmentPaymentRepository.findCustomerOutstandingInstalmentPayments(customer_id);
    return instalmentPayments;
};

export const getInstalmentPayment = async (instalment_payment_id: string) => {
    logger.info("Executing getInstalmentPayment...");
    const instalmentPayment = await instalmentPaymentRepository.findInstalmentPaymentById(instalment_payment_id);
    if (!instalmentPayment) {
        throw new Error("Instalment Payment not found");
    }
    return instalmentPayment;
};

export const editInstalmentPayment = async (
    instalment_payment_id: string,
    updateData: Partial<IInstalmentPayment>
) => {
    logger.info(`Executing editInstalmentPayment for ID: ${instalment_payment_id}...`);

    // Update the instalment payment
    const updatedInstalmentPayment = await instalmentPaymentRepository.updateInstalmentPayment(
        instalment_payment_id,
        updateData
    );
    if (!updatedInstalmentPayment) {
        throw new Error("Instalment Payment not found");
    }

    // If the status was updated to PAID, check if all payments are now PAID
    if (updateData.status === InstalmentPaymentStatus.PAID) {
        const transaction_id = updatedInstalmentPayment.transaction_id;

        // Fetch all instalment payments for the transaction
        const instalmentPayments = await instalmentPaymentRepository.findInstalmentPaymentsByTransactionId(transaction_id);

        // Check if all instalment payments are PAID
        const allPaid = instalmentPayments.every(
            (payment) => payment.status === InstalmentPaymentStatus.PAID
        );

        if (allPaid) {
            // Update the transaction status to FULLY_PAID
            await transactionRepository.updateTransaction(transaction_id, {
                status: TransactionStatus.FULLY_PAID,
            });
            logger.info(`Transaction ${transaction_id} status updated to FULLY_PAID`);
        }
    }

    return updatedInstalmentPayment;
};
