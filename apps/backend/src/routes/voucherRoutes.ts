import { Router } from "express";
import {
    createVoucher,
    assignVoucher,
    deactivateVoucher,
    getAllVouchers,
    getVoucherDetails,
    getCustomerVouchers,
} from "../controllers/voucherController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", authMiddleware, createVoucher);
router.post("/assign", authMiddleware, assignVoucher);
router.put("/deactivate/:voucher_id", authMiddleware, deactivateVoucher);
router.get("/", authMiddleware, getAllVouchers);
router.get("/details/:voucher_id", authMiddleware, getVoucherDetails);
router.get("/customer/:customer_id", authMiddleware, getCustomerVouchers);

export default router;
