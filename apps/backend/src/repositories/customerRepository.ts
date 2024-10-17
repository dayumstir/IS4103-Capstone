// Handles database operations related to customers
import { prisma } from "./db";
import { ICustomer } from "../interfaces/customerInterface";

// Create a new customer
export const createCustomer = async (customerData: ICustomer) => {
    return prisma.customer.create({
        data: customerData,
    });
};

// Find customer by id (unique attribute)
export const findCustomerById = async (customer_id: string) => {
    return prisma.customer.findUnique({
        where: { customer_id },
    });
};

// Find customer by email (unique attribute)
export const findCustomerByEmail = async (email: string) => {
    return prisma.customer.findUnique({
        where: { email },
    });
};

// Find customer by contact number
export const findCustomerByContactNumber = async (contact_number: string) => {
    return prisma.customer.findFirst({
        where: { contact_number },
    });
};

// Update customer in database
export const updateCustomer = async (
    customer_id: string,
    updateData: Partial<ICustomer>
) => {
    return prisma.customer.update({
        where: { customer_id: customer_id },
        data: updateData,
    });
};

// Find All Customers
export const listAllCustomers = async () => {
    return prisma.customer.findMany();
};

// Search Customers
export const listAllCustomersWithSearch = async (search: string) => {
    return prisma.customer.findMany({
        where: {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    email: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    contact_number: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        },
    });
};

// Get the customer's instalment plans
export const getInstalmentPlans = async (customer_id: string) => {
    const customer = await prisma.customer.findUnique({
        where: { customer_id: customer_id },
    });

    if (!customer) {
        throw new Error("Customer not found");
    }

    const creditTier = await prisma.creditTier.findFirst({
        where: {
            min_credit_score: { lte: customer.credit_score },
            max_credit_score: { gte: customer.credit_score },
        },
        include: {
            instalment_plans: true,
        },
    });

    if (!creditTier) {
        throw new Error("No credit tier found for the customer's credit score");
    }

    return creditTier.instalment_plans;
};

// Update the customer's wallet balance
export const topUpWallet = async (customer_id: string, amount: number) => {
    return await prisma.customer.update({
        where: { customer_id },
        data: {
            wallet_balance: {
                increment: amount,
            },
        },
    });
};
