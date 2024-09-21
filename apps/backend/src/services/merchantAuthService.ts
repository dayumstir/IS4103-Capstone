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

        await merchantRepository.blacklistToken(token, expiresAt);
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
