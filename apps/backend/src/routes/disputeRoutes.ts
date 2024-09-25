// Defines routes related to instalment plan actions
import { Router } from "express";
import { createDispute } from "../controllers/disputeController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createDispute);
export default router;
