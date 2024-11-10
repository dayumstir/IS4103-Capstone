// Defines routes related to instalment payment actions
import { Router } from "express";
import {
    getAllInstalmentPayments,
    getCustomerOutstandingInstalmentPayments,
    getMerchantInstalmentPayments,
    getInstalmentPayment,
    editInstalmentPayment,
} from "../controllers/instalmentPaymentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getAllInstalmentPayments);
router.get(
    "/customer",
    authMiddleware,
    getCustomerOutstandingInstalmentPayments
);
router.get("/merchant", authMiddleware, getMerchantInstalmentPayments);
router.get("/:instalment_payment_id", authMiddleware, getInstalmentPayment);
router.put("/:instalment_payment_id", authMiddleware, editInstalmentPayment);
export default router;
