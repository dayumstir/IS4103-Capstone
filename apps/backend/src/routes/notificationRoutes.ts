// Defines routes related to notification actions
import { Router } from "express";
import {
  createNotification,
  getNotification,
  getNotifications,
} from "../controllers/notificationController";
import { authMiddleware } from "../middlewares/authMiddleware";
import multer from "multer";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory as Buffer
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2 MB
});

router.post("/add", authMiddleware, createNotification);
router.post("/list", authMiddleware, getNotifications);
router.get("/:issue_id", authMiddleware, getNotification);
export default router;
