// Defines routes related to customer actions
import { Router } from "express";
import { getProfile, editProfile } from "../controllers/customerController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, editProfile);

export default router;