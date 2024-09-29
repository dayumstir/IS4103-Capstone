import { Router } from "express";
import { 
    createVoucher 
} from '../controllers/voucherController';
import { adminAuthMiddleware } from '../middlewares/adminAuthMiddleware';

const router = Router();

router.post('/create', adminAuthMiddleware, createVoucher);

export default router;
