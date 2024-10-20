// src/services/topUpService.ts
import * as topUpRepository from "../repositories/topUpRepository";
import logger from "../utils/logger";

// Create a new top-up record
export const createTopUp = async (customer_id: string, amount: number) => {
    logger.info(`Creating top-up record for customer: ${customer_id}`);

    const topUpRecord = await topUpRepository.createTopUp(customer_id, amount);

    return topUpRecord;
};

// Get all top-up records by Customer ID
export const getTopUpByCustomerId = async (customer_id: string) => {
    logger.info(`Fetching top-up records for customer: ${customer_id}`);

    const topUpRecords = await topUpRepository.getTopUpByCustomerId(customer_id);

    return topUpRecords;
};
