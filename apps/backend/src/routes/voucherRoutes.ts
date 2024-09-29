import { Router } from "express";
import { 
    createVoucher,
    assignVoucher,
    removeVoucher,
    getAllVouchers,
    searchVoucher,
    getVoucherDetails
} from '../controllers/voucherController';
import { adminAuthMiddleware } from '../middlewares/adminAuthMiddleware';

const router = Router();

router.post('/create', adminAuthMiddleware, createVoucher);
router.post('/assign', adminAuthMiddleware, assignVoucher);
router.delete('/remove/:voucher_id', adminAuthMiddleware, removeVoucher);
router.get('/all', adminAuthMiddleware, getAllVouchers);
router.get('/search', adminAuthMiddleware, searchVoucher);
router.get('/details/:voucher_id', adminAuthMiddleware, getVoucherDetails);

export default router;
