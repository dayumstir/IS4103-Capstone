// Defines routes related to withdrawal Fee Rate actions
import { Router } from "express";
import {
    createWithdrawalFeeRate,
    getAllWithdrawalFeeRate,
    getWithdrawalFeeRate,
    editWithdrawalFeeRate,
    deleteWithdrawalFeeRate,
} from "../controllers/withdrawalFeeRateController";
//import { adminAuthMiddleware } from "../middlewares/adminAuthMiddleware";

const router = Router();

// TODO: Add adminAuthMiddleware
router.post("/", createWithdrawalFeeRate);
router.get("/", getAllWithdrawalFeeRate);
router.get("/:withdrawal_fee_rate_id", getWithdrawalFeeRate);
router.put("/:withdrawal_fee_rate_id", editWithdrawalFeeRate);
router.delete("/:withdrawal_fee_rate_id", deleteWithdrawalFeeRate);

export default router;
