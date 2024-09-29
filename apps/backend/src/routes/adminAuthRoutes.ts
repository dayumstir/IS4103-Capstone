// Defines routes related to authentication
import { Router } from "express";
import { login, resetPassword, logout} from "../controllers/adminAuthController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/reset-password", authMiddleware, resetPassword);


export default router;
