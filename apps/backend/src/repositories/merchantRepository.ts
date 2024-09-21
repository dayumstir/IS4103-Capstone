// Handles database operations related to merchants
import { prisma } from "./db";
import { IMerchant } from "../interfaces/merchantInterface";

// Create a new merchant in db
export const createMerchant = async (merchantData: IMerchant) => {
    return prisma.merchant.create({ data: merchantData });
};

// Find merchant by email (unique attribute) in db
export const findMerchantByEmail = async (email: string) => {
    return prisma.merchant.findUnique({ where: { email } });
};

// Find merchant by id (unique attribute) in db
export const findMerchantById = async (merchant_id: string) => {
    return prisma.merchant.findUnique({ where: { merchant_id } });
};

// Update merchant in db
export const updateMerchant = async (merchant_id: string, updateData: Partial<IMerchant>) => {
    return prisma.merchant.update({
        where: { merchant_id: merchant_id },
        data: updateData,
    });
};

// Blacklist a token
export const blacklistToken = async (token: string, expiresAt: Date) => {
    try {
        await prisma.tokenBlackList.create({
            data: {
                token: token,
                expiresAt: expiresAt,
            },
        });
    } catch (error) {
        throw new Error("Failed to blacklist the token");
    }
};

// Find token in db
export const findToken = async (token: string) => {
    return prisma.tokenBlackList.findUnique({ where: { token } });
};
