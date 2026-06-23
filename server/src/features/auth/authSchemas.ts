import { z } from 'zod';

export const loginSchema = z.object({
  storeId: z.string().min(1).max(50),
  username: z.string().min(1).max(50),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;
