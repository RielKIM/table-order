import bcrypt from 'bcrypt';
import { AuthService } from './authService';
import { UserModel } from '../../models/userModel';
import {
  InvalidCredentialsError,
  AccountLockedError,
  UnauthorizedError,
} from '../../shared/errors';
import type { User } from '../../types';

jest.mock('../../models/userModel');
jest.mock('bcrypt');

const mockedUserModel = UserModel as jest.Mocked<typeof UserModel>;

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    storeId: 'store-1',
    username: 'admin',
    hashedPassword: 'hashed',
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('AuthService', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_ADMIN_EXPIRES_IN = '16h';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate - 잠금 로직', () => {
    it('사용자가 없으면 InvalidCredentialsError 를 던진다', async () => {
      mockedUserModel.findByStoreAndUsername.mockResolvedValue(null);

      await expect(
        AuthService.authenticate('store-1', 'admin', 'password123')
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it('lockedUntil 이 미래면 AccountLockedError 를 던진다', async () => {
      const future = new Date(Date.now() + 10 * 60 * 1000);
      mockedUserModel.findByStoreAndUsername.mockResolvedValue(
        buildUser({ lockedUntil: future })
      );

      await expect(
        AuthService.authenticate('store-1', 'admin', 'password123')
      ).rejects.toBeInstanceOf(AccountLockedError);
    });

    it('비밀번호 불일치 시 실패 횟수를 증가시키고 InvalidCredentialsError 를 던진다', async () => {
      mockedUserModel.findByStoreAndUsername.mockResolvedValue(
        buildUser({ failedAttempts: 1 })
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthService.authenticate('store-1', 'admin', 'wrongpass')
      ).rejects.toBeInstanceOf(InvalidCredentialsError);

      expect(mockedUserModel.incrementFailedAttempts).toHaveBeenCalledWith(1, null);
    });

    it('5회째 실패 시 계정을 잠그고 AccountLockedError 를 던진다', async () => {
      mockedUserModel.findByStoreAndUsername.mockResolvedValue(
        buildUser({ failedAttempts: 4 })
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthService.authenticate('store-1', 'admin', 'wrongpass')
      ).rejects.toBeInstanceOf(AccountLockedError);

      // lockedUntil 이 설정된 채로 호출되어야 한다
      expect(mockedUserModel.incrementFailedAttempts).toHaveBeenCalledTimes(1);
      const [, lockedUntil] = mockedUserModel.incrementFailedAttempts.mock.calls[0];
      expect(lockedUntil).toBeInstanceOf(Date);
    });

    it('성공 시 실패 횟수를 초기화하고 토큰을 발급한다', async () => {
      mockedUserModel.findByStoreAndUsername.mockResolvedValue(buildUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await AuthService.authenticate('store-1', 'admin', 'password123');

      expect(mockedUserModel.resetFailedAttempts).toHaveBeenCalledWith(1);
      expect(typeof result.token).toBe('string');
      expect(result.user).toEqual({ id: 1, storeId: 'store-1', username: 'admin' });
      expect(result.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('generateToken / verifyToken', () => {
    it('발급한 토큰을 검증하면 동일한 payload 를 반환한다', () => {
      const payload = { userId: 7, storeId: 'store-7', username: 'manager' };
      const token = AuthService.generateToken(payload);
      const decoded = AuthService.verifyToken(token);

      expect(decoded).toEqual(payload);
    });

    it('잘못된 토큰은 UnauthorizedError 를 던진다', () => {
      expect(() => AuthService.verifyToken('not-a-valid-token')).toThrow(
        UnauthorizedError
      );
    });
  });
});
