// app/backend/src/repositories/adminRepository.ts
import { prisma } from "./db";
import { IAdmin } from "@repo/interfaces";

// Create a new admin
export const createAdmin = async (adminData: IAdmin) => {
    return prisma.admin.create({ data: adminData });
};

// Find an admin by email
export const findAdminByEmail = async (email: string) => {
    return prisma.admin.findUnique({ where: { email } });
};

// Find an admin by username
export const findAdminByUsername = async (username: string) => {
    return prisma.admin.findUnique({ where: { username } });
};

// Find an admin by ID
export const findAdminById = async (admin_id: string) => {
    return prisma.admin.findUnique({ where: { admin_id } });
};

// Update an admin
export const updateAdmin = async (admin_id: string, updateData: Partial<IAdmin>) => {
    return prisma.admin.update({
        where: { admin_id },
        data: updateData,
    });
};

// Find all admins excluding "SUPER"
export const findAllAdmins = async () => {
    return prisma.admin.findMany({
        where: {
            admin_type: {
                not: "SUPER",
            },
        },
        orderBy: {
            name: "asc",
        },
    });
};
