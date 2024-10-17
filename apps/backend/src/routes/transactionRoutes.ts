// Defines routes related to transaction actions
import { Router } from "express";
import {
    getTransaction,
    getCustomerTransactions,
    editTransaction,
    createTransaction,
    getTransactionsByFilter,
} from "../controllers/transactionController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createTransaction);
router.get("/customer", authMiddleware, getCustomerTransactions);
router.post("/list", authMiddleware, getTransactionsByFilter);
router.get("/:transaction_id", authMiddleware, getTransaction);
router.put("/:transaction_id", authMiddleware, editTransaction);

export default router;
