// apps/backend/src/repositories/merchantRepository.ts
import { prisma } from "./db";
import { IMerchant } from "@repo/interfaces";

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

// Find All Merchants
export const listAllMerchants = async () => {
    return prisma.merchant.findMany();
};

// Search Merchants
export const listAllMerchantsWithSearch = async (search: string) => {
    return prisma.merchant.findMany({
        where: {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    email: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    contact_number: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        },
    });
};
