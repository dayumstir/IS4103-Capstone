// src/routes/stripeRoutes.ts
import { Router } from "express";
import {
    topUpWallet,
    getPaymentHistoryByCustomerId,
} from "../controllers/paymentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/top-up", topUpWallet);
router.get("/history", getPaymentHistoryByCustomerId);

export default router;
