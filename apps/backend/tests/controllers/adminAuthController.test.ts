// app/backend/tests/controllers/adminAuthController.test.ts
import { Request, Response, NextFunction } from "express";
import * as adminAuthController from "../../src/controllers/adminAuthController";
import * as adminAuthService from "../../src/services/adminAuthService";
import jwt, { JwtPayload } from "jsonwebtoken";
import { BadRequestError } from "../../src/utils/error";

jest.mock("../../src/services/adminAuthService");

describe("AdminAuth Controller Tests", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { body: {}, headers: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    // ==================== 1. login ====================
    describe("login", () => {
        it("should log in an admin and return 200 status with token and details", async () => {
            req.body = { username: "adminUser", password: "password123" };
            const mockResponse = {
                jwtToken: "mockJwtToken",
                admin_type: "SUPER",
                email: "admin@example.com",
                admin_id: "admin123",
            };

            (adminAuthService.login as jest.Mock).mockResolvedValue(mockResponse.jwtToken);

            // Mock jwt.verify to return a valid payload
            jest.spyOn(jwt, "verify").mockImplementation(() => ({
                admin_type: mockResponse.admin_type,
                email: mockResponse.email,
                admin_id: mockResponse.admin_id,
            }) as JwtPayload);

            await adminAuthController.login(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResponse);
        });

        it("should handle error if login fails", async () => {
            req.body = { username: "adminUser", password: "wrongPassword" };
            const errorMessage = "Invalid credentials";
            (adminAuthService.login as jest.Mock).mockRejectedValue(new Error(errorMessage));

            await adminAuthController.login(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new Error(errorMessage));
        });
    });

    // ==================== 2. logout ====================
    describe("logout", () => {
        it("should log out an admin and return 200 status", async () => {
            req.headers = { authorization: "Bearer mockJwtToken" };
            (adminAuthService.logout as jest.Mock).mockResolvedValue(undefined);

            await adminAuthController.logout(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Logout successful" });
        });

        it("should handle error if no token is provided", async () => {
            req.headers = {}; // Explicitly setting headers

            await adminAuthController.logout(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new BadRequestError("No token provided"));
        });

        it("should handle error if logout fails", async () => {
            req.headers = { authorization: "Bearer invalidJwtToken" };
            const errorMessage = "Failed to log out";
            (adminAuthService.logout as jest.Mock).mockRejectedValue(new Error(errorMessage));

            await adminAuthController.logout(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new Error(errorMessage));
        });
    });

    // ==================== 3. resetPassword ====================
    describe("resetPassword", () => {
        it("should reset password and return 200 status", async () => {
            req.body = { email: "admin@example.com", oldPassword: "oldPass", newPassword: "newPass123" };

            (adminAuthService.resetPassword as jest.Mock).mockResolvedValue(undefined);

            await adminAuthController.resetPassword(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Password reset successful" });
        });

        it("should handle error if required fields are missing", async () => {
            req.body = { email: "admin@example.com", oldPassword: "" };

            await adminAuthController.resetPassword(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(
                new BadRequestError("Email, old password, and new password are required")
            );
        });

        it("should handle error if resetPassword fails", async () => {
            req.body = { email: "admin@example.com", oldPassword: "oldPass", newPassword: "newPass123" };
            const errorMessage = "Old password is incorrect";
            (adminAuthService.resetPassword as jest.Mock).mockRejectedValue(new Error(errorMessage));

            await adminAuthController.resetPassword(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new Error(errorMessage));
        });
    });
});
