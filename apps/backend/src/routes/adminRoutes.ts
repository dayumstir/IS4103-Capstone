// Defines routes related to admin actions
import { Router } from "express";
import { get, edit, getAll, deactivateAdmin, activateAdmin, getAdminProfile } from "../controllers/adminController";
import { add } from "../controllers/adminAuthController";
import {
  listAllCustomers,
  getCustomerProfile,
  editCustomerProfile,
} from "../controllers/customerController";
import {
  listAllMerchants,
  getMerchantProfile,
  editMerchantProfile,
} from "../controllers/merchantController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { superAdminAuthMiddleware } from "../middlewares/superAdminAuthMiddleware";

const router = Router();

router.get("/profile", authMiddleware, get);
router.put("/profile", authMiddleware, edit);

router.get("/allCustomers", authMiddleware, listAllCustomers);
router.get("/customer/:customer_id", authMiddleware, getCustomerProfile);
router.put("/customer/:customer_id", authMiddleware, editCustomerProfile);
router.get("/allMerchants", authMiddleware, listAllMerchants);
router.get("/merchant/:merchant_id", authMiddleware, getMerchantProfile);
router.put("/merchant/:merchant_id", authMiddleware, editMerchantProfile);

router.post("/add", authMiddleware, superAdminAuthMiddleware, add);
router.get("/get-all", authMiddleware, superAdminAuthMiddleware, getAll);
router.put("/deactivate-admin", authMiddleware, superAdminAuthMiddleware, deactivateAdmin);
router.put("/activate-admin", authMiddleware, superAdminAuthMiddleware, activateAdmin);
router.get("/:admin_id", authMiddleware, superAdminAuthMiddleware, getAdminProfile);

export default router;
