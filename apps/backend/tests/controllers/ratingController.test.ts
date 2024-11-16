// tests/controllers/ratingController.test.ts

import { Request, Response, NextFunction } from "express";
import * as ratingController from "../../src/controllers/ratingController";
import * as ratingService from "../../src/services/ratingService";
import { BadRequestError } from "../../src/utils/error";
import logger from "../../src/utils/logger";

jest.mock("../../src/services/ratingService");
jest.mock("../../src/utils/logger");

describe("Rating Controller Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("createRating", () => {
    it("should create a rating and return 201 status", async () => {
      req.body = { transaction_id: "txn123", rating: 5 };
      const mockRating = { rating_id: "rating123", transaction_id: "txn123", rating: 5 };

      (ratingService.createRating as jest.Mock).mockResolvedValue(mockRating);

      await ratingController.createRating(req as Request, res as Response, next);

      expect(ratingService.createRating).toHaveBeenCalledWith(req.body, "txn123");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockRating);
    });

    it("should handle missing transaction_id", async () => {
      req.body = { rating: 5 };

      await ratingController.createRating(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(new BadRequestError("transaction_id is required"));
    });

    it("should handle errors during creation", async () => {
      req.body = { transaction_id: "txn123", rating: 5 };
      const error = new Error("Creation failed");

      (ratingService.createRating as jest.Mock).mockRejectedValue(error);

      await ratingController.createRating(req as Request, res as Response, next);

      expect(logger.error).toHaveBeenCalledWith("Error in createRating:", error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getRatings", () => {
    it("should retrieve all ratings and return 200 status", async () => {
      req.query = {};
      const mockRatings = [{ rating_id: "rating1" }, { rating_id: "rating2" }];

      (ratingService.getRatings as jest.Mock).mockResolvedValue(mockRatings);

      await ratingController.getRatings(req as Request, res as Response, next);

      expect(ratingService.getRatings).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRatings);
    });

    it("should search ratings when search query is provided", async () => {
      req.query = { search: "excellent" };
      const mockRatings = [{ rating_id: "rating1" }];

      (ratingService.searchRatings as jest.Mock).mockResolvedValue(mockRatings);

      await ratingController.getRatings(req as Request, res as Response, next);

      expect(ratingService.searchRatings).toHaveBeenCalledWith("excellent");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRatings);
    });

    it("should handle errors during retrieval", async () => {
      const error = new Error("Retrieval failed");

      (ratingService.getRatings as jest.Mock).mockRejectedValue(error);

      await ratingController.getRatings(req as Request, res as Response, next);

      expect(logger.error).toHaveBeenCalledWith("Error in getRatings:", error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getRating", () => {
    it("should retrieve a rating by ID and return 200 status", async () => {
      req.params = { rating_id: "rating123" };
      const mockRating = { rating_id: "rating123", rating: 5 };

      (ratingService.getRatingById as jest.Mock).mockResolvedValue(mockRating);

      await ratingController.getRating(req as Request, res as Response, next);

      expect(ratingService.getRatingById).toHaveBeenCalledWith("rating123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRating);
    });

    it("should handle errors during retrieval", async () => {
      req.params = { rating_id: "rating123" };
      const error = new Error("Rating not found");

      (ratingService.getRatingById as jest.Mock).mockRejectedValue(error);

      await ratingController.getRating(req as Request, res as Response, next);

      expect(logger.error).toHaveBeenCalledWith("Error in getRating:", error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
