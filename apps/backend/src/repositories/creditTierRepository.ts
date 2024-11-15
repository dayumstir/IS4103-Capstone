// Handles database operations related to credit tiers
import { prisma } from "./db";
import { ICreditTier } from "../interfaces/creditTierInterface";

// Create a new credit tier in db
export const createCreditTier = async (creditTierData: Omit<ICreditTier, "instalment_plans">) => {
    return prisma.creditTier.create({
        data: {
            ...creditTierData,
        },
    });
};

// Find all credit tiers in db
export const findAllCreditTiers = async () => {
    return prisma.creditTier.findMany({
        orderBy: {
            min_credit_score: "asc",
        },
        include: {
            instalment_plans: {
                orderBy: {
                    name: "asc",
                },
            },
        },
    });
};

// Find credit tier by id (unique attribute) in db
export const findCreditTierById = async (credit_tier_id: string) => {
    return prisma.creditTier.findUnique({
        where: { credit_tier_id: credit_tier_id },
    });
};

// Find credit tier by id (unique attribute) in db
export const findCreditTierByScore = async (credit_score: number) => {
    console.log(credit_score);
    console.log("hello");
    return prisma.creditTier.findMany({
        where: {
            min_credit_score: { lte: credit_score },
            max_credit_score: { gte: credit_score },
        },
    });
};

// Update credit tier in db
export const updateCreditTier = async (
    credit_tier_id: string,
    updateData: Omit<ICreditTier, "instalment_plans">
) => {
    return prisma.creditTier.update({
        where: { credit_tier_id: credit_tier_id },
        data: {
            ...updateData,
        },
    });
};

// Delete credit tier in db
export const deleteCreditTier = async (credit_tier_id: string) => {
    return prisma.creditTier.delete({
        where: { credit_tier_id: credit_tier_id },
    });
};
