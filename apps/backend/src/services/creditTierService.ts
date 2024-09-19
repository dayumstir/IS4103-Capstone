// Contains the business logic related to credit tiers
import { ICreditTier } from "../interfaces/creditTierInterface";
import * as creditTierRepository from "../repositories/creditTierRepository";
import logger from "../utils/logger";

export const createCreditTier = async (creditTierData: ICreditTier) => {
    logger.info("Executing createCreditTier...");
    const creditTier =
        await creditTierRepository.createCreditTier(creditTierData);
    return creditTier;
};

export const getAllCreditTiers = async () => {
    logger.info("Executing getAllCreditTiers...");
    const creditTiers = await creditTierRepository.findAllCreditTiers();
    return creditTiers;
};

export const getCreditTierById = async (credit_tier_id: string) => {
    logger.info("Executing getCreditTierById...");
    const creditTier =
        await creditTierRepository.findCreditTierById(credit_tier_id);
    if (!creditTier) {
        throw new Error("Credit Tier not found");
    }
    return creditTier;
};

export const updateCreditTier = async (
    credit_tier_id: string,
    updateData: Partial<ICreditTier>
) => {
    logger.info("Executing updateCreditTier...");
    const creditTier = await creditTierRepository.updateCreditTier(
        credit_tier_id,
        updateData
    );
    if (!creditTier) {
        throw new Error("Credit Tier not found");
    }
    return creditTier;
};