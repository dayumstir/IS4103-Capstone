// Contains the business logic related to admin
import { IAdmin } from "../interfaces/adminInterface";
import * as adminRepository from "../repositories/adminRepository";


export const getAdminById = async (admin_id: string) => {
    const admin = await adminRepository.findAdminById(admin_id);
    if (!admin) {
        throw new Error("Admin not found");
    }
    return admin;
};


export const updateAdmin = async (admin_id: string, updateData: Partial<IAdmin>) => {
    const admin = await adminRepository.updateAdmin(admin_id, updateData);
    if (!admin) {
        throw new Error("Admin not found");
    }
    return admin;
};
