// Defines routes related to merchant payment actions
import { Router } from "express";
import {
    createMerchantPayment,
    getMerchantPayments,
    getMerchantPaymentById,
    getMerchantPaymentsByFilter,
    updateMerchantPayment,
} from "../controllers/merchantPaymentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getMerchantPayments);
router.get("/:id", authMiddleware, getMerchantPaymentById);
router.post("/", authMiddleware, createMerchantPayment);
router.put("/:id", authMiddleware, updateMerchantPayment);
router.post("/list", authMiddleware, getMerchantPaymentsByFilter);

export default router;
