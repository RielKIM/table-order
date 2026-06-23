import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../../models/userModel';
import type { JwtPayload, User } from '../../types';
import {
  InvalidCredentialsError,
  AccountLockedError,
  UnauthorizedError,
} from '../../shared/errors';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15분

export interface AuthResult {
  token: string;
  expiresAt: Date;
  user: Pick<User, 'id' | 'storeId' | 'username'>;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다');
  }
  return secret;
}

function getExpiresIn(): string {
  return process.env.JWT_ADMIN_EXPIRES_IN || '16h';
}

// 만료 문자열(예: "16h")을 만료 시각(Date)으로 변환
function computeExpiresAt(expiresIn: string): Date {
  const match = /^(\d+)([smhd])$/.exec(expiresIn.trim());
  const now = Date.now();
  if (!match) {
    // 숫자(초)로 해석 시도
    const seconds = Number(expiresIn);
    if (!Number.isNaN(seconds)) {
      return new Date(now + seconds * 1000);
    }
    return new Date(now + LOCK_DURATION_MS);
  }
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return new Date(now + value * unitMs[unit]);
}

export const AuthService = {
  generateToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: getExpiresIn() as SignOptions['expiresIn'] };
    return jwt.sign(payload, getSecret(), options);
  },

  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, getSecret());
      if (typeof decoded === 'string') {
        throw new UnauthorizedError('유효하지 않은 토큰입니다');
      }
      const { userId, storeId, username } = decoded as Record<string, unknown>;
      if (
        typeof userId !== 'number' ||
        typeof storeId !== 'string' ||
        typeof username !== 'string'
      ) {
        throw new UnauthorizedError('유효하지 않은 토큰입니다');
      }
      return { userId, storeId, username };
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        throw err;
      }
      throw new UnauthorizedError('유효하지 않은 토큰입니다');
    }
  },

  async authenticate(
    storeId: string,
    username: string,
    password: string
  ): Promise<AuthResult> {
    const user = await UserModel.findByStoreAndUsername(storeId, username);
    if (!user) {
      // 사용자가 없어도 자격 증명 오류로 통일 (계정 열거 방지)
      throw new InvalidCredentialsError();
    }

    // 잠금 상태 확인
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / (60 * 1000)
      );
      throw new AccountLockedError(remainingMinutes);
    }

    const matches = await bcrypt.compare(password, user.hashedPassword);
    if (!matches) {
      const nextAttempts = user.failedAttempts + 1;
      const lockedUntil =
        nextAttempts >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCK_DURATION_MS)
          : null;
      await UserModel.incrementFailedAttempts(user.id, lockedUntil);

      if (lockedUntil) {
        const remainingMinutes = Math.ceil(LOCK_DURATION_MS / (60 * 1000));
        throw new AccountLockedError(remainingMinutes);
      }
      throw new InvalidCredentialsError();
    }

    // 인증 성공: 실패 카운트 초기화
    await UserModel.resetFailedAttempts(user.id);

    const payload: JwtPayload = {
      userId: user.id,
      storeId: user.storeId,
      username: user.username,
    };
    const token = this.generateToken(payload);
    const expiresAt = computeExpiresAt(getExpiresIn());

    return {
      token,
      expiresAt,
      user: { id: user.id, storeId: user.storeId, username: user.username },
    };
  },
};
