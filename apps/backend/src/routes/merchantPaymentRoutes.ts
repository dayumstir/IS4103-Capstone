// Defines routes related to merchant payment actions
import { Router } from "express";
import {
    createMerchantPayment,
    getMerchantPayments,
    getMerchantPaymentById,
    updateMerchantPayment,
} from "../controllers/merchantPaymentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getMerchantPayments);
router.get("/:id", authMiddleware, getMerchantPaymentById);
router.post("/", authMiddleware, createMerchantPayment);
router.put("/:id", authMiddleware, updateMerchantPayment);

export default router;
