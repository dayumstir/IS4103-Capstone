// Defines routes related to customer actions
import { Router } from "express";
import { getProfile, editProfile, listAllCustomers } from "../controllers/customerController";
import { customerAuthMiddleware } from "../middlewares/customerAuthMiddleware";
import { adminAuthMiddleware } from "../middlewares/adminAuthMiddleware";

const router = Router();

router.get("/profile", customerAuthMiddleware, getProfile);
router.put("/profile", customerAuthMiddleware, editProfile);
router.get('/:customer_id', adminAuthMiddleware, getProfile);
router.get("/allCustomers", listAllCustomers);

export default router;
