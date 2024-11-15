// tests/controllers/cashbackWalletController.test.ts

import { Request, Response, NextFunction } from "express";
import * as cashbackWalletController from "../../src/controllers/cashbackWalletController";
import * as cashbackWalletService from "../../src/services/cashbackWalletService";
import { BadRequestError } from "../../src/utils/error";

jest.mock("../../src/services/cashbackWalletService");

describe("Cashback Wallet Controller Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("getCashbackWalletsByCustomerId", () => {
    it("should retrieve cashback wallets and return 200 status", async () => {
      req.params = { customer_id: "customer123" };
      const mockWallets = [
        { wallet_id: "wallet1", balance: 100 },
        { wallet_id: "wallet2", balance: 200 },
      ];

      (cashbackWalletService.getCashbackWalletsByCustomerId as jest.Mock).mockResolvedValue(
        mockWallets
      );

      await cashbackWalletController.getCashbackWalletsByCustomerId(
        req as Request,
        res as Response,
        next
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockWallets);
    });

    it("should handle error if customer_id is missing", async () => {
      req.params = {};

      await cashbackWalletController.getCashbackWalletsByCustomerId(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(new BadRequestError("customer_id is required"));
    });

    it("should handle errors from the service", async () => {
      req.params = { customer_id: "customer123" };
      const error = new Error("Database error");

      (cashbackWalletService.getCashbackWalletsByCustomerId as jest.Mock).mockRejectedValue(error);

      await cashbackWalletController.getCashbackWalletsByCustomerId(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
