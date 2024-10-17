// Manages instalment plan-related actions
import { Request, Response } from "express";
import * as instalmentPlanService from "../services/instalmentPlanService";
import logger from "../utils/logger";

// Create Instalment Plan
export const createInstalmentPlan = async (req: Request, res: Response) => {
    try {
        const instalmentPlan = await instalmentPlanService.createInstalmentPlan(
            req.body
        );
        res.status(201).json(instalmentPlan);
    } catch (error: any) {
        logger.error(`Error in createInstalmentPlan: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

// Get All Instalment Plans
export const getAllInstalmentPlans = async (req: Request, res: Response) => {
    try {
        const instalmentPlans =
            await instalmentPlanService.getAllInstalmentPlans();
        res.status(200).json(instalmentPlans);
    } catch (error: any) {
        logger.error(`Error in getAllInstalmentPlans: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

// Get Instalment Plan
export const getInstalmentPlan = async (req: Request, res: Response) => {
    try {
        const instalmentPlan =
            await instalmentPlanService.getInstalmentPlanById(
                req.params.instalment_plan_id
            );
        res.status(200).json(instalmentPlan);
    } catch (error: any) {
        logger.error(`Error in getInstalmentPlan: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

// Edit Instalment Plan
export const editInstalmentPlan = async (req: Request, res: Response) => {
    try {
        const updatedInstalmentPlan =
            await instalmentPlanService.updateInstalmentPlan(
                req.params.instalment_plan_id,
                req.body
            );
        res.status(200).json(updatedInstalmentPlan);
    } catch (error: any) {
        logger.error(`Error in editInstalmentPlan: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};
