import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './authService';
import { UnauthorizedError } from '../../shared/errors';

// Bearer 토큰을 검증하고 req.user 에 페이로드를 첨부한다 (deny-by-default)
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedError('인증 토큰이 필요합니다');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedError('인증 토큰이 필요합니다');
    }

    const payload = AuthService.verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
}
