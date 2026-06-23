import type { Response } from 'express';
import type { ApiSuccess } from '../types';

// 통일된 API 응답 헬퍼

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  pagination?: ApiSuccess<T>['pagination']
): void {
  const body: ApiSuccess<T> = { success: true, data };
  if (pagination) {
    body.pagination = pagination;
  }
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode = 400
): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}
