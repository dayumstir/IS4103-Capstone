import { Router } from "express";
import { 
    createVoucher,
    assignVoucher,
    deactivateVoucher,
    getAllVouchers,
    searchVoucher,
    getVoucherDetails
} from '../controllers/voucherController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/create', authMiddleware, createVoucher);
router.post('/assign', authMiddleware, assignVoucher);
router.delete('/deactivate/:voucher_id', authMiddleware, deactivateVoucher);
router.get('/', authMiddleware, getAllVouchers);
router.get('/search', authMiddleware, searchVoucher);
router.get('/details/:voucher_id', authMiddleware, getVoucherDetails);

export default router;
