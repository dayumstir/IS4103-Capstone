// Defines routes related to merchant payment actions
import { Router } from "express";
import {
    createMerchantPayment,
    getMerchantPayments,
    calculateWithdrawalInfo,
    getMerchantPaymentById,
    updateMerchantPayment,
} from "../controllers/merchantPaymentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getMerchantPayments);
router.post("/", authMiddleware, createMerchantPayment);
router.get("/withdrawal-info", authMiddleware, calculateWithdrawalInfo);
router.get("/:id", authMiddleware, getMerchantPaymentById);
router.put("/:id", authMiddleware, updateMerchantPayment);

export default router;
