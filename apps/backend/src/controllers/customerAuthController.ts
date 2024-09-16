// Handles authentication-related actions
import { Request, Response } from "express";
import * as customerAuthService from "../services/customerAuthService";
import logger from "../utils/logger";


// Customer Sign Up
export const registerCustomer = async (req: Request, res: Response) => {
    logger.info('Executing registerCustomer...');
    try {
        const customer = await customerAuthService.registerCustomer(req.body);

        // Send email verification link
        await customerAuthService.sendEmailVerification(customer.email, customer.customer_id);

        res.status(200).json({ message: "Customer registered. A confirmation link has been sent to your email.", customer });
    } catch (error: any) {
        logger.error('An error occurred:', error);
        res.status(400).json({ error: error.message });
    }
};


// Customer Sign Up: Confirm email for the customer
export const confirmEmail = async (req: Request, res: Response) => {
    logger.info('Executing confirmEmail...');
    const { token } = req.body;

    try {
        await customerAuthService.confirmEmail(token);
        res.status(200).json({ message: "Email confirmed. Please verify your phone number."});
    } catch (error: any) {
        logger.error('An error occurred:', error);
        res.status(400).json({ error: error.message });
    }
};


// Customer Sign Up: Send OTP to contact number
export const sendPhoneNumberOTP = async (req: Request, res: Response) => {
    logger.info('Executing sendPhoneNumberOTP...');
    const { contact_number } = req.body;

    try {
        await customerAuthService.sendPhoneNumberOTP(contact_number);
        res.status(200).json({ message: "OTP sent to phone." });
    } catch (error: any) {
        logger.error('An error occurred:', error);
        res.status(400).json({ error: error.message });
    }
};


// Customer Sign Up: Verify contact number with OTP
export const verifyPhoneNumberOTP = async (req: Request, res: Response) => {
    logger.info('Executing verifyPhoneNumberOTP...');
    const { otp } = req.body;

    try {
        const jwtToken = await customerAuthService.verifyPhoneNumberOTP(otp);
        res.status(200).json({ message: "Phone number verified successfully.", jwtToken });
    } catch (error: any) {
        logger.error('An error occurred:', error);
        res.status(400).json({ error: error.message });
    }
};


// Customer Login
export const login = async (req: Request, res: Response) => {
    logger.info('Executing login...');
    try {
        const jwtToken = await customerAuthService.login(req.body);
        res.status(200).json({ jwtToken });
    } catch (error: any) {
        logger.error('An error occurred:', error);
        res.status(400).json({ error: error.message });
    }
};


// Customer Logout
export const logout = async (req: Request, res: Response) => {
    logger.info('Executing logout...');
    const jwtToken = req.headers.authorization?.split(" ")[1];

    if (!jwtToken) {
        return res.status(400).json({ message: 'No token provided' });
    }

    try {
        await customerAuthService.logout(jwtToken);
        return res.status(200).json({ message: 'Logout successful' });
    } catch (error: any) {
        logger.error('An error occurred:', error);
        return res.status(500).json({ message: 'Could not log out', error: error.message });
    }
};


// Customer Reset Password
export const resetPassword = async (req: Request, res: Response) => {
    logger.info('Executing resetPassword...');
    const { email, oldPassword, newPassword } = req.body;

    try {
        await customerAuthService.resetPassword(email, oldPassword, newPassword);
        res.status(200).json({ message: "Password reset successful"});
    } catch (error: any) {
        logger.error('An error occurred:', error);
        res.status(400).json({ error: error.message });
    }
};
