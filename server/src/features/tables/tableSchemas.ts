import { z } from 'zod';

// 테이블 초기 설정 스키마 (business-rules: Table)
export const setupSchema = z.object({
  storeId: z.string().min(1).max(50),
  tableNumber: z.string().min(1).max(10),
  tablePassword: z.string().min(4),
});

// 테이블 자동 로그인 스키마 (sessionToken 기반)
export const tableLoginSchema = z.object({
  sessionToken: z.string().min(1),
});

export type SetupBody = z.infer<typeof setupSchema>;
export type TableLoginBody = z.infer<typeof tableLoginSchema>;
