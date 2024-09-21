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
