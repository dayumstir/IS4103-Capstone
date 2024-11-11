// Defines routes related to notification actions
import { Router } from "express";
import {
    createNotification,
    getNotification,
    getNotifications,
    getMerchantNotifications,
} from "../controllers/notificationController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/add", authMiddleware, createNotification);
router.post("/list", authMiddleware, getNotifications);
router.get("/merchant", authMiddleware, getMerchantNotifications);
router.get("/:notification_id", authMiddleware, getNotification);
export default router;
