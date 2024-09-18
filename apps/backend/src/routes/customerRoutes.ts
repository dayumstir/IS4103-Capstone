// Defines routes related to customer actions
import { Router } from "express";
import { getProfile, editProfile, listAllCustomers } from "../controllers/customerController";
import { customerAuthMiddleware } from "../middlewares/customerAuthMiddleware";

const router = Router();

router.get("/profile", customerAuthMiddleware, getProfile);
router.put("/profile", customerAuthMiddleware, editProfile);

router.get("/allCustomers", listAllCustomers);

export default router;
