import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { eventService } from './eventService';
import { sendError } from '../../shared/response';

// SSE 응답 헤더 설정
function initSSE(res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
}

export const sseController = {
  // GET /api/events/orders?session=<tableSessionId> (고객)
  customerStream(req: Request, res: Response): void {
    const sessionRaw = req.query.session;
    const tableSessionId = Number(sessionRaw);
    if (
      typeof sessionRaw !== 'string' ||
      !Number.isInteger(tableSessionId) ||
      tableSessionId <= 0
    ) {
      sendError(res, 'VALIDATION_ERROR', 'session 쿼리 파라미터가 필요합니다', 400);
      return;
    }

    initSSE(res);
    const clientId = uuidv4();
    eventService.registerClient(clientId, res, false, tableSessionId);

    req.on('close', () => {
      eventService.removeClient(clientId);
      res.end();
    });
  },

  // GET /api/events/admin/orders (관리자, verifyJWT 보호)
  adminStream(req: Request, res: Response): void {
    initSSE(res);
    const clientId = uuidv4();
    eventService.registerClient(clientId, res, true);

    req.on('close', () => {
      eventService.removeClient(clientId);
      res.end();
    });
  },
};
