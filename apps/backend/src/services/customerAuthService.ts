// Contains authentication logic, like JWT generation, verification
// External dependencies
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import validator from "validator";
import * as fs from "fs";
import * as path from "path";
const nodemailer = require("nodemailer");

// Internal dependencies
import { CustomerStatus } from "@repo/interfaces";
import { ICustomer } from "@repo/interfaces";
import { UserType } from "../interfaces/userType";

import * as customerRepository from "../repositories/customerRepository";
import * as emailVerificationTokenRepository from "../repositories/emailVerificationTokenRepository";
import * as jwtTokenRepository from "../repositories/jwtTokenRepository";
import * as otpRepository from "../repositories/otpRepository";

import logger from "../utils/logger";

import { NotFoundError } from "../utils/error";

// Step 1: Register customer with basic information
export const registerCustomer = async (customerData: ICustomer) => {
    logger.info("Executing registerCustomer...");

    // Validate email format
    if (!validator.isEmail(customerData.email)) {
        throw new Error("Invalid email format");
    }

    // Validate phone number
    if (
        !validator.isMobilePhone(customerData.contact_number, undefined, {
            strictMode: true,
        })
    ) {
        throw new Error(
            "Invalid phone number format. Use +[country code][number]."
        );
    }

    // Check if customer already exists
    const existingCustomer = await customerRepository.findCustomerByEmail(
        customerData.email
    );
    if (existingCustomer) {
        throw new Error("Customer with this email already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(customerData.password, 10);

    // Set default profile picture
    const defaultProfilePicturePath = path.join(
        __dirname,
        "../src/assets/default-profile-picture.png"
    );
    const defaultProfilePicture = fs.readFileSync(defaultProfilePicturePath);

    // Create the customer in the database
    const customer = await customerRepository.createCustomer({
        ...customerData,
        password: hashedPassword,
        status: CustomerStatus.PENDING_EMAIL_VERIFICATION, // Set status as pending verification
        credit_score: 0, // Default value
        profile_picture: defaultProfilePicture,
    });

    return customer;
};

// Step 2: Send email verification link
export const sendEmailVerification = async (
    email: string,
    customer_id: string
) => {
    logger.info("Executing sendEmailVerification...");

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expires in 24hrs

    // Save the email verification token
    await emailVerificationTokenRepository.createToken(
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

// Resend Email Verification
export const resendEmailVerification = async (email: string) => {
    logger.info("Executing resendEmailVerification...");

    // Check for existing customer
    const customer = await customerRepository.findCustomerByEmail(email);
    if (!customer) {
        logger.warn(`${email} - Customer not found`);
        throw new Error("Invalid credentials");
    }

    // Invalidate previous email verification tokens
    await emailVerificationTokenRepository.invalidateTokensByEmail(email);

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expires in 24hrs

    // Save the email verification token
    await emailVerificationTokenRepository.createToken(
        email,
        token,
        expiresAt,
        customer.customer_id
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
export const confirmEmail = async (token: string) => {
    logger.info("Executing confirmEmail...");

    const emailVerificationToken =
        await emailVerificationTokenRepository.findToken(token);
    if (!emailVerificationToken || emailVerificationToken.used) {
        throw new Error("Invalid or expired token");
    }

    // Update customer status to "PENDING_PHONE_VERIFICATION"
    const updateData = { status: CustomerStatus.PENDING_PHONE_VERIFICATION };
    await customerRepository.updateCustomer(
        emailVerificationToken.customer_id,
        updateData
    );

    // Mark token as used
    await emailVerificationTokenRepository.markTokenAsUsed(token);
};

// Step 4: Send OTP to contact number
export const sendPhoneNumberOTP = async (contact_number: string) => {
    logger.info("Executing sendPhoneNumberOTP...");

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Token expires in 10 mins

    // Retrieve customer based on contact number
    const customer =
        await customerRepository.findCustomerByContactNumber(contact_number);
    if (!customer) {
        throw new Error("Customer does not exist");
    }

    // Save the OTP in the database
    await otpRepository.saveOTP(
        customer.contact_number,
        otp,
        expiresAt,
        customer.customer_id
    );

    // Send OTP via SMS using Twilio
    const client = twilio(
        process.env.TWILIO_SID,
        process.env.TWILIO_AUTH_TOKEN
    );
    try {
        await client.messages.create({
            body: `Your verification code is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: customer.contact_number,
        });
    } catch (error) {
        logger.error("An error occurred:", error);
        throw new Error("Failed to send OTP via SMS.");
    }
};

// Step 5: Verify phone number with OTP
export const verifyPhoneNumberOTP = async (otp: string) => {
    logger.info("Executing verifyPhoneNumberOTP...");

    const validOTP = await otpRepository.findOTP(otp);
    if (!validOTP) {
        throw new Error("Invalid OTP");
    }

    // Mark OTP as used
    await otpRepository.markOTPAsUsed(otp);

    // Update customer status to "ACTIVE"
    const updateData = { status: CustomerStatus.ACTIVE };
    const customer = await customerRepository.updateCustomer(
        validOTP.customer_id,
        updateData
    );

    // Generate JWT token for the customer
    const token = jwt.sign(
        {
            role: UserType.CUSTOMER,
            customer_id: customer.customer_id,
            email: customer.email,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );

    return token;
};

export const login = async (loginData: { email: string; password: string }) => {
    logger.info("Executing login...");
    const { email, password } = loginData;

    // Check for existing customer
    logger.info(`Attempting login for email: ${email}`);
    const customer = await customerRepository.findCustomerByEmail(email);
    if (!customer) {
        logger.warn(`Login failed for email: ${email} - Customer not found`);
        throw new Error("Invalid credentials");
    }

    // Check if the customer's status is ACTIVE
    if (customer.status !== CustomerStatus.ACTIVE) {
        logger.warn(`Login failed for email: ${email} - Account not active`);
        throw new Error("Your account is not active.");
    }

    // Check if passwords match
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
        logger.warn(`Login failed for email: ${email} - Invalid password`);
        throw new Error("Invalid credentials");
    }

    // Generate JWT
    const token = jwt.sign(
        {
            role: UserType.CUSTOMER,
            customer_id: customer.customer_id,
            email: customer.email,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );

    logger.info(`Login successful for email: ${email}`);
    return token;
};

export const logout = async (token: string) => {
    logger.info("Executing logout...");
    try {
        // Decode the JWT token to extract its expiration time
        const decoded = jwt.decode(token) as any;

        if (!decoded || !decoded.exp) {
            throw new Error("Invalid token");
        }

        const expiresAt = new Date(decoded.exp * 1000); // Convert expiration time to Date object

        await jwtTokenRepository.blacklistToken(token, expiresAt);
    } catch (error: any) {
        logger.error("An error occurred:", error);
        throw new Error(error.message || "Failed to log out");
    }
};

export const resetPassword = async (
    customer_id: string,
    oldPassword: string,
    newPassword: string
) => {
    logger.info("Executing resetPassword...");

    // Retrieve customer from database
    const customer = await customerRepository.findCustomerById(customer_id);
    if (!customer) {
        throw new Error("Customer not found");
    }

    // Verify that old password matches
    const isPasswordValid = await bcrypt.compare(
        oldPassword,
        customer.password
    );
    if (!isPasswordValid) {
        throw new Error("Old password is incorrect");
    }

    // Ensure new password is different from old password
    const isNewPasswordSame = await bcrypt.compare(
        newPassword,
        customer.password
    );
    if (isNewPasswordSame) {
        throw new Error("New password cannot be the same as old password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await customerRepository.updateCustomer(customer.customer_id, {
        password: hashedPassword,
    });
};

// Generate random password with specified character sets
export const generateRandomPassword = (length = 8) => {
    const lowerCase = "abcdefghijklmnopqrstuvwxyz";
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    const specialChars = "!@#$%^&*";
    const allChars = lowerCase + upperCase + digits + specialChars;

    let password =
        lowerCase[Math.floor(Math.random() * lowerCase.length)] +
        upperCase[Math.floor(Math.random() * upperCase.length)] +
        digits[Math.floor(Math.random() * digits.length)] +
        specialChars[Math.floor(Math.random() * specialChars.length)];

    for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password
        .split("")
        .sort(() => 0.5 - Math.random())
        .join("");
};

// Customer Forget Password
export const forgetPassword = async (email: string) => {
    logger.info(`Processing forget password request for email: ${email}`);

    const customer = await customerRepository.findCustomerByEmail(email);
    if (!customer) {
        throw new NotFoundError("Customer not found");
    }

    const generatedPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    await customerRepository.updateCustomer(customer.customer_id, {
        password: hashedPassword,
    });
    await sendResetEmail(email, generatedPassword);

    logger.info("Forget password email sent successfully.");
};

const sendResetEmail = async (email: string, generatedPassword: string) => {
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
        text: `Your new password is: ${generatedPassword}`,
    });
};
