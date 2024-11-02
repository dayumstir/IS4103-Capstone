// Defines routes related to customer actions
import { Router } from "express";
import {
  getCustomerProfile,
  editCustomerProfile,
  getInstalmentPlans,
  listAllCustomers,
} from "../controllers/customerController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/allCustomers", listAllCustomers);
router.get("/profile", authMiddleware, getCustomerProfile);
router.put("/profile", authMiddleware, editCustomerProfile);
router.get("/instalment-plans", authMiddleware, getInstalmentPlans);

export default router;
