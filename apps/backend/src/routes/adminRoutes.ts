// Defines routes related to admin actions
import { Router } from "express";
import { get, edit } from "../controllers/adminController";
import { adminAuthMiddleware } from "../middlewares/adminAuthMiddleware";

const router = Router();

router.get("/profile", adminAuthMiddleware, get);
router.get("/editprofile", adminAuthMiddleware, get);
router.put("/profile", adminAuthMiddleware, edit);

export default router;
