// Defines routes related to transaction actions
import { Router } from "express";
import {
  getTransaction,
  getUserTransactions,
  editTransaction,
  createTransaction,
} from "../controllers/transactionController";
import { customerAuthMiddleware } from "../middlewares/customerAuthMiddleware";

const router = Router();

router.post("/", customerAuthMiddleware, createTransaction);
router.get("/user", customerAuthMiddleware, getUserTransactions);
router.get("/:transaction_id", customerAuthMiddleware, getTransaction);
router.put("/:transaction_id", customerAuthMiddleware, editTransaction);

export default router;
