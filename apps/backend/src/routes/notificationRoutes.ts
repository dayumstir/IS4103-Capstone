// apps/backend/src/routes/notificationRoutes.ts
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

router.use(authMiddleware);

router.post("/add", createNotification);
router.post("/list", getNotifications);
router.get("/:notification_id", getNotification);
router.get("/merchant", getMerchantNotifications);
router.get("/customer", getCustomerNotifications);
router.put("/:notification_id", updateNotification);

export default router;
