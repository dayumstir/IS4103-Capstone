// Defines routes related to admin actions
import { Router } from "express";
import { get, edit } from "../controllers/adminController";
import { add } from "../controllers/adminAuthController";
import { adminAuthMiddleware } from "../middlewares/adminAuthMiddleware";
import {
  listAllCustomers,
  getProfile,
} from "../controllers/customerController";

const router = Router();

router.get("/profile", adminAuthMiddleware, get);
router.get("/editprofile", adminAuthMiddleware, get);
router.put("/profile", adminAuthMiddleware, edit);
router.post("/add", add);
router.get("/allCustomers", listAllCustomers);
router.get("/customer/:customer_id", getProfile);

export default router;
