// Contains the business logic related to credit tiers
import { ICreditTier } from "../interfaces/creditTierInterface";
import * as creditTierRepository from "../repositories/creditTierRepository";
import logger from "../utils/logger";

export const createCreditTier = async (creditTierData: ICreditTier) => {
    logger.info("Executing createCreditTier...");
    const creditTier = await creditTierRepository.createCreditTier(creditTierData);
    return creditTier;
};

export const getAllCreditTiers = async () => {
    logger.info("Executing getAllCreditTiers...");
    const creditTiers = await creditTierRepository.findAllCreditTiers();
    return creditTiers;
};

export const getCreditTierById = async (credit_tier_id: string) => {
    logger.info("Executing getCreditTierById...");
    const creditTier = await creditTierRepository.findCreditTierById(credit_tier_id);
    if (!creditTier) {
        throw new Error("Credit Tier not found");
    }
    return creditTier;
};

export const getCreditTierByScore = async (credit_score: number) => {
    logger.info("Executing getCreditTierByScore...");
    const creditTier = await creditTierRepository.findCreditTierByScore(credit_score);
    if (!creditTier) {
        throw new Error("Credit Tier not found");
    }
    if (creditTier.length > 1) {
        throw new Error(`More than 1 credit tier found that match credit score [${credit_score}]`);
    }
    return creditTier[0];
};

export const updateCreditTier = async (
    credit_tier_id: string,
    updateData: Omit<ICreditTier, "instalment_plans">
) => {
    logger.info("Executing updateCreditTier...");
    const creditTier = await creditTierRepository.updateCreditTier(credit_tier_id, updateData);
    if (!creditTier) {
        throw new Error("Credit Tier not found");
    }
    return creditTier;
};

export const deleteCreditTier = async (credit_tier_id: string) => {
    logger.info("Executing deleteCreditTier...");
    await creditTierRepository.deleteCreditTier(credit_tier_id);
};
