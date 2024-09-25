// Manages instalment plan-related actions
import { Request, Response } from "express";
import * as disputeService from "../services/disputeService";

// Create Dispute
export const createDispute = async (req: Request, res: Response) => {
    try {
        const dispute = await disputeService.createDispute(req.body);
        res.status(201).json(dispute);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
