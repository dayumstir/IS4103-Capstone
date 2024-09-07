// Handles database operations related to customers
import { prisma } from "./db";
import { ICustomer } from "../interfaces/customerInterface";

// Find customer by email (unique attribute) in db
export const findCustomerByEmail = async (email: string) => {
  return prisma.customer.findUnique({ where: { email } });
};

// Create a new customer in db
export const createCustomer = async (customerData: ICustomer) => {
  return prisma.customer.create({ data: customerData });
};
  