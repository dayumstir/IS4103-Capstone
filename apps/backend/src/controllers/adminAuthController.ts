// Handles authentication-related actions
import { Request, Response } from "express";
import * as adminAuthService from "../services/adminAuthService";
import logger from "../utils/logger";
import jwt from "jsonwebtoken";

export const add = async (req: Request, res: Response) => {
    try {
        const admin = await adminAuthService.add(req.body);
        await adminAuthService.sendEmailVerification(admin.admin.email, admin.admin.username, admin.password);
        res.status(200).json(admin);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const token = await adminAuthService.login(req.body);
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const admin_type = decoded.admin_type;
        const email = decoded.email;
        res.status(200).json({ token, admin_type ,email });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};


export const logout  = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }

    try {
        await adminAuthService.logout(token);
        return res.status(200).json({ message: 'Logout successful' });
    } catch (error: any) {
        return res.status(500).json({ message: 'Could not log out', error: error.message });
    }
};

export const resetPassword = async(req: Request, res: Response) => {
    logger.info('Executing resetPassword...');
    const { email, oldPassword, newPassword } = req.body;

    try {
        await adminAuthService.resetPassword(email, oldPassword, newPassword);
        res.status(200).json({ message: "Password reset successful"});
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
