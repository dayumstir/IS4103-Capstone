// apps/backend/src/controllers/adminAuthController.ts
import jwt from "jsonwebtoken";

import { Request, Response, NextFunction } from "express";
import * as adminAuthService from "../services/adminAuthService";
import logger from "../utils/logger";
import { BadRequestError } from "../utils/error";

// Admin Login
export const login = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing admin login...");
    try {
        const jwtToken = await adminAuthService.login(req.body);
        
        // TODO: Evaluate if needed
        // Email, admin_type, and forgot_password are used in login screen to determine whether to show reset password modal
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET!) as any;
        const { admin_id, email, admin_type, forgot_password} = decoded;

        res.status(200).json({ jwtToken, admin_id, email, admin_type, forgot_password });
    } catch (error: any) {
        logger.error("Error in admin login:", error);
        next(error);
    }
};

// Admin Logout
export const logout = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing admin logout...");
    const jwtToken = req.headers.authorization?.split(" ")[1];

    if (!jwtToken) {
        return next(new BadRequestError("No token provided"));
    }

    try {
        await adminAuthService.logout(jwtToken);
        res.status(200).json({ message: "Logout successful" });
    } catch (error: any) {
        logger.error("Error in admin logout:", error);
        next(error);
    }
};

// Admin Reset Password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing resetPassword...");
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
        return next(new BadRequestError("Email, old password, and new password are required"));
    }

    try {
        await adminAuthService.resetPassword(email, oldPassword, newPassword);
        res.status(200).json({ message: "Password reset successful" });
    } catch (error: any) {
        logger.error("Error in resetPassword:", error);
        next(error);
    }
};

// Admin Forget Password
export const forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing forgetPassword...");
    const { email } = req.body;

    if (!email) {
        return next(new BadRequestError("Email is required"));
    }

    try {
        await adminAuthService.forgetPassword(email);
        res.status(200).json({ message: "Password reset email sent successfully" });
    } catch (error: any) {
        logger.error("Error in forgetPassword:", error);
        next(error);
    }
};
