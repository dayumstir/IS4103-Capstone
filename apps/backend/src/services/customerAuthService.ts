// Contains authentication logic, like JWT generation, verification
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ICustomer } from "../interfaces/customerInterface";
import * as customerRepository from "../repositories/customerRepository";
import * as tokenRepository from "../repositories/tokenRepository";


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
    const token = jwt.sign({ customer_id: newCustomer.customer_id }, process.env.JWT_SECRET!, { expiresIn: "1h"});

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
    const token = jwt.sign({ customer_id: customer.customer_id }, process.env.JWT_SECRET!, { expiresIn: "1h"});

    return token;
};


export const logout = async (token: string) => {
    try {
        // Decode the JWT token to extract its expiration time
        const decoded = jwt.decode(token) as any;

        if (!decoded || !decoded.exp) {
            throw new Error("Invalid token");
        }

        const expiresAt = new Date(decoded.exp * 1000);  // Convert expiration time to Date object

        await tokenRepository.blacklistToken(token, expiresAt);
    } catch (error: any) {
        throw new Error(error.message || "Failed to log out");
    }
};


export const resetPassword = async (email: string, newPassword: string ) => {
    const customer = await customerRepository.findCustomerByEmail(email);
    if (!customer) {
        throw new Error("Customer not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await customerRepository.updateCustomer(customer.customer_id, { password: hashedPassword });
};
