// Defines routes related to transaction actions
import { Router } from "express";
import {
    getTransaction,
    getAllTransactions,
    getCustomerTransactions,
    editTransaction,
    createTransaction,
    getTransactionsByFilter,
    getTransactionStats,
} from "../controllers/transactionController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createTransaction);
router.get("/", authMiddleware, getAllTransactions);
router.get("/customer", authMiddleware, getCustomerTransactions);
router.post("/list", authMiddleware, getTransactionsByFilter);
router.get("/stats", authMiddleware, getTransactionStats);
router.get("/:transaction_id", authMiddleware, getTransaction);
router.put("/:transaction_id", authMiddleware, editTransaction);
export default router;
