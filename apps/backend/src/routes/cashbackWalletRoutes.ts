// app/backend/src/routes/cashbackWalletRoutes.ts
import { Router } from "express";
import { getCashbackWalletsByCustomerId } from "../controllers/cashbackWalletController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware); // Apply authMiddleware to all routes

router.get("/:customer_id", getCashbackWalletsByCustomerId);

export default router;
