import type { Request, Response, NextFunction } from 'express';
import { loginSchema } from './authSchemas';
import { AuthService } from './authService';
import { sendSuccess, sendError } from '../../shared/response';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, 'VALIDATION_ERROR', '입력값이 올바르지 않습니다', 400);
        return;
      }

      const { storeId, username, password } = parsed.data;
      const result = await AuthService.authenticate(storeId, username, password);

      sendSuccess(res, {
        token: result.token,
        expiresAt: result.expiresAt,
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  },
};
