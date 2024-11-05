// Manages notification related actions
import { Request, Response } from "express";
import * as notificationService from "../services/notificationService";

// Create Notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const customerMerchantFK = req.body.customer_id || req.body.merchant_id;
    if (!customerMerchantFK) {
      return res
        .status(400)
        .json({ error: "At least one of Merchant or Customer ID is required" });
    }
    const notification = await notificationService.createNotification(req.body);
    res.status(201).json(notification);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Get Notifications
export const getNotifications = async (req: Request, res: Response) => {
  const { search } = req.query;
  try {
    const searchTerm = typeof search === "string" ? search : "";

    let notifications;
    if (search) {
      notifications = await notificationService.searchNotifications(searchTerm);
    } else {
      notifications = await notificationService.getNotifications(req.body);
    }
    res.status(201).json(notifications);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Get Notification
export const getNotification = async (req: Request, res: Response) => {
  try {
    const notificationId =
      req.params.notification_id || req.body.notification_id;

    if (!notificationId) {
      return res.status(400).json({ error: "Notification ID is required" });
    }
    const notification =
      await notificationService.getNotificationById(notificationId);
    res.status(201).json(notification);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
