// Handles database operations related to customers
import { PrismaClient } from "@prisma/client";
import { ICustomer } from "../interfaces/customerInterface";

const prisma = new PrismaClient();

// Find customer by email (unique attribute) in db
export const findCustomerByEmail = async (email: string) => {
    return prisma.customer.findUnique({ where: { email } });
};

// Create a new customer in db
export const createCustomer = async (customerData: ICustomer) => {
    return prisma.customer.create({ data: customerData });
}