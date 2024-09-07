// Manages customer-related actions
import { Request, Response } from "express";
import * as customerService from "../services/customerService";


export const getProfile = async(req: Request, res: Response) => {
    try {
        const customer = await customerService.getCustomerById(req.body.customer_id);
        res.status(200).json(customer);
    } catch(error: any) {
        res.status(400).json({ error: error.message });
    }
};


export const editProfile = async (req: Request, res: Response) => {
    try {
        const updatedCustomer = await customerService.updateCustomer(req.body.customer_id, req.body);
        res.status(200).json(updatedCustomer);
    } catch(error: any) {
        res.status(400).json({ error: error.message });
    }
};