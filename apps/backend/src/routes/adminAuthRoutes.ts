// app/backend/src/routes/adminAuthRoutes.ts
import { Router } from "express";
import { 
    login, 
    logout, 
    resetPassword,
} from "../controllers/adminAuthController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/reset-password", authMiddleware, resetPassword);

export default router;
