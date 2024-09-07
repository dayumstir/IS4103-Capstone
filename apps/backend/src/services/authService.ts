// Contains authentication logic, like JWT generation, verification
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ICustomer } from "../interfaces/customerInterface";
import * as customerRepository from "../repositories/customerRepository";


export const register = async (customerData: ICustomer) => {
    const { email, password } = customerData;

    // Check for existing customer in db
    const existingCustomer = await customerRepository.findCustomerByEmail(email);
    if (existingCustomer) {
        throw new Error("Customer already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer record in db
    const newCustomer = await customerRepository.createCustomer({
        ...customerData,
        password: hashedPassword,
    });

    // Generate JWT
    // TODO: Create .env folder with JWT Secret
    const token = jwt.sign({ customerId: newCustomer.customer_id }, process.env.JWT_SECRET!, { expiresIn: "1h"});

    return { customer: newCustomer, token };
};


export const login = async (loginData: { email: string; password: string }) => {
    const { email, password } = loginData;

    // Check for existing customer in db
    const customer = await customerRepository.findCustomerByEmail(email);
    if (!customer) {
        throw new Error("Invalid credentials");
    }

    // Check if passwords match
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    // Generate JWT
    const token = jwt.sign({ customerId: customer.customer_id }, process.env.JWT_SECRET!, { expiresIn: "1h"});

    return token;
}