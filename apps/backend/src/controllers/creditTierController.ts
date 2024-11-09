// Manages credit tier-related actions
import { Request, Response } from "express";
import * as creditTierService from "../services/creditTierService";

// Create Credit Tier
export const createCreditTier = async (req: Request, res: Response) => {
    try {
        const creditTier = await creditTierService.createCreditTier(req.body);
        res.status(201).json(creditTier);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Get All Credit Tiers
export const getAllCreditTiers = async (req: Request, res: Response) => {
    try {
        const creditTiers = await creditTierService.getAllCreditTiers();
        res.status(200).json(creditTiers);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Get Credit Tier
export const getCreditTier = async (req: Request, res: Response) => {
    try {
        const creditTier = await creditTierService.getCreditTierById(
            req.params.credit_tier_id
        );
        res.status(200).json(creditTier);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Edit Credit Tier
export const editCreditTier = async (req: Request, res: Response) => {
    try {
        const updatedCreditTier = await creditTierService.updateCreditTier(
            req.params.credit_tier_id,
            req.body
        );
        res.status(200).json(updatedCreditTier);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Delete Credit Tier
export const deleteCreditTier = async (req: Request, res: Response) => {
    try {
        await creditTierService.deleteCreditTier(req.params.credit_tier_id);
        res.status(200).json({ message: "Credit tier deleted successfully" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
