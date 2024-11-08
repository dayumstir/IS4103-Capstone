// app/backend/src/repositories/adminRepository.ts
import { prisma } from "./db";
import { IAdmin } from "@repo/interfaces";

// Create a new admin record in the database
export const createAdmin = async (adminData: IAdmin) => {
    return prisma.admin.create({ data: adminData });
};

// Find an admin by their email
export const findAdminByEmail = async (email: string) => {
    return prisma.admin.findUnique({ where: { email } });
};

// Find an admin by their username
export const findAdminByUsername = async (username: string) => {
    return prisma.admin.findUnique({ where: { username } });
};

// Find an admin by their ID
export const findAdminById = async (admin_id: string) => {
    return prisma.admin.findUnique({ where: { admin_id } });
};

// Update an admin's details by their ID
export const updateAdmin = async (admin_id: string, updateData: Partial<IAdmin>) => {
    return prisma.admin.update({
        where: { admin_id },
        data: updateData,
    });
};

// Retrieve all admins except those with admin_type "SUPER", ordered by name
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
