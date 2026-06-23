import { Router } from 'express';
import { tableController } from './tableController';
import { verifyJWT } from '../../middleware/authMiddleware';

const router = Router();

// 공개 엔드포인트 (AR-03)
router.post('/setup', tableController.setup);
router.post('/login', tableController.login);

// 관리자 보호 엔드포인트 (AR-01)
// /dashboard 는 /:sessionId 패턴과 충돌하지 않도록 명시적으로 등록
router.get('/dashboard', verifyJWT, tableController.dashboard);
router.post('/:sessionId/complete', verifyJWT, tableController.complete);

export default router;
