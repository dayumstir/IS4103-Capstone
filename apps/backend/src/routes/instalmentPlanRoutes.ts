// Defines routes related to transaction actions
import { Router } from "express";
import {
    createInstalmentPlan,
    getAllInstalmentPlans,
    getInstalmentPlan,
    editInstalmentPlan,
} from "../controllers/instalmentPlanController";
// import { adminAuthMiddleware } from "../middlewares/adminAuthMiddleware";

const router = Router();

// TODO: Add adminAuthMiddleware
router.post("/", createInstalmentPlan);
router.get("/", getAllInstalmentPlans);
router.get("/:instalment_plan_id", getInstalmentPlan);
router.put("/:instalment_plan_id", editInstalmentPlan);
export default router;
