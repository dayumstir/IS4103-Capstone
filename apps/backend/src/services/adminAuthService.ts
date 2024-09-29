// Contains authentication logic, like JWT generation, verification
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IAdmin } from "../interfaces/adminInterface";
import * as adminRepository from "../repositories/adminRepository";
import * as jwtTokenRepository from "../repositories/jwtTokenRepository";
import { AdminType } from "../interfaces/adminType";

import logger from "../utils/logger";
const nodemailer = require("nodemailer");

// Function to generate a random password consisting of digits
const generateRandomPassword = (length = 8) => {
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';

    const allChars = lowerCase + upperCase + digits + specialChars;
    let password = '';

    // Ensure at least one character from each category is included
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the remaining length with random characters
    for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to ensure randomness
    return password.split('').sort(() => 0.5 - Math.random()).join('');
};


export const add = async (adminData: IAdmin) => {
    const { username, email } = adminData;

    // Check for existing admin in db
    const existingAdminEmail = await adminRepository.findAdminByEmail(email);
    const existingAdminUsername = await adminRepository.findAdminByUsername(username);
    if (existingAdminEmail) {
        throw new Error("Admin Email already exists");
    } else if (existingAdminUsername) {
        throw new Error("Admin Username already exists");
    }

    // Generate a random password
    const password = generateRandomPassword(); // Generate a random password
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin record in db
    const newAdmin= await adminRepository.createAdmin({
        ...adminData,
        password: hashedPassword,
        admin_type: AdminType.UNVERIFIED,
    });

    // Generate JWT
    // TODO: Create .env folder with JWT Secret
    const token = jwt.sign({ admin_id: newAdmin.admin_id , email: newAdmin.email}, process.env.JWT_SECRET!, { expiresIn: "1h"});

    return { admin: newAdmin, token, password, username};
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
    const token = jwt.sign({ admin_id: admin.admin_id, email : admin.email, admin_type : admin.admin_type }, process.env.JWT_SECRET!, { expiresIn: "1h"});

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
    await adminRepository.updateAdmin(admin.admin_id, { password: hashedPassword, admin_type: AdminType.NORMAL });
};


export const sendEmailVerification = async (email: string, username: string, password:string) => {

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
        subject: "Admin Account Created",
        text: `The username to your account is ${username} and the password is: ${password}`,
    });
};
