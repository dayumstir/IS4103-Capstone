// Manages customer-related actions
import { Request, Response } from "express";
import * as customerService from "../services/customerService";
import logger from "../utils/logger";
import upload from '../config/multerConfig';


// Customer View Profile
export const getCustomerProfile = async (req: Request, res: Response) => {
  logger.info("Executing getProfile...");
  try {
    // Currently, the controller supplies id based on the decoded JWT.
    // TODO: To allow admin to view other customer profiles, customer_id will be sent in via params. A check is needed
    // 1. If params present, use that id. If not present, means customer itself is the one viewing their own profile.
    const customerId = req.params.customer_id || req.body.customer_id; // Fallback to body customer_id if not present

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    const customer = await customerService.getCustomerById(customerId);
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
    // Currently, the controller supplies id based on the decoded JWT.
    // TODO: To allow admin to edit other customer profiles, customer_id will be sent in via params. A check is needed
    // 1. If params present, use that id. If not present, means customer itself is the one editing their own profile.
    // Should not be allowed to edit id attribute.
    console.log(req.body);
    const updatedCustomer = await customerService.updateCustomer(
      req.body.customer_id,
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
  try {
    const customers = await customerService.getAllCustomers();
    res.status(200).json(customers);
  } catch (error: any) {
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