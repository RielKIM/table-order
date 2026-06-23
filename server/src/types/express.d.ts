import type { JwtPayload } from './index';

// Express Request 타입 확장 (declaration merging)
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
