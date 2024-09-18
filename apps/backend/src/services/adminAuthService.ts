// Contains authentication logic, like JWT generation, verification
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IAdmin } from "../interfaces/adminInterface";
import * as adminRepository from "../repositories/adminRepository";
import * as jwtTokenRepository from "../repositories/jwtTokenRepository";
import { AdminType } from "../interfaces/adminType";

import logger from "../utils/logger";

export const add = async (adminData: IAdmin) => {
    const { username, email, password } = adminData;

    // Check for existing admin in db
    const existingAdminEmail = await adminRepository.findAdminByEmail(email);
    const existingAdminUsername = await adminRepository.findAdminByUsername(username);
    if (existingAdminEmail) {
        throw new Error("Admin Email already exists");
    } else if (existingAdminUsername) {
        throw new Error("Admin Username already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin record in db
    const newAdmin= await adminRepository.createAdmin({
        ...adminData,
        password: hashedPassword,
        admin_type: AdminType.NORMAL,
    });

    // Generate JWT
    // TODO: Create .env folder with JWT Secret
    const token = jwt.sign({ admin_id: newAdmin.admin_id , email: newAdmin.email}, process.env.JWT_SECRET!, { expiresIn: "1h"});

    return { admin: newAdmin, token };
};


export const login= async (loginData: { username: string; password: string }) => {
    const { username, password } = loginData;

    // Check for existing admin in db
    const admin = await adminRepository.findAdminByUsername(username);
    if (!admin) {
        throw new Error("Invalid credentials");
    }

    // Check if passwords match
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    // Generate JWT
    const token = jwt.sign({ admin_id: admin.admin_id, email : admin.email }, process.env.JWT_SECRET!, { expiresIn: "1h"});

    return token;
};


export const logout= async (token: string) => {
    try {
        // Decode the JWT token to extract its expiration time
        const decoded = jwt.decode(token) as any;

        if (!decoded || !decoded.exp) {
            throw new Error("Invalid token");
        }

        const expiresAt = new Date(decoded.exp * 1000);  // Convert expiration time to Date object

        await jwtTokenRepository.blacklistToken(token, expiresAt);
    } catch (error: any) {
        throw new Error(error.message || "Failed to log out");
    }
};


export const resetPassword = async (email: string, oldPassword: string, newPassword: string ) => {
    logger.info('Executing resetPassword...');

    const admin = await adminRepository.findAdminByEmail(email);
    if (!admin) {
        throw new Error("Admin not found");
    }

        // Verify that old password matches
    const isPasswordValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isPasswordValid) {
        throw new Error("Old password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await adminRepository.updateAdmin(admin.admin_id, { password: hashedPassword });
};
