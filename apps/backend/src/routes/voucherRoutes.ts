import { Router } from "express";
import { 
    createVoucher,
    assignVoucher,
    deactivateVoucher,
    getAllVouchers,
    searchVoucher,
    getVoucherDetails
} from '../controllers/voucherController';
import { adminAuthMiddleware } from '../middlewares/adminAuthMiddleware';

const router = Router();

router.post('/create', adminAuthMiddleware, createVoucher);
router.post('/assign', adminAuthMiddleware, assignVoucher);
router.delete('/deactivate/:voucher_id', adminAuthMiddleware, deactivateVoucher);
router.get('/', adminAuthMiddleware, getAllVouchers);
router.get('/search', adminAuthMiddleware, searchVoucher);
router.get('/details/:voucher_id', adminAuthMiddleware, getVoucherDetails);

export default router;
