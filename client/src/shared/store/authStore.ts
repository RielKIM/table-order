/**
 * authStore — 관리자 인증 (관리자 앱에서 사용, 공유 레이어에 위치)
 *
 * localStorage 'admin_token' 에 JWT 보관 (api.ts 인터셉터가 동일 키 사용)
 */
import { create } from 'zustand';
import { apiPost, apiGet, ADMIN_TOKEN_KEY } from '@/shared/services/api';
import type { AdminLoginInput, AdminLoginResult, AdminUser } from '@/shared/types';

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  login: (input: AdminLoginInput) => Promise<void>;
  logout: () => void;
  /** 저장된 토큰 유효성 검증 (앱 부트스트랩 시) */
  validateToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem(ADMIN_TOKEN_KEY),
  user: null,
  isAuthenticated: Boolean(localStorage.getItem(ADMIN_TOKEN_KEY)),
  loading: false,
  error: null,

  login: async (input) => {
    set({ loading: true, error: null });
    try {
      const result = await apiPost<AdminLoginResult>('/auth/login', input);
      localStorage.setItem(ADMIN_TOKEN_KEY, result.token);
      set({
        token: result.token,
        user: result.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그인에 실패했습니다.';
      set({ loading: false, error: message, isAuthenticated: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    set({ token: null, user: null, isAuthenticated: false, error: null });
  },

  validateToken: async () => {
    const token = get().token;
    if (!token) {
      set({ isAuthenticated: false });
      return false;
    }
    try {
      const user = await apiGet<AdminUser>('/auth/validate-token');
      set({ user, isAuthenticated: true });
      return true;
    } catch {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      set({ token: null, user: null, isAuthenticated: false });
      return false;
    }
  },
}));
