// Contains the business logic related to instalment payments
import {
    IInstalmentPayment,
    InstalmentPaymentStatus,
} from "@repo/interfaces/instalmentPaymentInterface";
import { TransactionStatus } from "@repo/interfaces/transactionInterface";
import * as instalmentPaymentRepository from "../repositories/instalmentPaymentRepository";
import * as transactionRepository from "../repositories/transactionRepository";
import * as cashbackWalletService from "../services/cashbackWalletService";
import logger from "../utils/logger";

export const getAllInstalmentPayments = async () => {
    logger.info("Executing getAllInstalmentPayments...");
    const instalmentPayments =
        await instalmentPaymentRepository.findAllInstalmentPayments();
    return instalmentPayments;
};

export const getCustomerOutstandingInstalmentPayments = async (
    customer_id: string
) => {
    logger.info("Executing getCustomerOutstandingInstalmentPayments...");
    const instalmentPayments =
        await instalmentPaymentRepository.findCustomerOutstandingInstalmentPayments(
            customer_id
        );
    return instalmentPayments;
};

export const getMerchantInstalmentPayments = async (merchant_id: string) => {
    logger.info("Executing getMerchantInstalmentPayments...");
    const instalmentPayments =
        await instalmentPaymentRepository.findMerchantInstalmentPayments(
            merchant_id
        );
    return instalmentPayments;
};

export const getInstalmentPayment = async (instalment_payment_id: string) => {
    logger.info("Executing getInstalmentPayment...");
    const instalmentPayment =
        await instalmentPaymentRepository.findInstalmentPaymentById(
            instalment_payment_id
        );
    if (!instalmentPayment) {
        throw new Error("Instalment Payment not found");
    }
    return instalmentPayment;
};

const awardCashbackToCustomer = async (transaction: any) => {
    logger.info(
        `Awarding cashback for transaction ID: ${transaction.transaction_id}`
    );

    const customer_id = transaction.customer_id;
    const merchant_id = transaction.merchant_id;

    // Get the cashback percentage from the transaction or merchant
    const cashbackPercentage = transaction.cashback_percentage; // Assuming this field exists

    if (!cashbackPercentage || cashbackPercentage <= 0) {
        logger.info(
            `No cashback percentage defined for transaction ID: ${transaction.transaction_id}`
        );
        return;
    }

    // Calculate the cashback amount
    const cashbackAmount = transaction.amount * (cashbackPercentage / 100);

    // Check if the customer already has a cashback wallet with the merchant
    let cashbackWallet =
        await cashbackWalletService.getCashbackWalletByCustomerAndMerchant(
            customer_id,
            merchant_id
        );

    if (cashbackWallet) {
        // Update (top up) the cashback amount in the existing wallet
        await cashbackWalletService.updateCashbackWalletBalance(
            cashbackWallet.cashback_wallet_id,
            cashbackAmount
        );
        logger.info(
            `Updated cashback wallet ${cashbackWallet.cashback_wallet_id} with amount ${cashbackAmount}`
        );
    } else {
        // Create a new cashback wallet for the customer tied to the merchant
        cashbackWallet = await cashbackWalletService.createCashbackWallet(
            customer_id,
            merchant_id
        );
        // Update the wallet balance with the cashback amount
        await cashbackWalletService.updateCashbackWalletBalance(
            cashbackWallet.cashback_wallet_id,
            cashbackAmount
        );
        logger.info(
            `Created new cashback wallet ${cashbackWallet.cashback_wallet_id} and credited amount ${cashbackAmount}`
        );
    }

    // Optionally, record the cashback awarding in payment history or another logging mechanism
};

export const editInstalmentPayment = async (
    instalment_payment_id: string,
    updateData: Partial<IInstalmentPayment>
) => {
    logger.info(
        `Executing editInstalmentPayment for ID: ${instalment_payment_id}...`
    );

    // Update the instalment payment
    const updatedInstalmentPayment =
        await instalmentPaymentRepository.updateInstalmentPayment(
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
        const instalmentPayments =
            await instalmentPaymentRepository.findInstalmentPaymentsByTransactionId(
                transaction_id
            );

        // Check if all instalment payments are PAID
        const allPaid = instalmentPayments.every(
            (payment) => payment.status === InstalmentPaymentStatus.PAID
        );

        if (allPaid) {
            // Update the transaction status to FULLY_PAID
            const updatedTransaction =
                await transactionRepository.updateTransaction(transaction_id, {
                    status: TransactionStatus.FULLY_PAID,
                    fully_paid_date: new Date(),
                });
            logger.info(
                `Transaction ${transaction_id} status updated to FULLY_PAID`
            );

            // Award cashback to the customer
            await awardCashbackToCustomer(updatedTransaction);
        }
    }

    return updatedInstalmentPayment;
};
