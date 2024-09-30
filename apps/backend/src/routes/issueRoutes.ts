// Defines routes related to instalment plan actions
import { Router } from "express";
import { createIssue, editIssue, getIssue, getIssues } from "../controllers/issueController";
import { authMiddleware } from "../middlewares/merchantAuthMiddleware";
import multer from "multer";

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(), // Store file in memory as Buffer
    limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2 MB
});

router.post("/", authMiddleware, upload.array("images"), createIssue);
router.post("/list", authMiddleware, getIssues);
router.get("/:issue_id", authMiddleware, getIssue);
router.put("/:issue_id", authMiddleware, editIssue);
export default router;
