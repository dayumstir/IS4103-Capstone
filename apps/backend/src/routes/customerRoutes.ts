// Defines routes related to customer actions
import { Router } from "express";
import {
  getCustomerProfile,
  editCustomerProfile
} from "../controllers/customerController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/profile", authMiddleware, getCustomerProfile);
router.put("/profile", authMiddleware, editCustomerProfile);

export default router;
