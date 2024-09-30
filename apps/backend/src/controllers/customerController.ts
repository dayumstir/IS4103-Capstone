// Manages customer-related actions
import { Request, Response } from "express";
import * as customerService from "../services/customerService";
import logger from "../utils/logger";
import upload from '../config/multerConfig';


// Customer View Profile
export const getCustomerProfile = async (req: Request, res: Response) => {
    logger.info("Executing getProfile...");
    try {
        const customer_id = req.params.customer_id || req.customer_id; 

        if (!customer_id) {
          return res.status(400).json({ error: "customer_id is required" });
        }

        const customer = await customerService.getCustomerById(customer_id);
        res.status(200).json(customer);
    } catch (error: any) {
        logger.error("An error occurred:", error);
        res.status(400).json({ error: error.message });
    }
};


// Customer Edit Profile
export const editCustomerProfile = async (req: Request, res: Response) => {
    logger.info("Executing editProfile...");
    try {
        const customer_id = req.params.customer_id || req.customer_id; 

        if (!customer_id) {
          return res.status(400).json({ error: "customer_id is required" });
        }

        const updatedCustomer = await customerService.updateCustomer(
            customer_id,
            req.body
        );
        res.status(200).json(updatedCustomer);
    } catch (error: any) {
        logger.error("An error occurred:", error);
        res.status(400).json({ error: error.message });
    }
};


// List All Customers
export const listAllCustomers = async (req: Request, res: Response) => {
    logger.info("Executing listAllCustomers...");
    const { search } = req.query;
    try {
        let customers;
        if (search) {
          customers = await customerService.searchCustomers(search as string);
        } else {
          // Get all customers if no search term is provided
          customers = await customerService.getAllCustomers();
        }
        res.status(200).json(customers);
    } catch (error: any) {
        logger.error("An error occurred:", error);
        res.status(400).json({ error: error.message });
    }
};


// Endpoint to update customer profile picture
export const updateProfilePicture = [
  upload.single('profile_picture'), // Handle image upload
  async (req: Request, res: Response) => {
      const customerId = req.params.customerId;

      if (!req.file) {
          return res.status(400).json({ error: "No file uploaded." });
      }

      try {
          // Pass the image buffer to the service to update the profile picture
          await customerService.updateProfilePicture(customerId, req.file.buffer);

          res.status(200).json({ message: "Profile picture updated successfully" });
      } catch (error: any) {
          res.status(500).json({ error: error.message });
      }
  }
];