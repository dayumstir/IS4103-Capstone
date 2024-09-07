// Handles authentication-related actions
import { Request, Response } from "express";
import * as authService from "../services/authService";


export const register = async (req: Request, res: Response) => {
    try {
        const customer = await authService.register(req.body);
        res.status(201).json(customer);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};


export const login = async (req: Request, res: Response) => {
    try {
        const token = await authService.login(req.body);
        res.status(200).json({ token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}