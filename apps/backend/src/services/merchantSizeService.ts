// Contains the business logic related to merchant size
import { IMerchantSize } from "@repo/interfaces/merchantSizeinterface";
import * as merchantSizeRepository from "../repositories/merchantSizeRepository";
import logger from "../utils/logger";

export const createMerchantSize = async (
    merchantSizeData: IMerchantSize
) => {
    logger.info("Executing createMerchantSize...");
    const merchantSize =
        await merchantSizeRepository.createMerchantSize(merchantSizeData);
    return merchantSize;
};

export const getAllMerchantSize  = async () => {
    logger.info("Executing AllMerchantSize...");
    const merchantSize =
        await merchantSizeRepository.findAllMerchantSize();
    return merchantSize;
};

export const getMerchantSizeById = async (merchant_size_id: string) => {
    logger.info("Executing getMerchantSizeById...");
    const merchantSize =
        await merchantSizeRepository.findMerchantSizeById(
            merchant_size_id
        );
    if (!merchantSize) {
        throw new Error("Merchant Size not found");
    }
    return merchantSize;
};

export const updateMerchantSize = async (
    merchant_size_id: string,
    updateData: Partial<IMerchantSize>
) => {
    logger.info("Executing updateMerchantSize..");
    const merchantSize = await merchantSizeRepository.updateMerchantSize(
        merchant_size_id,
        updateData
    );
    if (!merchantSize) {
        throw new Error("Merchant Size not found");
    }
    return merchantSize;
};

// Delete merchant size
export const deleteMerchantSize= async (merchant_size_id: string) => {
    logger.info(`Delete merchant size id: ${merchant_size_id}`, merchant_size_id);

    const merchantSize = await merchantSizeRepository.deleteMerchantSize(merchant_size_id);
    if (!merchantSize) {
        throw new Error("Merchant Size not found");
    }

    return merchantSize;
};