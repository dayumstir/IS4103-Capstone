// Contains the business logic related to admin
import { IAdmin } from "../interfaces/adminInterface";
import * as adminRepository from "../repositories/adminRepository";
import logger from "../utils/logger";
import { AdminType } from "../interfaces/adminType";

export const getById = async (admin_id: string) => {
  const admin = await adminRepository.findAdminById(admin_id);
  if (!admin) {
    throw new Error("Admin not found");
  }
  return admin;
};

export const update = async (admin_id: string, updateData: Partial<IAdmin>) => {
  const admin = await adminRepository.updateAdmin(admin_id, updateData);
  if (!admin) {
    throw new Error("Admin not found");
  }
  return admin;
};


export const getAllAdmins = async () => {
  logger.info("Executing getAllCreditTiers...");
  const allAdmins = await adminRepository.findAllAdmins();
  return allAdmins;
};

export const activateAdmin = async (
  admin_id: string,
) => {
  logger.info("Executing updateInstalmentPlan...");
  const admin = await adminRepository.updateAdmin(
    admin_id,
    {admin_type: AdminType.NORMAL}
  );
  if (!admin) {
      throw new Error("Admin not found");
  }
  return admin;
};


export const deactivateAdmin = async (
    admin_id: string,
  ) => {
    logger.info("Executing updateInstalmentPlan...");
    const admin = await adminRepository.updateAdmin(
      admin_id,
      {admin_type: AdminType.DEACTIVATED}
    );
    if (!admin) {
        throw new Error("Admin not found");
    }
    return admin;
};