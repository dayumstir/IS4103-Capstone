// apps/backend/tests/controllers/notificationController.test.ts
import { Request, Response, NextFunction } from "express";
import * as notificationController from "../../src/controllers/notificationController";
import * as notificationService from "../../src/services/notificationService";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../src/utils/error";

jest.mock("../../src/services/notificationService");

describe("Notification Controller Tests", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { body: {}, params: {}, query: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    // ==================== 1. createNotification ====================
    describe("createNotification", () => {
        it("should create a notification and return 201 status", async () => {
            req.body = { title: "Test Notification", merchant_id: "merchant123" };
            const mockNotification = { notification_id: "1", title: "Test Notification" };
            (notificationService.createNotification as jest.Mock).mockResolvedValue(mockNotification);

            await notificationController.createNotification(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockNotification);
        });

        it("should handle error if customer and merchant ID are missing", async () => {
            req.body = { title: "Test Notification" };

            await notificationController.createNotification(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new BadRequestError("At least one of Merchant or Customer ID is required"));
        });
    });

    // ==================== 2. getNotifications ====================
    describe("getNotifications", () => {
        it("should retrieve all notifications and return 200 status", async () => {
            const mockNotifications = [{ notification_id: "1", title: "Notification 1" }];
            (notificationService.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);

            await notificationController.getNotifications(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockNotifications);
        });

        it("should handle error during notification retrieval", async () => {
            (notificationService.getNotifications as jest.Mock).mockRejectedValue(new Error("Database error"));

            await notificationController.getNotifications(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new Error("Database error"));
        });
    });

    // ==================== 3. getNotification ====================
    describe("getNotification", () => {
        it("should retrieve a notification by ID and return 200 status", async () => {
            req.params = { notification_id: "1" };
            const mockNotification = { notification_id: "1", title: "Notification 1" };
            (notificationService.getNotificationById as jest.Mock).mockResolvedValue(mockNotification);

            await notificationController.getNotification(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockNotification);
        });

        it("should handle error if notification ID is missing", async () => {
            req.params = {};

            await notificationController.getNotification(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new BadRequestError("Notification ID is required"));
        });
    });

    // ==================== 4. getMerchantNotifications ====================
    describe("getMerchantNotifications", () => {
        it("should retrieve merchant notifications and return 200 status", async () => {
            req.merchant_id = "merchant123";
            const mockNotifications = [{ notification_id: "1", title: "Merchant Notification" }];
            (notificationService.getMerchantNotifications as jest.Mock).mockResolvedValue(mockNotifications);

            await notificationController.getMerchantNotifications(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockNotifications);
        });

        it("should handle error if merchant ID is missing", async () => {
            req.merchant_id = undefined;

            await notificationController.getMerchantNotifications(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new UnauthorizedError("Merchant ID is required"));
        });
    });

    // ==================== 5. getCustomerNotifications ====================
    describe("getCustomerNotifications", () => {
        it("should retrieve customer notifications and return 200 status", async () => {
            req.customer_id = "customer123";
            const mockNotifications = [{ notification_id: "1", title: "Customer Notification" }];
            (notificationService.getCustomerNotifications as jest.Mock).mockResolvedValue(mockNotifications);

            await notificationController.getCustomerNotifications(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockNotifications);
        });

        it("should handle error if customer ID is missing", async () => {
            req.customer_id = undefined;

            await notificationController.getCustomerNotifications(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new UnauthorizedError("Customer ID is required"));
        });
    });

    // ==================== 6. updateNotification ====================
    describe("updateNotification", () => {
        it("should update a notification and return 200 status", async () => {
            req.body = { notification_id: "1", title: "Updated Notification" };
            const mockNotification = { notification_id: "1", title: "Updated Notification" };
            (notificationService.updateNotification as jest.Mock).mockResolvedValue(mockNotification);

            await notificationController.updateNotification(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockNotification);
        });

        it("should handle error during notification update", async () => {
            req.body = { notification_id: "1", title: "Updated Notification" };

            (notificationService.updateNotification as jest.Mock).mockRejectedValue(new Error("Update failed"));

            await notificationController.updateNotification(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new Error("Update failed"));
        });
    });
});
