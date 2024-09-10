// Contains the business logic related to customers
import { ICustomer } from "../interfaces/customerInterface";
import * as customerRepository from "../repositories/customerRepository";


export const getCustomerById = async (customer_id: number) => {
    const customer = await customerRepository.findCustomerById(customer_id);
    if (!customer) {
        throw new Error("Customer not found");
    }
    return customer;
};


export const updateCustomer = async (customer_id: number, updateData: Partial<ICustomer>) => {
    const customer = await customerRepository.updateCustomer(customer_id, updateData);
    if (!customer) {
        throw new Error("Customer not found");
    }
    return customer;
};