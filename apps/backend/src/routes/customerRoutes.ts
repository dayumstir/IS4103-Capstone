// Defines routes related to customer actions
import { Router } from "express";
import {
  getCustomerProfile,
  editCustomerProfile,
  listAllCustomers,
} from "../controllers/customerController";
import { customerAuthMiddleware } from "../middlewares/customerAuthMiddleware";
import { adminAuthMiddleware } from "../middlewares/adminAuthMiddleware";

const router = Router();

router.get("/profile", customerAuthMiddleware, getCustomerProfile);
router.put("/profile", customerAuthMiddleware, editCustomerProfile);
router.get("/:customer_id", adminAuthMiddleware, getCustomerProfile);
router.get("/allCustomers", listAllCustomers);
router.put("/allCustomers", editCustomerProfile);

export default router;
