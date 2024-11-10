// Defines routes related to instalment plan actions
import { Router } from "express";
import {
    createInstalmentPlan,
    getAllInstalmentPlans,
    getInstalmentPlan,
    editInstalmentPlan,
    deleteInstalmentPlan,
} from "../controllers/instalmentPlanController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createInstalmentPlan);
router.get("/", authMiddleware, getAllInstalmentPlans);
router.get("/:instalment_plan_id", authMiddleware, getInstalmentPlan);
router.put("/:instalment_plan_id", authMiddleware, editInstalmentPlan);
router.delete("/:instalment_plan_id", authMiddleware, deleteInstalmentPlan);
export default router;
