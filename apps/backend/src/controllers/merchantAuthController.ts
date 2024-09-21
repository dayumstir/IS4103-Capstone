// Handles authentication-related actions
import { Request, Response } from "express";
import * as merchantAuthService from "../services/merchantAuthService";

// Merchant Sign Up
export const register = async (req: Request, res: Response) => {
    try {
        const merchant = await merchantAuthService.register(req.body, req.file?.buffer);
        res.status(201).json(merchant);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Merchant Login
export const login = async (req: Request, res: Response) => {
    try {
        const { id, token } = await merchantAuthService.login(req.body);
        res.status(200).json({ id, token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Merchant Logout
export const logout = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(400).json({ message: "No token provided" });
    }

    try {
        await merchantAuthService.logout(token);
        return res.status(200).json({ message: "Logout successful" });
    } catch (error: any) {
        return res.status(500).json({ message: "Could not log out", error: error.message });
    }
};

// Merchant Reset Password
export const resetPassword = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { oldPassword, newPassword } = req.body;

    try {
        await merchantAuthService.resetPassword(id, oldPassword, newPassword);
        res.status(200).json({ message: "Password reset successful" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
