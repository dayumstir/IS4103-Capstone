// Handles database operations related to Merchant Size
import { prisma } from "./db";
import { IMerchantSize } from "@repo/interfaces/merchantSizeInterface";

// Create a new Merchant Size in db
export const createMerchantSize= async (
    merchantSizeData: IMerchantSize
) => {
    return prisma.merchantSize.create({
        data: {
            ...merchantSizeData,
        },
    });
};

// Find all Merchant Size in db
export const findAllMerchantSize = async () => {
    return prisma.merchantSize.findMany({
        orderBy: {
            monthly_revenue_max: "asc",
        },
    });
};

// Find Merchant Size by id (unique attribute) in db
export const findMerchantSizeById = async (merchant_size_id: string) => {
    return prisma.merchantSize.findUnique({
        where: { merchant_size_id: merchant_size_id },
    });
};

// Update Merchant Size in db
export const updateMerchantSize = async (
    merchant_size_id: string,
    updateData: Partial<IMerchantSize>
) => {
    return prisma.merchantSize.update({
        where: { merchant_size_id: merchant_size_id },
        data: {
            ...updateData,
        },
    });
};


export const deleteMerchantSize = async (
    merchant_size_id: string,
) => {
    return prisma.merchantSize.delete({
        where: { merchant_size_id: merchant_size_id },
    });
};
