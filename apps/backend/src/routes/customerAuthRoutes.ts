// Defines routes related to authentication
import { Router } from "express";
import { sendConfirmationEmail, confirmEmailAndRegister, login, resetPassword, logout } from "../controllers/customerAuthController";
import { customerAuthMiddleware } from "../middlewares/customerAuthMiddleware";

const router = Router();

router.post("/send-confirmation-email", sendConfirmationEmail);
router.post("/confirm-email-and-register", confirmEmailAndRegister);
router.post("/login", login);
router.post("/logout", customerAuthMiddleware, logout);
router.post("/reset-password", customerAuthMiddleware, resetPassword);

export default router;
