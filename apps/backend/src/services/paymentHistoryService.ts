// src/services/paymentHistoryService.ts
import * as paymentHistoryRepository from "../repositories/paymentHistoryRepository";
import logger from "../utils/logger";
import { PaymentType } from "@repo/interfaces";

// Create Payment History
export const createPaymentHistory = async (customer_id: string, amount: number, payment_type: PaymentType) => {
    logger.info(`Creating payment history for customer: ${customer_id}`, customer_id);
    return await paymentHistoryRepository.createPaymentHistory(customer_id, amount, payment_type);
};

// Get Payment History by Customer ID
export const getPaymentHistoryByCustomerId = async (customer_id: string) => {
    logger.info(`Fetching payment history for customer: ${customer_id}`, customer_id);
    return await paymentHistoryRepository.getPaymentHistoryByCustomerId(customer_id);
};
