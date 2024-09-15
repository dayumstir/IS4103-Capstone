// Handles authentication-related actions
import { Request, Response } from "express";
import * as customerAuthService from "../services/customerAuthService";


// Customer Sign Up
export const registerCustomer = async (req: Request, res: Response) => {
    try {
        const customer = await customerAuthService.registerCustomer(req.body);

        // Send email verification link
        await customerAuthService.sendEmailVerification(customer.email);

        res.status(200).json({ message: "Customer registered. A confirmation link has been sent to your email.", customer });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};


// Customer Sign Up: Confirm email for the customer
export const confirmEmail = async (req: Request, res: Response) => {
    const { token } = req.body;

    try {
        await customerAuthService.confirmEmail(token);
        res.status(200).json({ message: "Email confirmed. Please verify your phone number."});
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};


// Customer Sign Up: Send OTP to contact number
export const sendPhoneNumberOTP = async (req: Request, res: Response) => {
    const { contact_number } = req.body;

    try {
        await customerAuthService.sendPhoneNumberOTP(contact_number);
        res.status(200).json({ message: "OTP sent to phone." });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};


// Customer Sign Up: Verify contact number with OTP
export const verifyPhoneNumberOTP = async (req: Request, res: Response) => {
    const { contact_number, otp } = req.body;

    try {
        const token = await customerAuthService.verifyPhoneNumberOTP(contact_number, otp);
        res.status(200).json({ message: "Phone number verified successfully.", token });
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
