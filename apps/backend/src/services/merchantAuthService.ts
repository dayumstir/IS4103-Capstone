// Contains authentication logic, like JWT generation, verification
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IMerchant } from "../interfaces/merchantInterface";
import * as merchantRepository from "../repositories/merchantRepository";
import { MerchantStatus } from "../interfaces/merchantStatus";
import * as merchantEmailVerificationTokenRepository from "../repositories/merchantEmailVerificationTokenRepository";
import * as merchantOtpRepository from "../repositories/merchantOtpRepository";
import * as jwtTokenRepository from "../repositories/jwtTokenRepository";
import { UserType } from "../interfaces/userType";

import crypto from "crypto";
const nodemailer = require("nodemailer");
import twilio from "twilio";
import validator from "validator";

export const register = async (merchantData: IMerchant, merchantProfilePicture?: Buffer) => {
    const { email, password } = merchantData;

    // Check for existing merchant in db
    const existingMerchant = await merchantRepository.findMerchantByEmail(email);
    if (existingMerchant) {
        if (existingMerchant.status == MerchantStatus.ACTIVE) {
            throw new Error("Merchant already exists");
        }
    }

    // Check if phone number is verified
    const isVerified = await merchantOtpRepository.checkPhoneNumberVerified(
        merchantData.contact_number
    );
    if (!isVerified) {
        throw new Error("Phone Number has not been verified");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create merchant record in db
    const newMerchant = await merchantRepository.createMerchant({
        ...merchantData,
        password: hashedPassword,
        status: MerchantStatus.PENDING_EMAIL_VERIFICATION,
        profile_picture: merchantProfilePicture,
        qr_code: "qr_code",
    });

    // // Generate JWT
    // const token = jwt.sign({ merchant_id: newMerchant.merchant_id }, process.env.JWT_SECRET!, {
    //     expiresIn: "1h",
    // });

    return newMerchant;
};

// Step 2: Send email verification link
export const sendEmailVerification = async (email: string, customer_id: string) => {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expires in 24hrs

    // Save the email verification token
    await merchantEmailVerificationTokenRepository.createToken(
        email,
        token,
        expiresAt,
        customer_id
    );

    // Send email with the confirmation link (using nodemailer)
    const confirmationNumber = `${token}`;
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
        subject: "Confirm your email",
        text: `Please confirm your email by entering this number in your mobile application: ${confirmationNumber}`,
    });
};

// Step 2: Send email verification link
export const resendEmailVerification = async (email: string) => {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expires in 24hrs

    const existingMerchant = await merchantRepository.findMerchantByEmail(email);
    if (!existingMerchant) {
        throw new Error("Merchant does not exist");
    }
    if (existingMerchant) {
        if (existingMerchant.status == MerchantStatus.ACTIVE) {
            throw new Error("Email already in use");
        }
        if (existingMerchant.status == MerchantStatus.SUSPENDED) {
            throw new Error("Email Suspended");
        }
    }

    // Save the email verification token
    await merchantEmailVerificationTokenRepository.createToken(
        email,
        token,
        expiresAt,
        existingMerchant.merchant_id
    );

    // Send email with the confirmation link (using nodemailer)
    const confirmationNumber = `${token}`;
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
        subject: "Confirm your email",
        text: `Please confirm your email by entering this number in your mobile application: ${confirmationNumber}`,
    });
};

// Step 3: Confirm email
export const confirmEmail = async (email: string, token: string) => {
    const emailVerificationToken = await merchantEmailVerificationTokenRepository.verifyEmail(
        email,
        token
    );
    if (!emailVerificationToken || emailVerificationToken.used) {
        throw new Error("Invalid or expired token");
    }

    // Update customer status to "PENDING_PHONE_VERIFICATION"
    const updateData = { status: MerchantStatus.ACTIVE };
    await merchantRepository.updateMerchant(emailVerificationToken.merchant_id, updateData);

    // Mark token as used
    await merchantEmailVerificationTokenRepository.markTokenAsUsed(email, token);
};

// Step 4: Send OTP to contact number
export const sendPhoneNumberOTP = async (contact_number: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Token expires in 10 mins

    // Validate phone number
    if (!validator.isMobilePhone(contact_number, undefined, { strictMode: true })) {
        throw new Error("Invalid phone number format. Use +[country code][number].");
    }

    // // Retrieve customer based on contact number
    // const merchant = await merchantRepository.findCustomerByContactNumber(contact_number);
    // if (!merchant) {
    //     throw new Error("Customer does not exist");
    // }

    // Save the OTP in the database
    await merchantOtpRepository.saveOTP(contact_number, otp, expiresAt);

    // Send OTP via SMS using Twilio
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    try {
        await client.messages.create({
            body: `Your verification code is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: contact_number,
        });
    } catch (error) {
        throw new Error("Failed to send OTP via SMS.");
    }
};

// Step 5: Verify phone number with OTP
export const verifyPhoneNumberOTP = async (contact_number: string, otp: string) => {
    const validOTP = await merchantOtpRepository.verifyContactNumber(contact_number, otp);
    if (!validOTP) {
        throw new Error("Invalid OTP");
    }

    // Mark OTP as used
    await merchantOtpRepository.markOTPAsUsed(otp);

    // // Update merchant status to "ACTIVE"
    // const updateData = { status: MerchantStatus.ACTIVE };
    // const merchant = await merchantRepository.updateMerchant(validOTP.merchant_id, updateData);

    // // Generate JWT token for the merchant
    // const token = jwt.sign(
    //     { merchant_id: merchant.merchant_id, email: merchant.email },
    //     process.env.JWT_SECRET!,
    //     { expiresIn: "1h" }
    // );

    return;
};

export const checkEmailStatus = async (email: string) => {
    // Check for existing merchant in db
    const existingMerchant = await merchantRepository.findMerchantByEmail(email);
    if (existingMerchant) {
        if (existingMerchant.status == MerchantStatus.ACTIVE) {
            throw new Error("Email in use");
        }
        if (existingMerchant.status == MerchantStatus.PENDING_EMAIL_VERIFICATION) {
            throw new Error("Email pending verification");
        }
    }

    return;
};

export const login = async (loginData: { email: string; password: string }) => {
    const { email, password } = loginData;

    // Check for existing merchant in db
    const merchant = await merchantRepository.findMerchantByEmail(email);
    if (!merchant) {
        throw new Error("Invalid credentials");
    }

    if (merchant.status == MerchantStatus.SUSPENDED) {
        throw new Error("Merchant Suspended");
    }

    if (merchant.status == MerchantStatus.PENDING_EMAIL_VERIFICATION) {
        throw new Error("Email pending verification");
    }

    // Check if passwords match
    const isPasswordValid = await bcrypt.compare(password, merchant.password);
    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    // Generate JWT
    const token = jwt.sign(
        {
            role: UserType.MERCHANT,
            merchant_id: merchant.merchant_id,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );

    return { id: merchant.merchant_id, token };
};

export const logout = async (token: string) => {
    try {
        // Decode the JWT token to extract its expiration time
        const decoded = jwt.decode(token) as any;

        if (!decoded || !decoded.exp) {
            throw new Error("Invalid token");
        }

        const expiresAt = new Date(decoded.exp * 1000); // Convert expiration time to Date object

        await jwtTokenRepository.blacklistToken(token, expiresAt);
    } catch (error: any) {
        throw new Error(error.message || "Failed to log out");
    }
};

export const resetPassword = async (id: string, oldPassword: string, newPassword: string) => {
    // Retrieve merchant from database
    const merchant = await merchantRepository.findMerchantById(id);
    if (!merchant) {
        throw new Error("Merchant not found");
    }

    // Verify that old password matches
    const isPasswordValid = await bcrypt.compare(oldPassword, merchant.password);
    if (!isPasswordValid) {
        throw new Error("Old password is incorrect");
    }

    // Ensure new password is different from old password
    const isNewPasswordSame = await bcrypt.compare(newPassword, merchant.password);
    if (isNewPasswordSame) {
        throw new Error("New password cannot be the same as old password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await merchantRepository.updateMerchant(merchant.merchant_id, { password: hashedPassword });
};
