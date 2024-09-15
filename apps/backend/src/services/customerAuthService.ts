// Contains authentication logic, like JWT generation, verification
// External dependencies
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const nodemailer = require('nodemailer');
import twilio from "twilio";

// Internal dependencies
import { ICustomer } from "../interfaces/customerInterface";
import * as customerRepository from "../repositories/customerRepository";
import * as emailVerificationTokenRepository from "../repositories/emailVerificationTokenRepository";
import * as jwtTokenRepository from "../repositories/jwtTokenRepository";
import * as otpRepository from "../repositories/otpRepository";


// Step 1: Register customer with basic information
export const registerCustomer = async (customerData: ICustomer) => {
    // Check if customer already exists
    const existingCustomer = await customerRepository.findCustomerByEmail(customerData.email);
    if (existingCustomer) {
        throw new Error("Customer with this email already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(customerData.password, 10);

    // Create the customer in the database
    const customer = await customerRepository.createCustomer({
        ...customerData,
        password: hashedPassword,
        status: "PENDING_EMAIL_VERIFICATION",   // Set status as pending verification
        credit_score: 0,                        // Default value
        credit_tier_id: "tier_1"                // Default credit tier
    });

    return customer;
}


// Step 2: Send email verification link
export const sendEmailVerification = async (email: string) => {
    const token = crypto.randomBytes(32).toString("hex");

    // Save the email verification token
    await emailVerificationTokenRepository.createToken(email, token);

    // Send email with the confirmation link (using nodemailer)
    const confirmationLink = `http://localhost:5173/confirm-email?token=${token}`;
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
        subject: 'Confirm your email',
        text: `Please confirm your email by clicking this link: ${confirmationLink}`,
    });
};


// Step 3: Confirm email
export const confirmEmail = async (token: string) => {
    const emailVerificationToken = await emailVerificationTokenRepository.findToken(token);
    if (!emailVerificationToken || emailVerificationToken.used) {
        throw new Error("Invalid or expired token");
    }

    // Update customer status to "PENDING_PHONE_VERIFICATION"
    await customerRepository.updateCustomerStatusByEmail(emailVerificationToken.email, "PENDING_PHONE_VERIFICATION");

    // Mark token as used
    await emailVerificationTokenRepository.markTokenAsUsed(token);
};


// Step 4: Send OTP to contact number
export const sendPhoneNumberOTP = async (contact_number: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();     // Generate 6-digit OTP

    // Save the OTP in the database
    await otpRepository.saveOTP(contact_number, otp);

    // Send OTP via SMS using Twilio
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    try {
        await client.messages.create({
            body: `Your verification code is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: contact_number
        });
    } catch (error) {
        throw new Error("Failed to send OTP via SMS.");
    }
};


// Step 5: Verify phone number with OTP
export const verifyPhoneNumberOTP = async (contact_number: string, otp: string) => {
    const validOTP = await otpRepository.findOTP(contact_number, otp);
    if (!validOTP) {
        throw new Error("Invalid OTP");
    }

    // Mark OTP as used
    await otpRepository.markOTPAsUsed(contact_number);
    
    // Update customer status to "ACTIVE"
    const customer = await customerRepository.updateCustomerStatusByPhone(contact_number, "ACTIVE");

    // Generate JWT token for the customer
    const token = jwt.sign(
        { customer_id: customer.customer_id, email: customer.email },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );

    return token;
};


export const login = async (loginData: { email: string; password: string }) => {
    const { email, password } = loginData;

    // Check for existing customer in db
    const customer = await customerRepository.findCustomerByEmail(email);
    if (!customer) {
        throw new Error("Invalid credentials");
    }

    // Check if passwords match
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    // Generate JWT
    const token = jwt.sign({ customer_id: customer.customer_id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

    return token;
};


export const logout = async (token: string) => {
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


export const resetPassword = async (email: string, newPassword: string) => {
    const customer = await customerRepository.findCustomerByEmail(email);
    if (!customer) {
        throw new Error("Customer not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await customerRepository.updateCustomer(customer.customer_id, { password: hashedPassword });
};
