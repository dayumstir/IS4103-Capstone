// Defines routes related to admin actions
import { Router } from "express";
import {
  get,
  edit,
  getAll,
  deactivateAdmin,
  activateAdmin,
  getAdminProfile,
  getAdminByPathVariable,
} from "../controllers/adminController";
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
import { editIssue, getIssue, getIssues } from "../controllers/issueController";
import {
  getNotification,
  getNotifications,
} from "../controllers/notificationController";

const router = Router();

router.get("/profile", authMiddleware, get);
router.get("/profile/:admin_id", authMiddleware, getAdminByPathVariable);
router.put("/profile", authMiddleware, edit);

router.get("/allCustomers", authMiddleware, listAllCustomers);
router.get("/customer/:customer_id", authMiddleware, getCustomerProfile);
router.put("/customer/:customer_id", authMiddleware, editCustomerProfile);
router.get("/allMerchants", authMiddleware, listAllMerchants);
router.get("/merchant/:merchant_id", authMiddleware, getMerchantProfile);
router.put("/merchant/:merchant_id", authMiddleware, editMerchantProfile);
router.get("/allIssues", authMiddleware, getIssues);
router.get("/issue/:issue_id", authMiddleware, getIssue);
router.put("/issue/:issue_id", authMiddleware, editIssue);
router.get("/allNotifications", authMiddleware, getNotifications);
router.get("/notification/:notification_id", authMiddleware, getNotification);

router.post("/add", add);
router.get("/get-all", authMiddleware, superAdminAuthMiddleware, getAll);
router.put(
  "/deactivate-admin",
  authMiddleware,
  superAdminAuthMiddleware,
  deactivateAdmin
);
router.put(
  "/activate-admin",
  authMiddleware,
  superAdminAuthMiddleware,
  activateAdmin
);
router.get(
  "/:admin_id",
  authMiddleware,
  superAdminAuthMiddleware,
  getAdminProfile
);

export default router;
