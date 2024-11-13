// src/routes/merchantRoutes.ts
import { Router } from "express";
import {
    getMerchantProfile,
    editMerchantProfile,
    listAllMerchants,
} from "../controllers/merchantController";
import {
    register,
    login,
    resetPassword,
    logout,
    confirmEmail,
    sendPhoneNumberOTP,
    verifyPhoneNumberOTP,
    checkEmailNotInUse,
    resendEmailConfirmation,
    forgetPassword,
} from "../controllers/merchantAuthController";
import { authMiddleware } from "../middlewares/authMiddleware";
import multer from "multer";

const merchantRouter = Router();

// PROFILE
const upload = multer({
    storage: multer.memoryStorage(), // Store file in memory as Buffer
    limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2 MB
});
merchantRouter.get("/profile/:merchant_id", authMiddleware, getMerchantProfile);
merchantRouter.put(
    "/profile/:id",
    authMiddleware,
    upload.single("profile_picture"),
    editMerchantProfile
);

merchantRouter.get("/allMerchants", listAllMerchants);
merchantRouter.get("/:merchant_id", getMerchantProfile);
merchantRouter.put("/allMerchants", editMerchantProfile);

//AUTH
const authRouter = Router();
merchantRouter.use("/auth", authRouter);

authRouter.post("/register", upload.single("profile_picture"), register);
authRouter.post("/confirm-email", confirmEmail);
authRouter.post("/resend-email-verification", resendEmailConfirmation);
authRouter.post("/send-phone-number-otp", sendPhoneNumberOTP);
authRouter.post("/verify-phone-number-otp", verifyPhoneNumberOTP);
authRouter.post("/check-email-status", checkEmailNotInUse);

authRouter.post("/login", login);
authRouter.post("/logout", authMiddleware, logout);
authRouter.post("/:id/reset-password", resetPassword);
authRouter.post("/forget-password", forgetPassword);

export default merchantRouter;
