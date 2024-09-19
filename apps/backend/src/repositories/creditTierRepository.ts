// Handles database operations related to credit tiers
import { prisma } from "./db";
import { ICreditTier } from "../interfaces/creditTierInterface";

// Create a new credit tier in db
export const createCreditTier = async (creditTierData: ICreditTier) => {
    return prisma.creditTier.create({ data: creditTierData });
};

// Find all credit tiers in db
export const findAllCreditTiers = async () => {
    return prisma.creditTier.findMany({
        orderBy: {
            min_credit_score: "asc",
        },
    });
};

// Find credit tier by id (unique attribute) in db
export const findCreditTierById = async (credit_tier_id: string) => {
    return prisma.creditTier.findUnique({
        where: { credit_tier_id: credit_tier_id },
    });
};

// Update credit tier in db
export const updateCreditTier = async (
    credit_tier_id: string,
    updateData: Partial<ICreditTier>
) => {
    return prisma.creditTier.update({
        where: { credit_tier_id: credit_tier_id },
        data: updateData,
    });
};
