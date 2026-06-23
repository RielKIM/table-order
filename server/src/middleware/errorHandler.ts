import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';
import { sendError } from '../shared/response';
import { logger } from '../shared/logger';

// 글로벌 에러 핸들러 (SECURITY-15 준수)
// 프로덕션에서 스택 트레이스/내부 정보 노출 금지, fail closed

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn('Handled application error', { code: err.code, message: err.message });
    sendError(res, err.code, err.message, err.statusCode);
    return;
  }

  // 예상치 못한 에러: 내부 정보 노출 금지
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  sendError(res, 'INTERNAL_ERROR', '서버 내부 오류가 발생했습니다', 500);
}

// 404 핸들러
export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, 'NOT_FOUND', '요청한 리소스를 찾을 수 없습니다', 404);
}
