// Handles authentication-related actions
import { Request, Response } from "express";
import * as customerAuthService from "../services/customerAuthService";


// Customer Sign Up
export const register = async (req: Request, res: Response) => {
    try {
        const customer = await customerAuthService.register(req.body);
        res.status(201).json(customer);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};


// Customer Login
export const login = async (req: Request, res: Response) => {
    try {
        const token = await customerAuthService.login(req.body);
        res.status(200).json({ token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};


// Customer Logout
export const logout = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }

    try {
        await customerAuthService.logout(token);
        return res.status(200).json({ message: 'Logout successful' });
    } catch (error: any) {
        return res.status(500).json({ message: 'Could not log out', error: error.message });
    }
};


// Customer Reset Password
export const resetPassword = async (req: Request, res: Response) => {
    try {
        await customerAuthService.resetPassword(req.body.email, req.body.newPassword);
        res.status(200).json({ message: "Password reset successful"});
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};