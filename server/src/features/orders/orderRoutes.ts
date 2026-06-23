import { Router } from 'express';
import { orderController } from './orderController';
import { verifyJWT } from '../../middleware/authMiddleware';

const router = Router();

// 테이블 고객: 주문 생성
router.post('/', orderController.create);

// 주문 조회 (현재 세션 / 과거 내역)
router.get('/current/:tableSessionId', orderController.current);
router.get('/history/:tableSessionId', orderController.history);

// 관리자 보호 엔드포인트 (AR-01)
router.get('/dashboard', verifyJWT, orderController.dashboard);
router.put('/:id/status', verifyJWT, orderController.updateStatus);
router.delete('/:id', verifyJWT, orderController.remove);

export default router;
