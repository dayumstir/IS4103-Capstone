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
            create_time: "desc",
        },
    });
};

export const findNotificationById = async (notification_id: string) => {
    return prisma.notification.findUnique({
        where: { notification_id },
        include: {
            transaction: true,
            issues: true,
        },
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
        orderBy: {
            create_time: "desc",
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
        orderBy: {
            create_time: "desc",
        },
    });
};

export const getCustomerNotifications = async (
    customerId: string,
    searchQuery: string
) => {
    return prisma.notification.findMany({
        where: {
            customer_id: customerId,
            OR: [
                { title: { contains: searchQuery, mode: "insensitive" } },
                { description: { contains: searchQuery, mode: "insensitive" } },
            ],
        },
        orderBy: {
            create_time: "desc",
        },
    });
};

// Update Notification
export const updateNotification = async (notificationData: INotification) => {
    return prisma.notification.update({
        where: { notification_id: notificationData.notification_id },
        data: notificationData,
    });
};
