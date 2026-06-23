import { Router } from 'express';
import { menuController } from './menuController';
import { verifyJWT } from '../../middleware/authMiddleware';

const router = Router();

// 공개 엔드포인트 (AR-03)
router.get('/', menuController.list);
router.get('/:id', menuController.getById);

// 관리자 보호 엔드포인트 (AR-01)
// reorder 는 /:id 보다 먼저 등록하여 경로 충돌을 방지
router.put('/reorder', verifyJWT, menuController.reorder);
router.post('/', verifyJWT, menuController.create);
router.put('/:id', verifyJWT, menuController.update);
router.delete('/:id', verifyJWT, menuController.remove);

export default router;
