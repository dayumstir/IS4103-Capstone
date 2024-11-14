// Defines routes related to notification actions
import { Router } from "express";
import {
    createNotification,
    getNotification,
    getNotifications,
    getMerchantNotifications,
    getCustomerNotifications,
    updateNotification,
} from "../controllers/notificationController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/add", authMiddleware, createNotification);
router.post("/list", authMiddleware, getNotifications);
router.get("/merchant", authMiddleware, getMerchantNotifications);
router.get("/customer", authMiddleware, getCustomerNotifications);
router.get("/:notification_id", authMiddleware, getNotification);
router.put("/:notification_id", authMiddleware, updateNotification);
export default router;
