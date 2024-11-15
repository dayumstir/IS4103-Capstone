// apps/backend/src/repositories/notificationRepository.ts
import { prisma } from "./db";
import { INotification } from "@repo/interfaces/notificationInterface";
import { NotFoundError } from "../utils/error";

// Create Notification
export const createNotification = async (notificationData: INotification) => {
    return await prisma.notification.create({
        data: notificationData,
    });
};

// Get All Notifications
export const getNotifications = async () => {
    return await prisma.notification.findMany({
        orderBy: {
            create_time: "desc",
        },
    });
};

// Get Notification by ID
export const findNotificationById = async (notification_id: string) => {
    const notification = await prisma.notification.findUnique({
        where: { notification_id },
        include: {
            transaction: true,
            issues: true,
        },
    });

    if (!notification) {
        throw new NotFoundError("Notification not found");
    }

    return notification;
};

// Search Notifications
export const listAllNotificationsWithSearch = async (search: string) => {
    return await prisma.notification.findMany({
        where: {
            OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
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

// Get Merchant Notifications
export const getMerchantNotifications = async (
    merchantId: string,
    searchQuery: string
) => {
    return await prisma.notification.findMany({
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

// Get Customer Notifications
export const getCustomerNotifications = async (
    customerId: string,
    searchQuery: string
) => {
    return await prisma.notification.findMany({
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
    const notification = await prisma.notification.update({
        where: { notification_id: notificationData.notification_id },
        data: notificationData,
    });

    if (!notification) {
        throw new NotFoundError("Notification not found");
    }

    return notification;
};
