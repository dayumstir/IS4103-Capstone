// Handles authentication-related actions
import { Request, Response } from "express";
import * as adminAuthService from "../services/adminAuthService";
import logger from "../utils/logger";

export const addAdmin = async (req: Request, res: Response) => {
    try {
        const admin = await adminAuthService.addAdmin(req.body);
        res.status(201).json(admin);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const loginAdmin = async (req: Request, res: Response) => {
    try {
        const token = await adminAuthService.loginAdmin(req.body);
        res.status(200).json({ token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};


export const logoutAdmin  = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }

    try {
        await adminAuthService.logoutAdmin(token);
        return res.status(200).json({ message: 'Logout successful' });
    } catch (error: any) {
        return res.status(500).json({ message: 'Could not log out', error: error.message });
    }
};

export const resetPasswordAdmin = async(req: Request, res: Response) => {
    logger.info('Executing resetPassword...');
    const { email, oldPassword, newPassword } = req.body;

    try {
        await adminAuthService.resetPasswordAdmin(email, oldPassword, newPassword);
        res.status(200).json({ message: "Password reset successful"});
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
