// apps/backend/src/services/notificationService.ts
import {
    INotification,
    NotificationPriority,
} from "@repo/interfaces/notificationInterface";
import * as notificationRepository from "../repositories/notificationRepository";
import logger from "../utils/logger";
import { NotFoundError, BadRequestError } from "../utils/error";

// Create Notification
export const createNotification = async (notificationData: INotification) => {
    logger.info("Creating notification...");
    
    if (!Object.values(NotificationPriority).includes(notificationData.priority)) {
        logger.error("Invalid priority value provided:", notificationData.priority);
        throw new BadRequestError("Invalid priority value");
    }

    const notification = await notificationRepository.createNotification({
        ...notificationData,
        priority: notificationData.priority,
    });

    logger.info("Notification created successfully", notification.notification_id);
    return notification;
};

// Get All Notifications
export const getNotifications = async () => {
    logger.info("Fetching all notifications...");
    const notifications = await notificationRepository.getNotifications();
    logger.info(`Fetched ${notifications.length} notifications`);
    return notifications;
};

// Get Notification by ID
export const getNotificationById = async (notification_id: string) => {
    logger.info(`Fetching notification by ID: ${notification_id}`);

    const notification = await notificationRepository.findNotificationById(notification_id);
    if (!notification) {
        logger.error(`Notification not found for ID: ${notification_id}`);
        throw new NotFoundError("Notification not found");
    }

    logger.info("Notification fetched successfully", notification.notification_id);
    return notification;
};

// Search Notifications
export const searchNotifications = async (searchQuery: string) => {
    logger.info(`Searching for notifications with query: ${searchQuery}`);
    const notifications = await notificationRepository.listAllNotificationsWithSearch(searchQuery);

    if (!notifications.length) {
        logger.warn("No notifications found matching the search criteria");
        return [];
    }

    logger.info(`Found ${notifications.length} notifications matching the search criteria`);
    return notifications;
};

// Get Merchant Notifications
export const getMerchantNotifications = async (merchantId: string, searchQuery: string) => {
    logger.info(`Fetching notifications for merchant: ${merchantId} with query: ${searchQuery}`);
    const notifications = await notificationRepository.getMerchantNotifications(merchantId, searchQuery);

    logger.info(`Fetched ${notifications.length} notifications for merchant: ${merchantId}`);
    return notifications;
};

// Get Customer Notifications
export const getCustomerNotifications = async (customerId: string, searchQuery: string) => {
    logger.info(`Fetching notifications for customer: ${customerId} with query: ${searchQuery}`);
    const notifications = await notificationRepository.getCustomerNotifications(customerId, searchQuery);

    logger.info(`Fetched ${notifications.length} notifications for customer: ${customerId}`);
    return notifications;
};

// Update Notification
export const updateNotification = async (notificationData: INotification) => {
    logger.info(`Updating notification with ID: ${notificationData.notification_id}`);

    const notification = await notificationRepository.updateNotification(notificationData);
    if (!notification) {
        logger.error(`Failed to update notification with ID: ${notificationData.notification_id}`);
        throw new NotFoundError("Notification not found");
    }

    logger.info("Notification updated successfully", notification.notification_id);
    return notification;
};
