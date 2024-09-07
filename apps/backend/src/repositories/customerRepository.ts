// Handles database operations related to customers
import { prisma } from "./db";
import { ICustomer } from "../interfaces/customerInterface";


// Find customer by email (unique attribute) in db
export const findCustomerByEmail = async (email: string) => {
    return prisma.customer.findUnique({ where: { email } });
};


// Find customer by id (unique attribute) in db
export const findCustomerById = async (customer_id: number) => {
    return prisma.customer.findUnique({ where: { customer_id } });
};


// Create a new customer in db
export const createCustomer = async (customerData: ICustomer) => {
    return prisma.customer.create({ data: customerData });
};
  