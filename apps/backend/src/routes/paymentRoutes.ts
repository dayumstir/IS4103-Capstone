// src/routes/stripeRoutes.ts
import { Router } from "express";
import {
    topUpWallet,
} from "../controllers/paymentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/top-up", topUpWallet);

export default router;
