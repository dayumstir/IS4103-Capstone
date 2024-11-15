// apps/backend/tests/controllers/adminController.test.ts
import { Request, Response, NextFunction } from "express";
import * as adminController from "../../src/controllers/adminController";
import * as adminService from "../../src/services/adminService";
import { BadRequestError, UnauthorizedError } from "../../src/utils/error";
import { AdminType } from "@repo/interfaces";

jest.mock("../../src/services/adminService");

describe("Admin Controller Tests", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { body: {}, params: {}, headers: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    // ==================== 1. getProfile ====================
    describe("getProfile", () => {
        it("should return the admin profile with 200 status", async () => {
            req.admin_id = "admin123";
            const mockAdmin = { admin_id: "admin123", name: "Admin User" };
            (adminService.getById as jest.Mock).mockResolvedValue(mockAdmin);

            await adminController.getProfile(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockAdmin);
        });

        it("should handle error if admin_id is missing", async () => {
            req.admin_id = undefined;

            await adminController.getProfile(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new UnauthorizedError("admin_id is required"));
        });
    });

    // ==================== 2. getProfileById ====================
    describe("getProfileById", () => {
        it("should return the admin profile by ID with 200 status", async () => {
            req.params = { admin_id: "admin123" };
            const mockAdmin = { admin_id: "admin123", name: "Admin User" };
            (adminService.getById as jest.Mock).mockResolvedValue(mockAdmin);

            await adminController.getProfileById(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockAdmin);
        });

        it("should handle error if admin_id is missing", async () => {
            req.params = {};

            await adminController.getProfileById(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new BadRequestError("admin_id is required"));
        });
    });

    // ==================== 3. editProfile ====================
    describe("editProfile", () => {
        it("should update and return the admin profile with 200 status", async () => {
            req.admin_id = "admin123";
            req.body = { name: "Updated Admin" };
            const mockUpdatedAdmin = { admin_id: "admin123", name: "Updated Admin" };
            (adminService.update as jest.Mock).mockResolvedValue(mockUpdatedAdmin);

            await adminController.editProfile(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUpdatedAdmin);
        });

        it("should handle error if admin_id is missing", async () => {
            req.admin_id = undefined;

            await adminController.editProfile(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new UnauthorizedError("admin_id is required"));
        });
    });

    // ==================== 4. addAdmin ====================
    describe("addAdmin", () => {
        it("should add a new admin and send verification email", async () => {
            req.body = { username: "newAdmin", email: "admin@example.com" };
            const mockAdmin = {
                admin: {
                    admin_id: "admin123",
                    email: "admin@example.com",
                    username: "newAdmin",
                    admin_type: AdminType.UNVERIFIED,
                },
                password: "generatedPassword",
            };
            (adminService.add as jest.Mock).mockResolvedValue(mockAdmin);
            (adminService.sendEmailVerification as jest.Mock).mockResolvedValue(undefined);

            await adminController.addAdmin(req as Request, res as Response, next);

            expect(adminService.sendEmailVerification).toHaveBeenCalledWith(
                mockAdmin.admin.email,
                mockAdmin.admin.username,
                mockAdmin.password
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockAdmin);
        });

        it("should handle error if addAdmin fails", async () => {
            req.body = { username: "newAdmin", email: "admin@example.com" };
            const errorMessage = "Email already exists";
            (adminService.add as jest.Mock).mockRejectedValue(new Error(errorMessage));

            await adminController.addAdmin(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new Error(errorMessage));
        });
    });

    // ==================== 5. getAllAdmins ====================
    describe("getAllAdmins", () => {
        it("should return all admins with 200 status", async () => {
            const mockAdmins = [
                { admin_id: "admin123", name: "Admin User" },
                { admin_id: "admin124", name: "Another Admin" },
            ];
            (adminService.getAllAdmins as jest.Mock).mockResolvedValue(mockAdmins);

            await adminController.getAllAdmins(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockAdmins);
        });

        it("should handle error if getAllAdmins fails", async () => {
            const errorMessage = "Database error";
            (adminService.getAllAdmins as jest.Mock).mockRejectedValue(new Error(errorMessage));

            await adminController.getAllAdmins(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new Error(errorMessage));
        });
    });

    // ==================== 6. deactivateAdmin ====================
    describe("deactivateAdmin", () => {
        it("should deactivate the admin and return 200 status", async () => {
            req.body = { admin_id: "admin123" };
            const mockDeactivatedAdmin = { admin_id: "admin123", admin_type: AdminType.DEACTIVATED };
            (adminService.deactivateAdmin as jest.Mock).mockResolvedValue(mockDeactivatedAdmin);

            await adminController.deactivateAdmin(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockDeactivatedAdmin);
        });

        it("should handle error if admin_id is missing", async () => {
            req.body = {};

            await adminController.deactivateAdmin(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new BadRequestError("admin_id is required"));
        });
    });

    // ==================== 7. activateAdmin ====================
    describe("activateAdmin", () => {
        it("should activate the admin and return 200 status", async () => {
            req.body = { admin_id: "admin123" };
            const mockActivatedAdmin = { admin_id: "admin123", admin_type: AdminType.NORMAL };
            (adminService.activateAdmin as jest.Mock).mockResolvedValue(mockActivatedAdmin);

            await adminController.activateAdmin(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockActivatedAdmin);
        });

        it("should handle error if admin_id is missing", async () => {
            req.body = {};

            await adminController.activateAdmin(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new BadRequestError("admin_id is required"));
        });
    });
});
