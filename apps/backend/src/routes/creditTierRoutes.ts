// Defines routes related to credit tier actions
import { Router } from "express";
import {
    createCreditTier,
    getAllCreditTiers,
    getCreditTier,
    editCreditTier,
    deleteCreditTier,
} from "../controllers/creditTierController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createCreditTier);
router.get("/", authMiddleware, getAllCreditTiers);
router.get("/:credit_tier_id", authMiddleware, getCreditTier);
router.put("/:credit_tier_id", authMiddleware, editCreditTier);
router.delete("/:credit_tier_id", authMiddleware, deleteCreditTier);
export default router;
