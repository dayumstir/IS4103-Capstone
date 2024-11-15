// src/services/customerService.ts
import { ICustomer } from "@repo/interfaces";
import * as customerRepository from "../repositories/customerRepository";
import logger from "../utils/logger";
import { NotFoundError, BadRequestError } from "../utils/error";

export const getCustomerById = async (customer_id: string) => {
    logger.info("Executing getCustomerById...");
    const customer = await customerRepository.findCustomerById(customer_id);
    if (!customer) {
        throw new Error("Customer not found");
    }
    return customer;
};

export const getCustomerByEmail = async (email: string) => {
    logger.info("Executing getCustomerByEmail...");
    const customer = await customerRepository.findCustomerByEmail(email);
    if (!customer) {
        throw new NotFoundError("Customer not found");
    }
    return customer;
};

export const updateCustomer = async (
    customer_id: string,
    updateData: Partial<ICustomer>
) => {
    logger.info("Executing updateCustomer...");
    // Prevent email and phone number from being edited
    if (updateData.email || updateData.contact_number) {
        throw new Error("Email and phone number cannot be edited");
    }

    const customer = await customerRepository.updateCustomer(
        customer_id,
        updateData
    );
    if (!customer) {
        throw new Error("Customer not found");
    }
    return customer;
};

// List all customers
export const getAllCustomers = async () => {
    const customers = await customerRepository.listAllCustomers();
    if (!customers || customers.length === 0) {
        throw new Error("No customers found");
    }
    return customers;
};

// Update the customer's wallet balance
export const topUpWallet = async (customer_id: string, amount: number) => {
    logger.info(`Topping up wallet balance for customer: ${customer_id}`, customer_id);
    const customer = await customerRepository.topUpWallet(customer_id, amount);
    if (!customer) {
        throw new NotFoundError("Customer not found");
    }
    return customer;
};

// Search customers
export const searchCustomers = async (searchQuery: string) => {
    logger.info(`Searching for customers with query: ${searchQuery}`);
    const customers =
        await customerRepository.listAllCustomersWithSearch(searchQuery);
    if (!customers.length) {
        logger.warn("No customers found matching the search criteria");
        return [];
    }
    return customers;
};

// Update the customer's profile picture in the database
export const updateProfilePicture = async (customerId: string, profilePictureBuffer: Buffer) => {
    logger.info("Updating profile picture for customer:", customerId);

    // Update the profile picture in the database
    await customerRepository.updateCustomer(customerId, {
        profile_picture: profilePictureBuffer,
    });
};

// Get the customer's instalment plans
export const getInstalmentPlans = async (customerId: string) => {
    logger.info("Getting instalment plans for customer:", customerId);
    const instalmentPlans =
        await customerRepository.getInstalmentPlans(customerId);
    if (!instalmentPlans || instalmentPlans.length === 0) {
        logger.warn("No instalment plans found for the customer");
        return [];
    }
    return instalmentPlans;
};
