// tests/controllers/merchantController.test.ts

import { Request, Response } from "express";
import * as merchantController from "../../src/controllers/merchantController";
import * as merchantService from "../../src/services/merchantService";
import logger from "../../src/utils/logger";

jest.mock("../../src/services/merchantService");
jest.mock("../../src/utils/logger");

describe("Merchant Controller Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {}, merchant_id: undefined };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getMerchantProfile", () => {
    it("should retrieve merchant profile by merchant_id", async () => {
      req.params = { merchant_id: "merchant123" };
      const mockMerchant = { merchant_id: "merchant123", name: "Merchant Name" };

      (merchantService.getMerchantById as jest.Mock).mockResolvedValue(mockMerchant);

      await merchantController.getMerchantProfile(req as Request, res as Response);

      expect(merchantService.getMerchantById).toHaveBeenCalledWith("merchant123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMerchant);
    });

    it("should handle missing merchant_id", async () => {
      req.params = {};
      req.merchant_id = undefined;

      await merchantController.getMerchantProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "merchant_id is required" });
    });

    it("should handle errors during retrieval", async () => {
      req.params = { merchant_id: "merchant123" };
      const error = new Error("Merchant not found");

      (merchantService.getMerchantById as jest.Mock).mockRejectedValue(error);

      await merchantController.getMerchantProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("editMerchantProfile", () => {
    it("should update merchant profile", async () => {
      req.params = { merchant_id: "merchant123" };
      req.body = { name: "New Merchant Name" };
      req.file = { buffer: Buffer.from("image data") } as Express.Multer.File;
      const mockUpdatedMerchant = { merchant_id: "merchant123", name: "New Merchant Name" };

      (merchantService.updateMerchant as jest.Mock).mockResolvedValue(mockUpdatedMerchant);

      await merchantController.editMerchantProfile(req as Request, res as Response);

      expect(merchantService.updateMerchant).toHaveBeenCalledWith(
        "merchant123",
        req.body,
        req.file?.buffer
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedMerchant);
    });

    it("should handle missing merchant_id", async () => {
      req.params = {};
      req.merchant_id = undefined;

      await merchantController.editMerchantProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "merchant_id is required" });
    });

    it("should handle errors during update", async () => {
      req.params = { merchant_id: "merchant123" };
      req.body = { name: "New Merchant Name" };
      const error = new Error("Update failed");

      (merchantService.updateMerchant as jest.Mock).mockRejectedValue(error);

      await merchantController.editMerchantProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("listAllMerchants", () => {
    it("should list all merchants", async () => {
      req.query = {};
      const mockMerchants = [
        { merchant_id: "merchant1", name: "Merchant One" },
        { merchant_id: "merchant2", name: "Merchant Two" },
      ];

      (merchantService.getAllMerchants as jest.Mock).mockResolvedValue(mockMerchants);

      await merchantController.listAllMerchants(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMerchants);
    });

    it("should search merchants when search query is provided", async () => {
      req.query = { search: "Merchant" };
      const mockMerchants = [{ merchant_id: "merchant1", name: "Merchant One" }];

      (merchantService.searchMerchants as jest.Mock).mockResolvedValue(mockMerchants);

      await merchantController.listAllMerchants(req as Request, res as Response);

      expect(merchantService.searchMerchants).toHaveBeenCalledWith("Merchant");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMerchants);
    });

    it("should handle errors during listing", async () => {
      req.query = {};
      const error = new Error("Retrieval failed");

      (merchantService.getAllMerchants as jest.Mock).mockRejectedValue(error);

      await merchantController.listAllMerchants(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
