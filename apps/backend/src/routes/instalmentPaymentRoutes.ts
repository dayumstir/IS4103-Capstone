// Defines routes related to instalment payment actions
import { Router } from "express";
import {
    getAllInstalmentPayments,
    getInstalmentPaymentsByTransaction,
    getInstalmentPayment,
    editInstalmentPayment,
} from "../controllers/instalmentPaymentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getAllInstalmentPayments);
router.get(
    "/transaction/:transaction_id",
    authMiddleware,
    getInstalmentPaymentsByTransaction
);
router.get("/:instalment_payment_id", authMiddleware, getInstalmentPayment);
router.put("/:instalment_payment_id", authMiddleware, editInstalmentPayment);
export default router;
