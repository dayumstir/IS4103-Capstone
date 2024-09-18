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

// Find All Customers
export const listAllCustomers = async () => {
    return prisma.customer.findMany();
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