// Handles database operations related to instalment plans
import { prisma } from "./db";
import { IInstalmentPlan } from "@repo/interfaces/instalmentPlanInterface";

// Create a new instalment plan in db
export const createInstalmentPlan = async (
    instalmentPlanData: IInstalmentPlan
) => {
    return prisma.instalmentPlan.create({
        data: {
            ...instalmentPlanData,
            credit_tiers: {
                connect: instalmentPlanData.credit_tiers.map((tier) => ({
                    credit_tier_id: tier.credit_tier_id,
                })),
            },
        },
    });
};

// Find all instalment plans in db
export const findAllInstalmentPlans = async () => {
    return prisma.instalmentPlan.findMany({
        orderBy: {
            name: "asc",
        },
        include: {
            credit_tiers: {
                orderBy: {
                    min_credit_score: "asc",
                },
            },
        },
    });
};

// Find instalment plan by id (unique attribute) in db
export const findInstalmentPlanById = async (instalment_plan_id: string) => {
    return prisma.instalmentPlan.findUnique({
        where: { instalment_plan_id: instalment_plan_id },
    });
};

// Update instalment plan in db
export const updateInstalmentPlan = async (
    instalment_plan_id: string,
    updateData: Partial<IInstalmentPlan>
) => {
    return prisma.instalmentPlan.update({
        where: { instalment_plan_id: instalment_plan_id },
        data: {
            ...updateData,
            credit_tiers: {
                set: updateData.credit_tiers?.map((tier) => ({
                    credit_tier_id: tier.credit_tier_id,
                })),
            },
        },
    });
};
