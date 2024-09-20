// Contains the business logic related to merchants
import { IMerchant } from "../interfaces/merchantInterface";
import * as merchantReporsitory from "../repositories/merchantRepository";

export const getMerchantById = async (merchant_id: string) => {
    const merchant = await merchantReporsitory.findMerchantById(merchant_id);
    if (!merchant) {
        throw new Error("Merchant not found");
    }
    return merchant;
};

export const updateMerchant = async (merchant_id: string, updateData: Partial<IMerchant>) => {
    const merchant = await merchantReporsitory.updateMerchant(merchant_id, updateData);
    if (!merchant) {
        throw new Error("Merchant not found");
    }
    return merchant;
};
