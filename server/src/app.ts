import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { validateEnv } from './config/env';
import { securityHeaders, getCorsOptions } from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './features/auth/authRoutes';
import menuRoutes from './features/menus/menuRoutes';
import orderRoutes from './features/orders/orderRoutes';
import tableRoutes from './features/tables/tableRoutes';
import sseRoutes from './features/events/sseRoutes';

dotenv.config();

// 필수 환경변수 검증 (SEC-15: fail closed) — 누락 시 즉시 기동 중단
validateEnv();

const app = express();

// 보안 미들웨어 (SEC-04, SEC-08)
app.use(securityHeaders);
app.use(cors(getCorsOptions()));

// 요청 바디 파싱 (SEC-02: 바디 크기 제한)
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// Feature 라우트 등록
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/events', sseRoutes);

// 404 및 글로벌 에러 핸들러 (반드시 마지막에 등록)
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
