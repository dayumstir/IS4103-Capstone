// Defines routes related to authentication
import { Router } from "express";
import { addAdmin, loginAdmin, resetPasswordAdmin, logoutAdmin} from "../controllers/adminAuthController";
import { adminAuthMiddleware } from "../middlewares/adminAuthMiddleware";

const router = Router();

router.post("/login", loginAdmin);
router.post("/logout", adminAuthMiddleware, logoutAdmin);
router.post("/addAdmin", addAdmin);
router.post("/reset-password", resetPasswordAdmin);


export default router;
