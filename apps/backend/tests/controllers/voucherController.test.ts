// app/backend/tests/controllers/voucherController.test.ts
import { Request, Response, NextFunction } from "express";
import * as voucherController from "../../src/controllers/voucherController";
import * as voucherService from "../../src/services/voucherService";
import * as customerService from "../../src/services/customerService";
import { UnauthorizedError, BadRequestError, NotFoundError } from "../../src/utils/error";

jest.mock("../../src/services/voucherService");
jest.mock("../../src/services/customerService");

describe("Voucher Controller Tests", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { body: {}, params: {}, query: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    // ==================== 1. createVoucher ====================
    describe("createVoucher", () => {
        it("should create a voucher and return 201 status", async () => {
            req.body = { title: "Test Voucher" };
            req.admin_id = "admin123";
            const mockVoucher = { voucher_id: "1", title: "Test Voucher" };
            (voucherService.createVoucher as jest.Mock).mockResolvedValue(mockVoucher);

            await voucherController.createVoucher(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockVoucher);
        });

        it("should handle unauthorized error if admin_id is missing", async () => {
            req.body = { title: "Test Voucher" };
            req.admin_id = undefined;

            await voucherController.createVoucher(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new UnauthorizedError("Unauthorized: admin_id is missing"));
        });
    });

    // ==================== 2. assignVoucher ====================
    describe("assignVoucher", () => {
        it("should assign a voucher to a customer and return 201 status", async () => {
            req.body = { voucher_id: "voucher123", email: "test@example.com" };
            const mockCustomer = { customer_id: "customer123" };
            const mockVoucherAssignment = { voucher_assigned_id: "assigned123" };

            (customerService.getCustomerByEmail as jest.Mock).mockResolvedValue(mockCustomer);
            (voucherService.assignVoucher as jest.Mock).mockResolvedValue(mockVoucherAssignment);

            await voucherController.assignVoucher(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockVoucherAssignment);
        });

        it("should handle error if customer is not found", async () => {
            req.body = { voucher_id: "voucher123", email: "test@example.com" };

            (customerService.getCustomerByEmail as jest.Mock).mockResolvedValue(null);

            await voucherController.assignVoucher(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new NotFoundError("Customer not found"));
        });
    });

    // ==================== 3. deactivateVoucher ====================
    describe("deactivateVoucher", () => {
        it("should deactivate a voucher and return 200 status", async () => {
            req.params = { voucher_id: "voucher123" };
            const mockVoucher = { voucher_id: "voucher123", is_active: false };

            (voucherService.deactivateVoucher as jest.Mock).mockResolvedValue(mockVoucher);

            await voucherController.deactivateVoucher(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Voucher deactivated successfully", voucher: mockVoucher });
        });

        it("should handle error if voucher is not found", async () => {
            req.params = { voucher_id: "voucher123" };

            (voucherService.deactivateVoucher as jest.Mock).mockRejectedValue(new NotFoundError("Voucher not found"));

            await voucherController.deactivateVoucher(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new NotFoundError("Voucher not found"));
        });
    });

    // ==================== 4. getAllVouchers ====================
    describe("getAllVouchers", () => {
        it("should retrieve all vouchers and return 200 status", async () => {
            const mockVouchers = [{ voucher_id: "1", title: "Voucher 1" }];

            (voucherService.getAllVouchers as jest.Mock).mockResolvedValue(mockVouchers);

            await voucherController.getAllVouchers(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockVouchers);
        });

        it("should handle error during voucher retrieval", async () => {
            (voucherService.getAllVouchers as jest.Mock).mockRejectedValue(new Error("Database error"));

            await voucherController.getAllVouchers(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new Error("Database error"));
        });
    });

    // ==================== 5. getVoucherDetails ====================
    describe("getVoucherDetails", () => {
        it("should retrieve voucher details and return 200 status", async () => {
            req.params = { voucher_id: "voucher123" };
            const mockVoucher = { voucher_id: "voucher123", title: "Voucher 123" };

            (voucherService.getVoucherDetails as jest.Mock).mockResolvedValue(mockVoucher);

            await voucherController.getVoucherDetails(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockVoucher);
        });

        it("should handle error if voucher is not found", async () => {
            req.params = { voucher_id: "voucher123" };

            (voucherService.getVoucherDetails as jest.Mock).mockResolvedValue(null);

            await voucherController.getVoucherDetails(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new NotFoundError("Voucher does not exist"));
        });
    });

    // ==================== 6. getCustomerVouchers ====================
    describe("getCustomerVouchers", () => {
        it("should retrieve vouchers assigned to a customer and return 200 status", async () => {
            req.params = { customer_id: "customer123" };
            const mockVouchers = [{ voucher_assigned_id: "assigned123", status: "AVAILABLE" }];

            (voucherService.getCustomerVouchers as jest.Mock).mockResolvedValue(mockVouchers);

            await voucherController.getCustomerVouchers(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockVouchers);
        });

        it("should handle error if customer_id is missing", async () => {
            req.params = {};

            await voucherController.getCustomerVouchers(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(new BadRequestError("customer_id is required"));
        });
    });
});
