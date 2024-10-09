// Defines routes related to transaction actions
import { Router } from "express";
import {
    getTransaction,
    getUserTransactions,
    createTransaction,
} from "../controllers/transactionController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createTransaction);
router.get("/user", authMiddleware, getUserTransactions);
router.get("/:transaction_id", authMiddleware, getTransaction);

export default router;
