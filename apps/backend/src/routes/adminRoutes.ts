// Defines routes related to admin actions
import { Router } from "express";
import { getAdmin, editAdmin } from "../controllers/adminController";
import { adminAuthMiddleware } from "../middlewares/adminAuthMiddleware";

const router = Router();

router.get("/profile", adminAuthMiddleware, getAdmin);
router.put("/profile", adminAuthMiddleware, editAdmin);

export default router;
