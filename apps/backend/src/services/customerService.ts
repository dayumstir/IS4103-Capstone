// Contains the business logic related to customers
import { ICustomer } from "../interfaces/customerInterface";
import * as customerRepository from "../repositories/customerRepository";
import logger from "../utils/logger";


export const getCustomerById = async (customer_id: string) => {
    logger.info('Executing getCustomerById...');
    const customer = await customerRepository.findCustomerById(customer_id);
    if (!customer) {
        throw new Error("Customer not found");
    }
    return customer;
};


export const updateCustomer = async (customer_id: string, updateData: Partial<ICustomer>) => {
    logger.info('Executing updateCustomer...');

    // Prevent email and phone number from being edited
    if (updateData.email || updateData.contact_number) {
        throw new Error("Email and phone number cannot be edited");
    }

    const customer = await customerRepository.updateCustomer(customer_id, updateData);
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


// Update the customer's profile picture in the database
export const updateProfilePicture = async (customerId: string, profilePictureBuffer: Buffer) => {
    logger.info('Updating profile picture for customer:', customerId);

    // Update the profile picture in the database
    await customerRepository.updateCustomer(customerId, { profile_picture: profilePictureBuffer });
};
