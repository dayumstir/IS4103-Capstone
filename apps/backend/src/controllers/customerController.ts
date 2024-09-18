// Manages customer-related actions
import { Request, Response } from "express";
import * as customerService from "../services/customerService";
import logger from "../utils/logger";


// Customer View Profile
export const getProfile = async (req: Request, res: Response) => {
    logger.info('Executing getProfile...');
    try {
        // Currently, the controller supplies id based on the decoded JWT.
        // TODO: To allow admin to view other customer profiles, customer_id will be sent in via params. A check is needed
        // 1. If params present, use that id. If not present, means customer itself is the one viewing their own profile.
        const customer = await customerService.getCustomerById(req.body.customer_id);
        res.status(200).json(customer);
    } catch(error: any) {
        logger.error('An error occurred:', error);
        res.status(400).json({ error: error.message });
    }
};


// Customer Edit Profile
export const editProfile = async (req: Request, res: Response) => {
    logger.info('Executing editProfile...');
    try {
        // Currently, the controller supplies id based on the decoded JWT.
        // TODO: To allow admin to edit other customer profiles, customer_id will be sent in via params. A check is needed
        // 1. If params present, use that id. If not present, means customer itself is the one editing their own profile.
        // Should not be allowed to edit id attribute.
        const updatedCustomer = await customerService.updateCustomer(req.body.customer_id, req.body);
        res.status(200).json(updatedCustomer);
    } catch(error: any) {
        res.status(400).json({ error: error.message });
    }
};

// List All Customers
export const listAllCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await customerService.getAllCustomers();
        res.status(200).json(customers);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
