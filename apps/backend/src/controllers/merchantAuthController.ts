// Handles authentication-related actions
import { Request, Response } from "express";
import * as merchantAuthService from "../services/merchantAuthService";

// Merchant Sign Up
export const register = async (req: Request, res: Response) => {
    try {
        const merchant = await merchantAuthService.register(req.body, req.file?.buffer);

        // Send email verification link
        await merchantAuthService.sendEmailVerification(merchant.email, merchant.merchant_id);
        res.status(200).json({
            message: "Merchant registered. A confirmation link has been sent to your email.",
            merchant,
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Merchant Sign Up: Confirm email for the merchant
export const confirmEmail = async (req: Request, res: Response) => {
    const { email, token } = req.body;

    try {
        await merchantAuthService.confirmEmail(email, token);
        res.status(200).json({ message: "Email confirmed." });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Merchant Sign Up: Confirm email for the merchant
export const resendEmailConfirmation = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        await merchantAuthService.resendEmailVerification(email);
        res.status(200).json({ message: " A confirmation link has been sent to your email." });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Merchant Sign Up: Send OTP to contact number
export const sendPhoneNumberOTP = async (req: Request, res: Response) => {
    const { contact_number } = req.body;

    try {
        await merchantAuthService.sendPhoneNumberOTP(contact_number);
        res.status(200).json({ message: "OTP sent to phone." });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Merchant Sign Up: Verify contact number with OTP
export const verifyPhoneNumberOTP = async (req: Request, res: Response) => {
    const { contact_number, otp } = req.body;

    try {
        const jwtToken = await merchantAuthService.verifyPhoneNumberOTP(contact_number, otp);
        res.status(200).json({ message: "Phone number verified successfully.", jwtToken });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Merchant check email not in use
export const checkEmailNotInUse = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        await merchantAuthService.checkEmailStatus(email);
        res.status(200).json({ message: "Email is Not in database" });
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
