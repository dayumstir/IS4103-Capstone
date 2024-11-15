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
router.get("/merchant", getMerchantNotifications); // Specific route comes first
router.get("/customer", getCustomerNotifications); // Specific route comes first
router.get("/:notification_id", getNotification); // Parametric route comes last
router.put("/", updateNotification);

export default router;
