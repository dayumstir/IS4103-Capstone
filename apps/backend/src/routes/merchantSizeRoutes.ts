// Defines routes related to withdrawal Fee Rate actions
import { Router } from "express";
import {
    createMerchantSize,
    getAllMerchantSize,
    getMerchantSize,
    editMerchantSize,
} from "../controllers/merchantSizeController";
//import { adminAuthMiddleware } from "../middlewares/adminAuthMiddleware";

const router = Router();

// TODO: Add adminAuthMiddleware
router.post("/", createMerchantSize);
router.get("/", getAllMerchantSize);
router.get("/:merchant_size_id", getMerchantSize);
router.put("/:merchant_size_id", editMerchantSize);
export default router;
