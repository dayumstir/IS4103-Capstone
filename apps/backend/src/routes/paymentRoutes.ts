// src/routes/paymentRoutes.ts
import { Router } from "express";
import {
    topUpWallet,
    getPaymentHistoryByCustomerId,
    makePayment,
} from "../controllers/paymentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/top-up", topUpWallet);
router.get("/history", getPaymentHistoryByCustomerId);
router.post("/make-payment", makePayment);

export default router;
