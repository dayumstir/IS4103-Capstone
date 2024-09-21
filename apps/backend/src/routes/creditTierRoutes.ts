// Defines routes related to credit tier actions
import { Router } from "express";
import {
    createCreditTier,
    getAllCreditTiers,
    getCreditTier,
    editCreditTier,
} from "../controllers/creditTierController";
// import { adminAuthMiddleware } from "../middlewares/adminAuthMiddleware";

const router = Router();

// TODO: Add adminAuthMiddleware
router.post("/", createCreditTier);
router.get("/", getAllCreditTiers);
router.get("/:credit_tier_id", getCreditTier);
router.put("/:credit_tier_id", editCreditTier);
export default router;
