// Defines routes related to transaction actions
import { Router } from "express";
import {
    getTransaction,
    getCustomerTransactions,
    createTransaction,
} from "../controllers/transactionController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createTransaction);
router.get("/customer", authMiddleware, getCustomerTransactions);
router.get("/:transaction_id", authMiddleware, getTransaction);

export default router;
