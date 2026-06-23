import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../features/auth/authService';
import { UnauthorizedError } from '../shared/errors';

// JWT 검증 미들웨어 (AR-01, SEC-03: deny-by-default)
// Authorization: Bearer <token> 헤더를 검증하고 req.user 에 페이로드를 주입한다.
export function verifyJWT(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedError('인증 토큰이 필요합니다');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedError('인증 토큰이 필요합니다');
    }

    req.user = AuthService.verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
}
