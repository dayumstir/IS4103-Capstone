// Defines routes related to withdrawal Fee Rate actions
import { Router } from "express";
import {
    createWithdrawalFeeRate,
    getAllWithdrawalFeeRate,
    getWithdrawalFeeRate,
    editWithdrawalFeeRate,
    deleteWithdrawalFeeRate,
} from "../controllers/withdrawalFeeRateController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createWithdrawalFeeRate);
router.get("/", authMiddleware, getAllWithdrawalFeeRate);
router.get("/:withdrawal_fee_rate_id", authMiddleware, getWithdrawalFeeRate);
router.put("/:withdrawal_fee_rate_id", authMiddleware, editWithdrawalFeeRate);
router.delete(
    "/:withdrawal_fee_rate_id",
    authMiddleware,
    deleteWithdrawalFeeRate
);

export default router;
