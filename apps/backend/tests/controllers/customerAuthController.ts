// tests/controllers/customerAuthController.test.ts

import { Request, Response, NextFunction } from "express";
import * as customerAuthController from "../../src/controllers/customerAuthController";
import * as customerAuthService from "../../src/services/customerAuthService";
import { BadRequestError } from "../../src/utils/error";
import logger from "../../src/utils/logger";

jest.mock("../../src/services/customerAuthService");
jest.mock("../../src/utils/logger");

describe("Customer Auth Controller Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { body: {}, headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("registerCustomer", () => {
    it("should register a customer and send email verification", async () => {
      req.body = { email: "test@example.com", password: "password123" };
      const mockCustomer = { customer_id: "customer123", email: "test@example.com" };

      (customerAuthService.registerCustomer as jest.Mock).mockResolvedValue(mockCustomer);
      (customerAuthService.sendEmailVerification as jest.Mock).mockResolvedValue(undefined);

      await customerAuthController.registerCustomer(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Customer registered. A confirmation link has been sent to your email.",
        customer: mockCustomer,
      });
    });

    it("should handle errors during registration", async () => {
      req.body = { email: "test@example.com", password: "password123" };
      const error = new Error("Registration failed");

      (customerAuthService.registerCustomer as jest.Mock).mockRejectedValue(error);

      await customerAuthController.registerCustomer(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith("An error occurred:", error);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("confirmEmail", () => {
    it("should confirm email and return success message", async () => {
      req.body = { token: "valid_token" };

      (customerAuthService.confirmEmail as jest.Mock).mockResolvedValue(undefined);

      await customerAuthController.confirmEmail(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email confirmed. Please verify your phone number.",
      });
    });

    it("should handle errors during email confirmation", async () => {
      req.body = { token: "invalid_token" };
      const error = new Error("Invalid token");

      (customerAuthService.confirmEmail as jest.Mock).mockRejectedValue(error);

      await customerAuthController.confirmEmail(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith("An error occurred:", error);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("sendPhoneNumberOTP", () => {
    it("should send OTP to phone number", async () => {
      req.body = { contact_number: "+1234567890" };

      (customerAuthService.sendPhoneNumberOTP as jest.Mock).mockResolvedValue(undefined);

      await customerAuthController.sendPhoneNumberOTP(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "OTP sent to phone." });
    });

    it("should handle errors during OTP sending", async () => {
      req.body = { contact_number: "+1234567890" };
      const error = new Error("Failed to send OTP");

      (customerAuthService.sendPhoneNumberOTP as jest.Mock).mockRejectedValue(error);

      await customerAuthController.sendPhoneNumberOTP(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith("An error occurred:", error);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("verifyPhoneNumberOTP", () => {
    it("should verify OTP and return JWT token", async () => {
      req.body = { otp: "123456" };
      const mockJwtToken = "jwt_token";

      (customerAuthService.verifyPhoneNumberOTP as jest.Mock).mockResolvedValue(mockJwtToken);

      await customerAuthController.verifyPhoneNumberOTP(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Phone number verified successfully.",
        jwtToken: mockJwtToken,
      });
    });

    it("should handle errors during OTP verification", async () => {
      req.body = { otp: "123456" };
      const error = new Error("Invalid OTP");

      (customerAuthService.verifyPhoneNumberOTP as jest.Mock).mockRejectedValue(error);

      await customerAuthController.verifyPhoneNumberOTP(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith("An error occurred:", error);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("login", () => {
    it("should login customer and return JWT token", async () => {
      req.body = { email: "test@example.com", password: "password123" };
      const mockResponse = { jwtToken: "jwt_token", forgot_password: false };

      (customerAuthService.login as jest.Mock).mockResolvedValue(mockResponse);

      await customerAuthController.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors during login", async () => {
      req.body = { email: "test@example.com", password: "password123" };
      const error = new Error("Invalid credentials");

      (customerAuthService.login as jest.Mock).mockRejectedValue(error);

      await customerAuthController.login(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith("An error occurred:", error);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("logout", () => {
    it("should logout customer successfully", async () => {
      req.headers = { authorization: "Bearer jwt_token" };

      (customerAuthService.logout as jest.Mock).mockResolvedValue(undefined);

      await customerAuthController.logout(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Logout successful" });
    });

    it("should handle missing token", async () => {
      req.headers = {};

      await customerAuthController.logout(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
    });

    it("should handle errors during logout", async () => {
      req.headers = { authorization: "Bearer jwt_token" };
      const error = new Error("Logout failed");

      (customerAuthService.logout as jest.Mock).mockRejectedValue(error);

      await customerAuthController.logout(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith("An error occurred:", error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Could not log out",
        error: error.message,
      });
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      req.body = { oldPassword: "oldPass", newPassword: "newPass" };
      req.customer_id = "customer123";

      (customerAuthService.resetPassword as jest.Mock).mockResolvedValue(undefined);

      await customerAuthController.resetPassword(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Password reset successful" });
    });

    it("should handle missing customer_id", async () => {
      req.body = { oldPassword: "oldPass", newPassword: "newPass" };
      req.customer_id = undefined;

      await customerAuthController.resetPassword(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "customer_id is required" });
    });

    it("should handle errors during password reset", async () => {
      req.body = { oldPassword: "oldPass", newPassword: "newPass" };
      req.customer_id = "customer123";
      const error = new Error("Reset failed");

      (customerAuthService.resetPassword as jest.Mock).mockRejectedValue(error);

      await customerAuthController.resetPassword(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith("An error occurred:", error);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("resendEmailVerification", () => {
    it("should resend email verification link", async () => {
      req.body = { email: "test@example.com" };

      (customerAuthService.resendEmailVerification as jest.Mock).mockResolvedValue(undefined);

      await customerAuthController.resendEmailVerification(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "A confirmation link has been sent to your email.",
      });
    });

    it("should handle errors during resend", async () => {
      req.body = { email: "test@example.com" };
      const error = new Error("Resend failed");

      (customerAuthService.resendEmailVerification as jest.Mock).mockRejectedValue(error);

      await customerAuthController.resendEmailVerification(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith("An error occurred:", error);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("forgetPassword", () => {
    it("should send password reset email", async () => {
      req.body = { email: "test@example.com" };

      (customerAuthService.forgetPassword as jest.Mock).mockResolvedValue(undefined);

      await customerAuthController.forgetPassword(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Password reset email sent successfully",
      });
    });

    it("should handle missing email", async () => {
      req.body = {};

      await customerAuthController.forgetPassword(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(new BadRequestError("Email is required"));
    });

    it("should handle errors during password reset request", async () => {
      req.body = { email: "test@example.com" };
      const error = new Error("Email not found");

      (customerAuthService.forgetPassword as jest.Mock).mockRejectedValue(error);

      await customerAuthController.forgetPassword(req as Request, res as Response, next);

      expect(logger.error).toHaveBeenCalledWith("Error in forgetPassword:", error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
