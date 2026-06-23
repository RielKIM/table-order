import type { Request, Response, NextFunction } from 'express';
import { OrderService } from './orderService';
import { TableService } from '../tables/tableService';
import { createOrderSchema, updateStatusSchema } from './orderSchemas';
import { sendSuccess } from '../../shared/response';
import { ValidationError } from '../../shared/errors';

function parseId(raw: string, label = 'ID'): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError(`유효하지 않은 ${label}입니다`);
  }
  return id;
}

export const orderController = {
  // POST /api/orders (테이블 고객)
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('입력값이 올바르지 않습니다');
      }
      const order = await OrderService.createOrder(parsed.data);
      sendSuccess(res, order, 201);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/orders/current/:tableSessionId
  async current(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tableSessionId = parseId(req.params.tableSessionId, '세션 ID');
      const orders = await OrderService.getCurrentOrders(tableSessionId);
      sendSuccess(res, orders);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/orders/history/:tableSessionId
  async history(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tableSessionId = parseId(req.params.tableSessionId, '세션 ID');
      const history = await OrderService.getOrderHistory(tableSessionId);
      sendSuccess(res, history);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/orders/dashboard (관리자)
  async dashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await TableService.getDashboardData();
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/orders/:id/status (관리자)
  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseId(req.params.id, '주문 ID');
      const parsed = updateStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('입력값이 올바르지 않습니다');
      }
      const order = await OrderService.updateOrderStatus(id, parsed.data.status);
      sendSuccess(res, order);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/orders/:id (관리자)
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseId(req.params.id, '주문 ID');
      await OrderService.deleteOrder(id);
      sendSuccess(res, { id, deleted: true });
    } catch (err) {
      next(err);
    }
  },
};
