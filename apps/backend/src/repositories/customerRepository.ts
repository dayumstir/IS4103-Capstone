// Handles database operations related to customers
import { prisma } from "./db";
import { ICustomer } from "../interfaces/customerInterface";


// Create a new customer in db
export const createCustomer = async (customerData: ICustomer) => {
    return prisma.customer.create({ data: customerData });
};


// Find customer by email (unique attribute) in db
export const findCustomerByEmail = async (email: string) => {
    return prisma.customer.findUnique({ 
        where: { email } 
    });
};


// Find customer by id (unique attribute) in db
export const findCustomerById = async (customer_id: string) => {
    return prisma.customer.findUnique({ where: { customer_id } });
};


// Update customer in db
export const updateCustomer = async (customer_id: string, updateData: Partial<ICustomer>) => {
    return prisma.customer.update({
        where: { customer_id: customer_id },
        data: updateData,
    });
};


// Update customer status by email
export const updateCustomerStatusByEmail = async (email: string, status: string) => {
    return prisma.customer.update({
        where: { email },
        data: { status },
    });
};


// Update customer status by phone
export const updateCustomerStatusByPhone = async (contact_number: string, status: string) => {
    return prisma.customer.update({
        where: { contact_number },
        data: { status },
    });
};
