// Defines routes related to merchant payment actions
import { Router } from "express";
import { createMerchantPayment } from "../controllers/merchantPaymentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createMerchantPayment);

export default router;
