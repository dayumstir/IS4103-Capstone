// Defines routes related to admin actions
import { Router } from "express";
import { get, edit, getAll, deactivateAdmin, activateAdmin, getAdminProfile } from "../controllers/adminController";
import { add } from "../controllers/adminAuthController";
import { adminAuthMiddleware, superAdminAuthMiddleware } from "../middlewares/adminAuthMiddleware";
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
import { editIssue, getIssue, getIssues } from "../controllers/issueController";

const router = Router();


router.get("/profile", adminAuthMiddleware, get);
router.get("/editprofile", adminAuthMiddleware, get);
router.put("/profile", adminAuthMiddleware, edit);

router.get("/allCustomers", listAllCustomers);
router.get("/customer/:customer_id", getCustomerProfile);
router.put("/customer/:customer_id", editCustomerProfile);
router.get("/allMerchants", listAllMerchants);
router.get("/merchant/:merchant_id", getMerchantProfile);
router.put("/merchant/:merchant_id", editMerchantProfile);
router.get("/allIssues", getIssues);
router.get("/issue/:issue_id", getIssue);
router.get("/issue/:issue_id", editIssue);


router.post("/add", add);
router.get("/get-all", getAll);
router.put("/deactivate-admin", deactivateAdmin);
router.put("/activate-admin", activateAdmin);
router.get("/:admin_id", getAdminProfile);

export default router;
