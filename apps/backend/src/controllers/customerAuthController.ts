// Handles authentication-related actions
import { Request, Response } from "express";
import * as customerAuthService from "../services/customerAuthService";


// Customer Sign Up: Send email confirmation link
export const sendConfirmationEmail = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        await customerAuthService.sendConfirmationEmail(email);
        res.status(200).json({ message: "Confirmation link sent to email" });
    } catch (error : any) {
        res.status(400).json({ error: error.message });
    }
};


// Customer Sign Up: Confirm email and register customer
export const confirmEmailAndRegister = async (req: Request, res: Response) => {
    const { token, customer } = req.body;

    try {
        const newCustomer = await customerAuthService.confirmEmailAndRegister(token, customer);
        res.status(200).json(newCustomer);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};


// Customer Sign Up: Send phone number OTP
// export const sendPhoneNumberOTP = async (req: Request, res: Response) => {
//     const { contact_number } = req.body;

//     try {
//         await customerAuthService.sendPhoneNumberOTP(contact_number);
//         res.status(200).json({ message: "OTP sent to phone" });
//     } catch (error: any) {
//         res.status(400).json({ error: error.message });
//     }
// };


// Customer Sign Up: Verify phone number
// export const verifyPhoneNumberOTP = async (req: Request, res: Response) => {
//     const { contact_number, otp } = req.body;

//     try {
//         const isVerified = await authService.verifyPhoneNumberOTP(contact_number, otp);
//         if (isVerified) {
//             res.status(200).json({ message: 'Phone number verified' });
//         } else {
//             res.status(400).json({ message: 'Invalid OTP' });
//         }
//     } catch (error: any) {
//         res.status(400).json({ error: error.message });
//     }
// };



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
