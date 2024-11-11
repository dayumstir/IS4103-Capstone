// Defines routes related to withdrawal Fee Rate actions
import { Router } from "express";
import {
    createMerchantSize,
    getAllMerchantSize,
    getMerchantSize,
    editMerchantSize,
    deleteMerchantSize,
} from "../controllers/merchantSizeController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createMerchantSize);
router.get("/", authMiddleware, getAllMerchantSize);
router.get("/:merchant_size_id", authMiddleware, getMerchantSize);
router.put("/:merchant_size_id", authMiddleware, editMerchantSize);
router.delete("/:merchant_size_id", authMiddleware, deleteMerchantSize);

export default router;
