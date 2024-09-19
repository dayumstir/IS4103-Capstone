// Contains the business logic related to instalment plans
import { IInstalmentPlan } from "../interfaces/instalmentPlanInterface";
import * as instalmentPlanRepository from "../repositories/instalmentPlanRepository";
import logger from "../utils/logger";

export const createInstalmentPlan = async (
    instalmentPlanData: IInstalmentPlan
) => {
    logger.info("Executing createInstalmentPlan...");
    const instalmentPlan =
        await instalmentPlanRepository.createInstalmentPlan(instalmentPlanData);
    return instalmentPlan;
};

export const getAllInstalmentPlans = async () => {
    logger.info("Executing getAllInstalmentPlans...");
    const instalmentPlans =
        await instalmentPlanRepository.findAllInstalmentPlans();
    return instalmentPlans;
};

export const getInstalmentPlanById = async (instalment_plan_id: string) => {
    logger.info("Executing getInstalmentPlanById...");
    const instalmentPlan =
        await instalmentPlanRepository.findInstalmentPlanById(
            instalment_plan_id
        );
    if (!instalmentPlan) {
        throw new Error("Instalment Plan not found");
    }
    return instalmentPlan;
};

export const updateInstalmentPlan = async (
    instalment_plan_id: string,
    updateData: Partial<IInstalmentPlan>
) => {
    logger.info("Executing updateInstalmentPlan...");
    const instalmentPlan = await instalmentPlanRepository.updateInstalmentPlan(
        instalment_plan_id,
        updateData
    );
    if (!instalmentPlan) {
        throw new Error("Instalment Plan not found");
    }
    return instalmentPlan;
};
