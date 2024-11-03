// app/backend/src/services/paymentHistoryService.ts
import logger from "../utils/logger";
import * as paymentHistoryRepository from "../repositories/paymentHistoryRepository";
import { PaymentType } from "@repo/interfaces";

// Create Payment History
export const createPaymentHistory = async (amount: number, payment_type: PaymentType, customer_id: string) => {
    logger.info(
        `Creating payment history for customer ${customer_id} with amount $${amount} and payment type ${payment_type}`
    );
    return await paymentHistoryRepository.createPaymentHistory(amount, payment_type, customer_id);
};

// Get Payment History by Customer ID
export const getPaymentHistoryByCustomerId = async (customer_id: string) => {
    logger.info(`Fetching payment history for customer: ${customer_id}`, customer_id);
    return await paymentHistoryRepository.getPaymentHistoryByCustomerId(customer_id);
};
