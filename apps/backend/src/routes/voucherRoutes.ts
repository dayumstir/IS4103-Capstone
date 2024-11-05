// app/backend/src/routes/voucherRoutes.ts
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

router.use(authMiddleware);

router.post("/create", createVoucher);
router.post("/assign", assignVoucher);
router.put("/deactivate/:voucher_id", deactivateVoucher);
router.get("/", getAllVouchers);
router.get("/:voucher_id", getVoucherDetails);
router.get("/customer/:customer_id", getCustomerVouchers);

export default router;
