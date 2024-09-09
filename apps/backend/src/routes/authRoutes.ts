// Defines routes related to authentication
import { Router } from "express";
import { register, login, resetPassword, logout } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/reset-password", resetPassword);

export default router;