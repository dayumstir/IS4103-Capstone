// tests/controllers/creditTierController.test.ts

import { Request, Response } from "express";
import * as creditTierController from "../../src/controllers/creditTierController";
import * as creditTierService from "../../src/services/creditTierService";

jest.mock("../../src/services/creditTierService");

describe("Credit Tier Controller Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("createCreditTier", () => {
    it("should create a credit tier and return 201 status", async () => {
      req.body = { name: "Silver", minScore: 600, maxScore: 700 };
      const mockCreditTier = { credit_tier_id: "tier123", ...req.body };

      (creditTierService.createCreditTier as jest.Mock).mockResolvedValue(mockCreditTier);

      await creditTierController.createCreditTier(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreditTier);
    });

    it("should handle errors during creation", async () => {
      req.body = { name: "Silver" };
      const error = new Error("Validation error");

      (creditTierService.createCreditTier as jest.Mock).mockRejectedValue(error);

      await creditTierController.createCreditTier(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getAllCreditTiers", () => {
    it("should retrieve all credit tiers and return 200 status", async () => {
      const mockCreditTiers = [
        { credit_tier_id: "tier1", name: "Bronze", minScore: 500, maxScore: 599 },
        { credit_tier_id: "tier2", name: "Silver", minScore: 600, maxScore: 699 },
      ];

      (creditTierService.getAllCreditTiers as jest.Mock).mockResolvedValue(mockCreditTiers);

      await creditTierController.getAllCreditTiers(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCreditTiers);
    });

    it("should handle errors during retrieval", async () => {
      const error = new Error("Database error");

      (creditTierService.getAllCreditTiers as jest.Mock).mockRejectedValue(error);

      await creditTierController.getAllCreditTiers(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getCreditTier", () => {
    it("should retrieve a credit tier by ID and return 200 status", async () => {
      req.params = { credit_tier_id: "tier123" };
      const mockCreditTier = { credit_tier_id: "tier123", name: "Gold", minScore: 700 };

      (creditTierService.getCreditTierById as jest.Mock).mockResolvedValue(mockCreditTier);

      await creditTierController.getCreditTier(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCreditTier);
    });

    it("should handle errors during retrieval", async () => {
      req.params = { credit_tier_id: "tier123" };
      const error = new Error("Credit Tier not found");

      (creditTierService.getCreditTierById as jest.Mock).mockRejectedValue(error);

      await creditTierController.getCreditTier(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getCreditTierByScore", () => {
    it("should retrieve a credit tier by score and return 200 status", async () => {
      req.query = { score: "650" };
      const mockCreditTier = { credit_tier_id: "tier2", name: "Silver", minScore: 600, maxScore: 699 };

      (creditTierService.getCreditTierByScore as jest.Mock).mockResolvedValue(mockCreditTier);

      await creditTierController.getCreditTierByScore(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCreditTier);
    });

    it("should handle invalid credit score", async () => {
      req.query = { score: "invalid" };

      await creditTierController.getCreditTierByScore(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid credit score" });
    });

    it("should handle errors during retrieval", async () => {
      req.query = { score: "650" };
      const error = new Error("Credit Tier not found");

      (creditTierService.getCreditTierByScore as jest.Mock).mockRejectedValue(error);

      await creditTierController.getCreditTierByScore(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("editCreditTier", () => {
    it("should update a credit tier and return 200 status", async () => {
      req.params = { credit_tier_id: "tier123" };
      req.body = { name: "Updated Gold" };
      const mockUpdatedTier = { credit_tier_id: "tier123", name: "Updated Gold" };

      (creditTierService.updateCreditTier as jest.Mock).mockResolvedValue(mockUpdatedTier);

      await creditTierController.editCreditTier(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedTier);
    });

    it("should handle errors during update", async () => {
      req.params = { credit_tier_id: "tier123" };
      req.body = { name: "Updated Gold" };
      const error = new Error("Update failed");

      (creditTierService.updateCreditTier as jest.Mock).mockRejectedValue(error);

      await creditTierController.editCreditTier(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("deleteCreditTier", () => {
    it("should delete a credit tier and return 200 status", async () => {
      req.params = { credit_tier_id: "tier123" };

      (creditTierService.deleteCreditTier as jest.Mock).mockResolvedValue(undefined);

      await creditTierController.deleteCreditTier(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Credit tier deleted successfully" });
    });

    it("should handle errors during deletion", async () => {
      req.params = { credit_tier_id: "tier123" };
      const error = new Error("Delete failed");

      (creditTierService.deleteCreditTier as jest.Mock).mockRejectedValue(error);

      await creditTierController.deleteCreditTier(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
