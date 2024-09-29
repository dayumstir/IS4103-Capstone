// Defines routes related to authentication
import { Router } from "express";
import { add, login, resetPassword, logout} from "../controllers/adminAuthController";
import { adminAuthMiddleware } from "../middlewares/adminAuthMiddleware";

const router = Router();

router.post("/login", login);
router.post("/logout", adminAuthMiddleware, logout);
//router.post("/add", add);
router.post("/reset-password", resetPassword);


export default router;
