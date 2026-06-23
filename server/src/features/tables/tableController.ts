import type { Request, Response, NextFunction } from 'express';
import { TableService } from './tableService';
import { setupSchema, tableLoginSchema } from './tableSchemas';
import { sendSuccess } from '../../shared/response';
import { ValidationError } from '../../shared/errors';

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('유효하지 않은 세션 ID입니다');
  }
  return id;
}

export const tableController = {
  // POST /api/tables/setup (공개)
  async setup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = setupSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('입력값이 올바르지 않습니다');
      }
      const { storeId, tableNumber, tablePassword } = parsed.data;
      const result = await TableService.setupTable(storeId, tableNumber, tablePassword);
      sendSuccess(
        res,
        {
          sessionToken: result.sessionToken,
          expiresAt: result.expiresAt,
          tableSession: result.tableSession,
        },
        201
      );
    } catch (err) {
      next(err);
    }
  },

  // POST /api/tables/login (공개)
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = tableLoginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('입력값이 올바르지 않습니다');
      }
      const result = await TableService.validateTableLogin(parsed.data.sessionToken);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/tables/:sessionId/complete (관리자 보호)
  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = parseId(req.params.sessionId);
      const result = await TableService.completeTableSession(sessionId);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/tables/dashboard (관리자 보호)
  async dashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await TableService.getDashboardData();
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },
};
