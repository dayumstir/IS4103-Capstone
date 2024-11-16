// tests/controllers/merchantSizeController.test.ts

import { Request, Response } from "express";
import * as merchantSizeController from "../../src/controllers/merchantSizeController";
import * as merchantSizeService from "../../src/services/merchantSizeService";
import logger from "../../src/utils/logger";

jest.mock("../../src/services/merchantSizeService");
jest.mock("../../src/utils/logger");

describe("Merchant Size Controller Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("createMerchantSize", () => {
    it("should create a merchant size and return 201 status", async () => {
      req.body = { size: "Small" };
      const mockMerchantSize = { merchant_size_id: "size123", size: "Small" };

      (merchantSizeService.createMerchantSize as jest.Mock).mockResolvedValue(mockMerchantSize);

      await merchantSizeController.createMerchantSize(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockMerchantSize);
    });

    it("should handle errors during creation", async () => {
      req.body = { size: "Small" };
      const error = new Error("Creation failed");

      (merchantSizeService.createMerchantSize as jest.Mock).mockRejectedValue(error);

      await merchantSizeController.createMerchantSize(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith(`Error in createMerchantSize: ${error.message}`);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getAllMerchantSize", () => {
    it("should retrieve all merchant sizes and return 200 status", async () => {
      const mockMerchantSizes = [{ merchant_size_id: "size1", size: "Small" }];

      (merchantSizeService.getAllMerchantSize as jest.Mock).mockResolvedValue(mockMerchantSizes);

      await merchantSizeController.getAllMerchantSize(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMerchantSizes);
    });

    it("should handle errors during retrieval", async () => {
      const error = new Error("Retrieval failed");

      (merchantSizeService.getAllMerchantSize as jest.Mock).mockRejectedValue(error);

      await merchantSizeController.getAllMerchantSize(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith(`Error in createMerchantSize: ${error.message}`);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getMerchantSize", () => {
    it("should retrieve a merchant size by ID and return 200 status", async () => {
      req.params = { merchant_size_id: "size123" };
      const mockMerchantSize = { merchant_size_id: "size123", size: "Small" };

      (merchantSizeService.getMerchantSizeById as jest.Mock).mockResolvedValue(mockMerchantSize);

      await merchantSizeController.getMerchantSize(req as Request, res as Response);

      expect(merchantSizeService.getMerchantSizeById).toHaveBeenCalledWith("size123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMerchantSize);
    });

    it("should handle errors during retrieval", async () => {
      req.params = { merchant_size_id: "size123" };
      const error = new Error("Merchant Size not found");

      (merchantSizeService.getMerchantSizeById as jest.Mock).mockRejectedValue(error);

      await merchantSizeController.getMerchantSize(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith(`Error in getMerchantSize : ${error.message}`);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("editMerchantSize", () => {
    it("should update a merchant size and return 200 status", async () => {
      req.params = { merchant_size_id: "size123" };
      req.body = { size: "Medium" };
      const mockUpdatedMerchantSize = { merchant_size_id: "size123", size: "Medium" };

      (merchantSizeService.updateMerchantSize as jest.Mock).mockResolvedValue(mockUpdatedMerchantSize);

      await merchantSizeController.editMerchantSize(req as Request, res as Response);

      expect(merchantSizeService.updateMerchantSize).toHaveBeenCalledWith("size123", req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedMerchantSize);
    });

    it("should handle errors during update", async () => {
      req.params = { merchant_size_id: "size123" };
      req.body = { size: "Medium" };
      const error = new Error("Update failed");

      (merchantSizeService.updateMerchantSize as jest.Mock).mockRejectedValue(error);

      await merchantSizeController.editMerchantSize(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith(`Error in editMerchantSize: ${error.message}`);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("deleteMerchantSize", () => {
    it("should delete a merchant size and return 200 status", async () => {
      req.params = { merchant_size_id: "size123" };
      const mockDeletedSize = { message: "Merchant Size deleted successfully" };

      (merchantSizeService.deleteMerchantSize as jest.Mock).mockResolvedValue(mockDeletedSize);

      await merchantSizeController.deleteMerchantSize(req as Request, res as Response);

      expect(merchantSizeService.deleteMerchantSize).toHaveBeenCalledWith("size123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDeletedSize);
    });

    it("should handle errors during deletion", async () => {
      req.params = { merchant_size_id: "size123" };
      const error = new Error("Deletion failed");

      (merchantSizeService.deleteMerchantSize as jest.Mock).mockRejectedValue(error);

      await merchantSizeController.deleteMerchantSize(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
