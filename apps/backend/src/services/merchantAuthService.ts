// Contains authentication logic, like JWT generation, verification
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IMerchant } from "../interfaces/merchantInterface";
import * as merchantRepository from "../repositories/merchantRepository";
import { MerchantStatus } from "../interfaces/merchantStatus";

enum Status {
    PENDING_EMAIL_VERIFICATION,
    PENDING_PHONE_VERIFICATION,
    ACTIVE,
    SUSPENDED,
}

export const register = async (merchantData: IMerchant, merchantProfilePicture?: Buffer) => {
    const { email, password } = merchantData;

    // Check for existing merchant in db
    const existingMerchant = await merchantRepository.findMerchantByEmail(email);
    if (existingMerchant) {
        throw new Error("Merchant already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create merchant record in db

    const newMerchant = await merchantRepository.createMerchant({
        ...merchantData,
        password: hashedPassword,
        status: MerchantStatus.ACTIVE,
        profile_picture: merchantProfilePicture,
        qr_code: "qr_code",
    });

    // Generate JWT
    const token = jwt.sign({ merchant_id: newMerchant.merchant_id }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
    });

    return { merchant: newMerchant, token };
};

export const login = async (loginData: { email: string; password: string }) => {
    const { email, password } = loginData;

    // Check for existing merchant in db
    const merchant = await merchantRepository.findMerchantByEmail(email);
    if (!merchant) {
        throw new Error("Invalid credentials");
    }

    // Check if passwords match
    const isPasswordValid = await bcrypt.compare(password, merchant.password);
    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    // Generate JWT
    const token = jwt.sign({ merchant_id: merchant.merchant_id }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
    });

    return token;
};

export const logout = async (token: string) => {
    try {
        // Decode the JWT token to extract its expiration time
        const decoded = jwt.decode(token) as any;

        if (!decoded || !decoded.exp) {
            throw new Error("Invalid token");
        }

        const expiresAt = new Date(decoded.exp * 1000); // Convert expiration time to Date object

        await merchantRepository.blacklistToken(token, expiresAt);
    } catch (error: any) {
        throw new Error(error.message || "Failed to log out");
    }
};

export const resetPassword = async (email: string, newPassword: string) => {
    const merchant = await merchantRepository.findMerchantByEmail(email);
    if (!merchant) {
        throw new Error("Merchant not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await merchantRepository.updateMerchant(merchant.merchant_id, { password: hashedPassword });
};
