// Contains the business logic related to merchants
import { IMerchant } from "@repo/interfaces";
import * as merchantReporsitory from "../repositories/merchantRepository";
import logger from "../utils/logger";

export const getMerchantById = async (merchant_id: string) => {
  const merchant = await merchantReporsitory.findMerchantById(merchant_id);
  if (!merchant) {
    throw new Error("Merchant not found");
  }
  return merchant;
};

export const updateMerchant = async (
  merchant_id: string,
  updateData: Partial<IMerchant>,
  merchantProfilePicture?: Buffer
) => {
  updateData.profile_picture = merchantProfilePicture;
  const merchant = await merchantReporsitory.updateMerchant(
    merchant_id,
    updateData
  );
  if (!merchant) {
    throw new Error("Merchant not found");
  }
  return merchant;
};

// List all merchants
export const getAllMerchants = async () => {
  const merchants = await merchantReporsitory.listAllMerchants();
  if (!merchants || merchants.length === 0) {
    throw new Error("No merchants found");
  }
  return merchants;
};

// Search merchants
export const searchMerchants = async (searchQuery: string) => {
  logger.info(`Searching for merchants with query: ${searchQuery}`);
  const merchants = await merchantReporsitory.listAllMerchantsWithSearch(searchQuery);
  if (!merchants.length) {
      logger.warn("No merchants found matching the search criteria");
      return [];
  }
  return merchants;
};