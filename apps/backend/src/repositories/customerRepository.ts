// Handles database operations related to customers
import { prisma } from "./db";
import { ICustomer } from "../interfaces/customerInterface";


// Create a new customer
export const createCustomer = async (customerData: ICustomer) => {
    return prisma.customer.create({ 
        data: customerData 
    });
};


// Find customer by id (unique attribute)
export const findCustomerById = async (customer_id: string) => {
    return prisma.customer.findUnique({ 
        where: { customer_id } 
    });
};


// Find customer by email (unique attribute)
export const findCustomerByEmail = async (email: string) => {
    return prisma.customer.findUnique({ 
        where: { email } 
    });
};


// Find customer by contact number (unique attribute)
export const findCustomerByPhoneNumber = async (contact_number: string) => {
    return prisma.customer.findUnique({
        where: { contact_number }
    });
};


// Update customer in database
export const updateCustomer = async (customer_id: string, updateData: Partial<ICustomer>) => {
    return prisma.customer.update({
        where: { customer_id: customer_id },
        data: updateData,
    });
};
