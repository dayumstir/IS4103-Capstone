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


// Find admin by id (unique attribute) in db
export const findAdminById = async (admin_id: number) => {
    return prisma.admin.findUnique({ where: { admin_id } });
};

// Update admin in db
export const updateAdmin= async (admin_id: number, updateData: Partial<IAdmin>) => {
    return prisma.admin.update({
        where: { admin_id: admin_id },
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
            }
        });
    } catch (error) {
        throw new Error("Failed to blacklist the token");
    }
};


// Find token in db
export const findToken = async (token: string) => {
    return prisma.tokenBlackList.findUnique({ where: { token } });
};