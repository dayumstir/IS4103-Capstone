// Contains authentication logic, like JWT generation, verification
// External dependencies
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const nodemailer = require('nodemailer');

// Internal dependencies
import { ICustomer } from "../interfaces/customerInterface";
import * as customerRepository from "../repositories/customerRepository";
import * as jwtTokenRepository from "../repositories/jwtTokenRepository";
import * as emailVerificationTokenRepository from "../repositories/emailVerificationTokenRepository";


// Send email confirmation link to the customer
export const sendConfirmationEmail = async (email: string) => {
    // Check if customer already exists
    const existingCustomer = await customerRepository.findCustomerByEmail(email);
    if (existingCustomer) {
        throw new Error("Customer with this email already exists");
    }

    // Generate a unique verification token
    const token = crypto.randomBytes(32).toString("hex");

    // Save the token and associate it with the customer's email
    await emailVerificationTokenRepository.createToken(email, token);

    // Send confirmation link via email (using nodemailer)
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
        from: "from@example.com",
        to: email, 
        subject: 'Confirm your email',
        text: `Please confirm your email by clicking this link: ${confirmationLink}`,
    });
};


// Confirm the email and register the customer
export const confirmEmailAndRegister = async (token: string, customerData: ICustomer) => {
    // Find the token and check if it is valid
    const emailVerificationToken = await emailVerificationTokenRepository.findToken(token);
    if (!emailVerificationToken || emailVerificationToken.used) {
        throw new Error("Invalid or expired token");
    }

    // Hash the password
    const { password } = customerData;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the customer in the database
    // Create customer record in db
    const newCustomer = await customerRepository.createCustomer({
        ...customerData,
        email: emailVerificationToken.email,
        password: hashedPassword,
        status: "ACTIVE",   // Initial status
        credit_score: 0,    // Default value
        credit_tier_id: "tier_1"    // Default credit tier
    });

    // Mark the token as used
    await emailVerificationTokenRepository.markTokenAsUsed(token);

    // Generate JWT
    const jwtToken = jwt.sign({ customer_id: newCustomer.customer_id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

    return { customer: newCustomer, jwtToken };
}


// Send phone number OTP
// export const sendPhoneNumberOTP = async (contact_number: string) => {
//     const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP

//     // Save the OTP in the database
//     await otpService.saveOTP(contact_number, otp);

//     // Send OTP to the phone using a service like Twilio
//     const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

//     await client.messages.create({
//         body: `Your verification code is ${otp}`,
//         from: process.env.TWILIO_PHONE_NUMBER,
//         to: contact_number
//     });
// };


// Verify phone number
// export const verifyPhoneNumberOTP = async (contact_number: string, otp: string) => {
//     const validOTP = await otpService.findOTP(contact_number, otp);
//     if (!validOTP) {
//         return false;
//     }

//     // Mark OTP as used
//     await otpService.markOTPAsUsed(contact_number);
//     return true;
// };


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
