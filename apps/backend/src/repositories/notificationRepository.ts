// Handles database operations related to instalment plans
import { prisma } from "./db";
import { INotification } from "@repo/interfaces/notificationInterface";

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

export const getMerchantNotifications = async (
    merchantId: string,
    searchQuery: string
) => {
    return prisma.notification.findMany({
        where: {
            merchant_id: merchantId,
            OR: [
                { title: { contains: searchQuery, mode: "insensitive" } },
                { description: { contains: searchQuery, mode: "insensitive" } },
            ],
        },
    });
};
