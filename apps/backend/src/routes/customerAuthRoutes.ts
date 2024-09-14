// Defines routes related to authentication
import { Router } from "express";
import { register, login, resetPassword, logout } from "../controllers/customerAuthController";
import { customerAuthMiddleware } from "../middlewares/customerAuthMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", customerAuthMiddleware, logout);
router.post("/reset-password", customerAuthMiddleware, resetPassword);

export default router;
