// app/backend/src/routes/adminRoutes.ts
import { Router } from "express";
import {
    getProfile,
    getProfileById,
    editProfile,
    addAdmin,
    getAllAdmins,
    deactivateAdmin,
    activateAdmin,
} from "../controllers/adminController";
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
import { 
    getIssues,
    getIssue,
    editIssue  
} from "../controllers/issueController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { superAdminAuthMiddleware } from "../middlewares/superAdminAuthMiddleware";

const router = Router()

// Admin Routes
router.get("/profile", authMiddleware, getProfile);
router.get("/profile/:admin_id", authMiddleware, getProfileById);
router.put("/profile", authMiddleware, editProfile);

// Super Admin Routes
router.post("/add", addAdmin);
router.get("/get-all", authMiddleware, superAdminAuthMiddleware, getAllAdmins);
router.put("/deactivate-admin", authMiddleware, superAdminAuthMiddleware, deactivateAdmin);
router.put("/activate-admin", authMiddleware, superAdminAuthMiddleware, activateAdmin);
// router.get("/:admin_id", authMiddleware, superAdminAuthMiddleware, getAdminProfile);

// Customer Routes
router.get("/allCustomers", authMiddleware, listAllCustomers);
router.get("/customer/:customer_id", authMiddleware, getCustomerProfile);
router.put("/customer/:customer_id", authMiddleware, editCustomerProfile);

// Merchant Routes
router.get("/allMerchants", authMiddleware, listAllMerchants);
router.get("/merchant/:merchant_id", authMiddleware, getMerchantProfile);
router.put("/merchant/:merchant_id", authMiddleware, editMerchantProfile);

// Issue Routes
router.get("/allIssues", authMiddleware, getIssues);
router.get("/issue/:issue_id", authMiddleware, getIssue);
router.put("/issue/:issue_id", authMiddleware, editIssue);

export default router;
