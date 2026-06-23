import { z } from 'zod';
import type { OrderStatus } from '../../types';

// 주문 생성 스키마 (BR-01)
export const createOrderSchema = z.object({
  tableSessionId: z.number().int().positive(),
  menuItems: z
    .array(
      z.object({
        menuId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1),
});

// 주문 상태 변경 스키마 (BR-02)
export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'completed']),
});

export type CreateOrderBody = z.infer<typeof createOrderSchema>;
export type UpdateStatusBody = z.infer<typeof updateStatusSchema>;
export type { OrderStatus };
