// Defines routes related to merchant actions
import { Router } from "express";
import {
  getMerchantProfile,
  editMerchantProfile,
  listAllMerchants,
} from "../controllers/merchantController";
import { merchantAuthMiddleware } from "../middlewares/merchantAuthMiddleware";
import {
  register,
  login,
  resetPassword,
  logout,
} from "../controllers/merchantAuthController";
import multer from "multer";

const merchantRouter = Router();

// PROFILE
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory as Buffer
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2 MB
});
merchantRouter.get("/profile/:id", merchantAuthMiddleware, getMerchantProfile);
merchantRouter.put(
  "/profile/:id",
  merchantAuthMiddleware,
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
authRouter.post("/login", login);
authRouter.post("/logout", merchantAuthMiddleware, logout);
authRouter.post("/reset-password", resetPassword);

export default merchantRouter;
