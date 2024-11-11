// app/backend/src/services/adminAuthService.ts
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import * as adminService from "../services/adminService";
import * as adminRepository from "../repositories/adminRepository";
import * as jwtTokenRepository from "../repositories/jwtTokenRepository";
import logger from "../utils/logger";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/error";
import { AdminType } from "@repo/interfaces";
import { UserType } from "../interfaces/userType";

// Admin Login
export const login = async (loginData: { username: string; password: string }) => {
    logger.info("Admin login attempt...");

    const { username, password } = loginData;
    const admin = await adminRepository.findAdminByUsername(username);
    if (!admin) throw new UnauthorizedError("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) throw new UnauthorizedError("Invalid credentials");

    const jwtToken = jwt.sign(
        {
            role: UserType.ADMIN,
            admin_id: admin.admin_id,
            email: admin.email,
            admin_type: admin.admin_type,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );

    logger.info(`Admin ${username} logged in successfully.`);
    return jwtToken;
};

// Admin Logout
export const logout = async (jwtToken: string) => {
    logger.info("Admin logout attempt...");
    const decoded = jwt.decode(jwtToken) as any;

    if (!decoded || !decoded.exp) {
        throw new BadRequestError("Invalid token");
    }

    const expiresAt = new Date(decoded.exp * 1000);

    await jwtTokenRepository.blacklistToken(jwtToken, expiresAt);
    logger.info("Admin logged out and token blacklisted successfully.");
};

// Admin Reset Password
export const resetPassword = async (email: string, oldPassword: string, newPassword: string) => {
    logger.info("Resetting admin password...");

    const admin = await adminRepository.findAdminByEmail(email);
    if (!admin) throw new NotFoundError("Admin not found");

    const isPasswordValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isPasswordValid) throw new UnauthorizedError("Old password is incorrect");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateData = admin.admin_type === AdminType.UNVERIFIED
        ? { password: hashedPassword, admin_type: AdminType.NORMAL }
        : { password: hashedPassword };

    await adminRepository.updateAdmin(admin.admin_id, updateData);

    logger.info("Password reset successfully.");
};

// Admin Forget Password
export const forgetPassword = async (email: string) => {
    logger.info(`Processing forget password request for email: ${email}`);

    const admin = await adminRepository.findAdminByEmail(email);
    if (!admin) throw new NotFoundError("Admin not found");

    const generatedPassword = adminService.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    await adminRepository.updateAdmin(admin.admin_id, { password: hashedPassword });
    await sendResetEmail(email, admin.name, generatedPassword);

    logger.info("Forget password email sent successfully.");
};

const sendResetEmail = async (email: string, name: string, generatedPassword: string) => {
    logger.info(`Sending password reset email to ${email}`);
    
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || "2525"),
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        text: `Username: ${name}, New password: ${generatedPassword}`,
    });
};
