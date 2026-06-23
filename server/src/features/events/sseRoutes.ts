import { Router } from 'express';
import { sseController } from './sseController';
import { verifyJWT } from '../../middleware/authMiddleware';

const router = Router();

// 고객용 주문 이벤트 스트림 (AR-02: query session 으로 테이블 식별)
router.get('/orders', sseController.customerStream);

// 관리자용 주문 이벤트 스트림 (AR-01: JWT 보호)
router.get('/admin/orders', verifyJWT, sseController.adminStream);

export default router;
