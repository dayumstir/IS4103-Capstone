// Defines the structure and methods related to customer data
import { PrismaClient } from "@prisma/client"
import { ICustomer } from "../interfaces/customerInterface";

const prisma = new PrismaClient();

export const Customer = prisma.Customer;

export const createCustomer = async (customerData: ICustomer) => {
    const customer = await Customer.create({
        data: customerData,
    });
    return customer;
}