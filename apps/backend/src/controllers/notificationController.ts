// apps/backend/src/controllers/notificationController.ts
import { Request, Response, NextFunction } from "express";
import * as notificationService from "../services/notificationService";
import logger from "../utils/logger";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/error";

// Create Notification
export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing createNotification...");
    try {
        const customerMerchantFK = req.body.customer_id || req.body.merchant_id;

        if (!customerMerchantFK) {
            return next(new BadRequestError("At least one of Merchant or Customer ID is required"));
        }

        const notification = await notificationService.createNotification(req.body);
        res.status(201).json(notification);
        logger.info("Notification created successfully.");
    } catch (error: any) {
        logger.error("Error during notification creation:", error);
        next(error);
    }
};

// Get Notifications
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing getNotifications...");
    const { search } = req.query;
    try {
        const searchTerm = typeof search === "string" ? search : "";

        const notifications = search
            ? await notificationService.searchNotifications(searchTerm)
            : await notificationService.getNotifications();

        res.status(200).json(notifications);
        logger.info("Notifications retrieved successfully.");
    } catch (error: any) {
        logger.error("Error while retrieving notifications:", error);
        next(error);
    }
};

// Get Notification by ID
export const getNotification = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing getNotification...");
    try {
        const notificationId = req.params.notification_id || req.body.notification_id;

        if (!notificationId) {
            return next(new BadRequestError("Notification ID is required"));
        }

        const notification = await notificationService.getNotificationById(notificationId);
        if (!notification) {
            return next(new NotFoundError("Notification does not exist"));
        }

        res.status(200).json(notification);
        logger.info("Notification retrieved successfully.");
    } catch (error: any) {
        logger.error("Error while retrieving notification:", error);
        next(error);
    }
};

// Get Merchant Notifications
export const getMerchantNotifications = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing getMerchantNotifications...");
    try {
        const merchantId = req.merchant_id;

        if (!merchantId) {
            return next(new UnauthorizedError("Merchant ID is required"));
        }

        const { search } = req.query;

        const notifications = await notificationService.getMerchantNotifications(
            merchantId,
            search as string
        );
        res.status(200).json(notifications);
        logger.info("Merchant notifications retrieved successfully.");
    } catch (error: any) {
        logger.error("Error while retrieving merchant notifications:", error);
        next(error);
    }
};

// Get Customer Notifications
export const getCustomerNotifications = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing getCustomerNotifications...");
    try {
        const customerId = req.customer_id;

        if (!customerId) {
            return next(new UnauthorizedError("Customer ID is required"));
        }

        const { search } = req.query;

        const notifications = await notificationService.getCustomerNotifications(
            customerId,
            search as string
        );
        res.status(200).json(notifications);
        logger.info("Customer notifications retrieved successfully.");
    } catch (error: any) {
        logger.error("Error while retrieving customer notifications:", error);
        next(error);
    }
};

// Update Notification
export const updateNotification = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing updateNotification...");
    try {
        const notification = await notificationService.updateNotification(req.body);
        res.status(200).json(notification);
        logger.info("Notification updated successfully.");
    } catch (error: any) {
        logger.error("Error while updating notification:", error);
        next(error);
    }
};
