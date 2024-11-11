// Contains the business logic related to notifications
import {
  INotification,
  NotificationPriority,
} from "@repo/interfaces/notificationInterface";
import * as notificationRepository from "../repositories/notificationRepository";
import logger from "../utils/logger";

export const createNotification = async (notificationData: INotification) => {
  logger.info("Executing createNotification...");
  if (
    !Object.values(NotificationPriority).includes(notificationData.priority)
  ) {
    throw new Error("Invalid priority value");
  }
  const notification = await notificationRepository.createNotification({
    ...notificationData,
    priority: notificationData.priority,
  });
  return notification;
};
export const getNotifications = async () => {
  logger.info("Executing getNotifications...");
  const notifications = await notificationRepository.getNotifications();
  return notifications;
};

export const getNotificationById = async (notification_id: string) => {
  logger.info("Executing getNotificationById...");
  const notification =
    await notificationRepository.findNotificationById(notification_id);
  if (!notification) {
    throw new Error("Notification not found");
  }
  return notification;
};

export const searchNotifications = async (searchQuery: string) => {
  logger.info(`Searching for notifications with query: ${searchQuery}`);
  const notifications =
    await notificationRepository.listAllNotificationsWithSearch(searchQuery);
  if (!notifications.length) {
    logger.warn("No notifications found matching the search criteria");
    return [];
  }
  return notifications;
};

export const getMerchantNotifications = async (merchantId: string, searchQuery: string) => {
  logger.info(`Searching for notifications with query: ${searchQuery}`);
  const notifications = await notificationRepository.getMerchantNotifications(merchantId, searchQuery);
  return notifications;
};
