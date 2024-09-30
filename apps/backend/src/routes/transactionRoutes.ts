// Defines routes related to transaction actions
import { Router } from "express";
import {
  getTransaction,
  getUserTransactions,
  editTransaction,
  createTransaction,
} from "../controllers/transactionController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createTransaction);
router.get("/user", authMiddleware, getUserTransactions);
router.get("/:transaction_id", authMiddleware, getTransaction);
router.put("/:transaction_id", authMiddleware, editTransaction);

export default router;
