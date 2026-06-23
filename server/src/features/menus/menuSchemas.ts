import { z } from 'zod';

export const createMenuSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().int().positive(),
  category: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().max(255).optional(),
});

export const updateMenuSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    price: z.number().int().positive().optional(),
    category: z.string().min(1).max(50).optional(),
    description: z.string().max(500).optional(),
    imageUrl: z.string().url().max(255).optional(),
    displayOrder: z.number().int().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: '수정할 필드가 최소 하나 이상 필요합니다',
  });

export const reorderMenuSchema = z.object({
  orders: z
    .array(
      z.object({
        id: z.number().int().positive(),
        displayOrder: z.number().int().nonnegative(),
      })
    )
    .min(1),
});

export type CreateMenuBody = z.infer<typeof createMenuSchema>;
export type UpdateMenuBody = z.infer<typeof updateMenuSchema>;
export type ReorderMenuBody = z.infer<typeof reorderMenuSchema>;
