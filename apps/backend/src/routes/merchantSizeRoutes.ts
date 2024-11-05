// Defines routes related to withdrawal Fee Rate actions
import { Router } from "express";
import {
    createMerchantSize,
    getAllMerchantSize,
    getMerchantSize,
    editMerchantSize,
    deleteMerchantSize,
} from "../controllers/merchantSizeController";
//import { adminAuthMiddleware } from "../middlewares/adminAuthMiddleware";

const router = Router();

// TODO: Add adminAuthMiddleware
router.post("/", createMerchantSize);
router.get("/", getAllMerchantSize);
router.get("/:merchant_size_id", getMerchantSize);
router.put("/:merchant_size_id", editMerchantSize);
router.delete("/:merchant_size_id", deleteMerchantSize);

export default router;
