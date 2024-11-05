// Handles database operations related to instalment plans
import { prisma } from "./db";
import {
  INotification,
  NotificationPriority,
} from "@repo/interfaces/notificationInterface";

// Create a new notification in db
export const createNotification = async (notificationData: INotification) => {
  return prisma.notification.create({ data: notificationData });
};

export const getNotifications = async () => {
  return prisma.notification.findMany({
    orderBy: {
      title: "asc",
    },
  });
};

export const findNotificationById = async (notification_id: string) => {
  return prisma.notification.findUnique({
    where: { notification_id },
  });
};

// Search Notifications
export const listAllNotificationsWithSearch = async (search: string) => {
  return prisma.notification.findMany({
    where: {
      OR: [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      notification_id: true,
      title: true,
      description: true,
      create_time: true,
      merchant_id: true,
      customer_id: true,
      admin_id: true,
    },
  });
};
