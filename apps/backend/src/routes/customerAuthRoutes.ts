// Defines routes related to authentication
import { Router } from "express";
import { registerCustomer, confirmEmail, sendPhoneNumberOTP, verifyPhoneNumberOTP, login, logout, resetPassword } from "../controllers/customerAuthController";
import { customerAuthMiddleware } from "../middlewares/customerAuthMiddleware";

const router = Router();

router.post("/register", registerCustomer);
router.post("/confirm-email", confirmEmail);
router.post("/send-phone-number-otp", sendPhoneNumberOTP);
router.post("/verify-phone-number-otp", verifyPhoneNumberOTP);
router.post("/login", login);
router.post("/logout", customerAuthMiddleware, logout);
router.post("/reset-password", customerAuthMiddleware, resetPassword);

export default router;
