// tests/controllers/transactionController.test.ts

import { Request, Response } from "express";
import * as transactionController from "../../src/controllers/transactionController";
import * as transactionService from "../../src/services/transactionService";

jest.mock("../../src/services/transactionService");

describe("Transaction Controller Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {}, customer_id: undefined, admin_id: undefined };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("createTransaction", () => {
    it("should create a transaction and return 201 status", async () => {
      req.body = { amount: 100 };
      const mockTransaction = { transaction_id: "txn123", amount: 100 };

      (transactionService.createTransaction as jest.Mock).mockResolvedValue(mockTransaction);

      await transactionController.createTransaction(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTransaction);
    });

    it("should handle errors during creation", async () => {
      req.body = { amount: 100 };
      const error = new Error("Creation failed");

      (transactionService.createTransaction as jest.Mock).mockRejectedValue(error);

      await transactionController.createTransaction(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getAllTransactions", () => {
    it("should retrieve all transactions and return 200 status", async () => {
      req.query = { search: "test" };
      const mockTransactions = [{ transaction_id: "txn1" }, { transaction_id: "txn2" }];

      (transactionService.getAllTransactions as jest.Mock).mockResolvedValue(mockTransactions);

      await transactionController.getAllTransactions(req as Request, res as Response);

      expect(transactionService.getAllTransactions).toHaveBeenCalledWith("test");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTransactions);
    });

    it("should handle errors during retrieval", async () => {
      req.query = { search: "test" };
      const error = new Error("Retrieval failed");

      (transactionService.getAllTransactions as jest.Mock).mockRejectedValue(error);

      await transactionController.getAllTransactions(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getCustomerTransactions", () => {
    it("should retrieve customer transactions and return 200 status", async () => {
      req.customer_id = "customer123";
      req.query = { search: "test", date_filter: "last_month", status_filter: "completed" };
      const mockTransactions = [{ transaction_id: "txn1" }, { transaction_id: "txn2" }];

      (transactionService.getCustomerTransactions as jest.Mock).mockResolvedValue(mockTransactions);

      await transactionController.getCustomerTransactions(req as Request, res as Response);

      expect(transactionService.getCustomerTransactions).toHaveBeenCalledWith(
        "customer123",
        "test",
        "last_month",
        "completed"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTransactions);
    });

    it("should handle missing customer_id", async () => {
      req.customer_id = undefined;

      await transactionController.getCustomerTransactions(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized: No customer ID provided" });
    });

    it("should handle errors during retrieval", async () => {
      req.customer_id = "customer123";
      const error = new Error("Retrieval failed");

      (transactionService.getCustomerTransactions as jest.Mock).mockRejectedValue(error);

      await transactionController.getCustomerTransactions(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getTransactionsByFilter", () => {
    it("should retrieve transactions by filter and return 201 status", async () => {
      req.body = { status: "completed" };
      const mockTransactions = [{ transaction_id: "txn1" }, { transaction_id: "txn2" }];

      (transactionService.getTransactionByFilter as jest.Mock).mockResolvedValue(mockTransactions);

      await transactionController.getTransactionsByFilter(req as Request, res as Response);

      expect(transactionService.getTransactionByFilter).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTransactions);
    });

    it("should handle errors during retrieval", async () => {
      req.body = { status: "completed" };
      const error = new Error("Retrieval failed");

      (transactionService.getTransactionByFilter as jest.Mock).mockRejectedValue(error);

      await transactionController.getTransactionsByFilter(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getTransaction", () => {
    it("should retrieve a transaction by ID and return 200 status", async () => {
      req.params = { transaction_id: "txn123" };
      const mockTransaction = { transaction_id: "txn123", amount: 100 };

      (transactionService.getTransactionById as jest.Mock).mockResolvedValue(mockTransaction);

      await transactionController.getTransaction(req as Request, res as Response);

      expect(transactionService.getTransactionById).toHaveBeenCalledWith("txn123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTransaction);
    });

    it("should handle errors during retrieval", async () => {
      req.params = { transaction_id: "txn123" };
      const error = new Error("Transaction not found");

      (transactionService.getTransactionById as jest.Mock).mockRejectedValue(error);

      await transactionController.getTransaction(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("editTransaction", () => {
    it("should update a transaction and return 200 status", async () => {
      req.params = { transaction_id: "txn123" };
      req.body = { amount: 150 };
      const mockUpdatedTransaction = { transaction_id: "txn123", amount: 150 };

      (transactionService.updateTransaction as jest.Mock).mockResolvedValue(mockUpdatedTransaction);

      await transactionController.editTransaction(req as Request, res as Response);

      expect(transactionService.updateTransaction).toHaveBeenCalledWith("txn123", req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedTransaction);
    });

    it("should handle errors during update", async () => {
      req.params = { transaction_id: "txn123" };
      req.body = { amount: 150 };
      const error = new Error("Update failed");

      (transactionService.updateTransaction as jest.Mock).mockRejectedValue(error);

      await transactionController.editTransaction(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getTransactionStats", () => {
    it("should retrieve transaction stats and return 200 status", async () => {
      req.admin_id = "admin123";
      const mockStats = { totalTransactions: 100, totalAmount: 5000 };

      (transactionService.getTransactionStats as jest.Mock).mockResolvedValue(mockStats);

      await transactionController.getTransactionStats(req as Request, res as Response);

      expect(transactionService.getTransactionStats).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });

    it("should handle missing admin_id", async () => {
      req.admin_id = undefined;

      await transactionController.getTransactionStats(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized: No admin ID provided" });
    });

    it("should handle errors during retrieval", async () => {
      req.admin_id = "admin123";
      const error = new Error("Retrieval failed");

      (transactionService.getTransactionStats as jest.Mock).mockRejectedValue(error);

      await transactionController.getTransactionStats(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
