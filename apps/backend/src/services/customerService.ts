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
    const customer = await customerRepository.updateCustomer(customer_id, updateData);
    if (!customer) {
        throw new Error("Customer not found");
    }
    return customer;
};
