// Handles database operations related to admin
import { prisma } from "./db";
import { IAdmin } from "../interfaces/adminInterface";

// Create a new admin in db
export const createAdmin = async (adminData: IAdmin) => {
    return prisma.admin.create({ data: adminData });
};

// Find admin by email (unique attribute) in db
export const findAdminByEmail = async (email: string) => {
    return prisma.admin.findUnique({ where: { email } });
};

// Find admin by username (unique attribute) in db
export const findAdminByUsername = async (username: string) => {
    return prisma.admin.findUnique({ where: { username } });
};


// Find admin by id (unique attribute) in db
export const findAdminById = async (admin_id: string) => {
    return prisma.admin.findUnique({ where: { admin_id } });
};

// Update admin in db
export const updateAdmin= async (admin_id: string, updateData: Partial<IAdmin>) => {
    return prisma.admin.update({
        where: { admin_id: admin_id },
        data: updateData,
    });
};
