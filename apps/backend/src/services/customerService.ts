// Contains the business logic related to customers
import { ICustomer } from "../interfaces/customerInterface";
import * as customerRepository from "../repositories/customerRepository";


export const getCustomerById = async (customerId: number) => {
    const customer = await customerRepository.findCustomerById(customerId);
    if (!customer) {
        throw new Error("Customer not found");
    }
    return customer;
};