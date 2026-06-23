/**
 * tableSessionStore — 고객 테이블 세션 (US-C01, US-C02)
 *
 * localStorage 'table_session_token' 및 설정 정보 보관
 * - setupTable: 최초 설정 (POST /tables/setup)
 * - autoLogin: 저장된 정보로 자동 로그인 (POST /tables/login)
 */
import { create } from 'zustand';
import { apiPost } from '@/shared/services/api';
import type {
  TableSession,
  TableSetupInput,
} from '@/shared/types';

const SESSION_TOKEN_KEY = 'table_session_token';
const TABLE_CONFIG_KEY = 'table_config';

/** 자동 로그인을 위해 보관하는 테이블 설정 (비밀번호 포함) */
interface StoredTableConfig {
  storeId: string;
  tableNumber: string;
  tablePassword: string;
}

function loadStoredConfig(): StoredTableConfig | null {
  try {
    const raw = localStorage.getItem(TABLE_CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredTableConfig;
  } catch {
    return null;
  }
}

interface TableSessionState {
  sessionToken: string | null;
  tableSession: TableSession | null;
  /** 초기 설정 완료 여부 */
  isConfigured: boolean;
  loading: boolean;
  error: string | null;

  /** 최초 설정 (관리자) */
  setupTable: (input: TableSetupInput) => Promise<void>;
  /** 저장된 정보로 자동 로그인/재로그인 */
  autoLogin: () => Promise<boolean>;
  /** 설정 초기화 */
  resetTable: () => void;
}

interface TableSessionResult {
  sessionToken: string;
  tableSession: TableSession;
}

export const useTableSessionStore = create<TableSessionState>((set) => ({
  sessionToken: localStorage.getItem(SESSION_TOKEN_KEY),
  tableSession: null,
  isConfigured: Boolean(loadStoredConfig()),
  loading: false,
  error: null,

  setupTable: async (input) => {
    set({ loading: true, error: null });
    try {
      const result = await apiPost<TableSessionResult>('/tables/setup', input);
      localStorage.setItem(SESSION_TOKEN_KEY, result.sessionToken);
      const config: StoredTableConfig = {
        storeId: input.storeId,
        tableNumber: input.tableNumber,
        tablePassword: input.tablePassword,
      };
      localStorage.setItem(TABLE_CONFIG_KEY, JSON.stringify(config));
      set({
        sessionToken: result.sessionToken,
        tableSession: result.tableSession,
        isConfigured: true,
        loading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '테이블 설정에 실패했습니다.';
      set({ loading: false, error: message });
      throw error;
    }
  },

  autoLogin: async () => {
    const config = loadStoredConfig();
    if (!config) {
      set({ isConfigured: false });
      return false;
    }
    set({ loading: true, error: null });
    try {
      const result = await apiPost<TableSessionResult>('/tables/login', {
        storeId: config.storeId,
        tableNumber: config.tableNumber,
        tablePassword: config.tablePassword,
      });
      localStorage.setItem(SESSION_TOKEN_KEY, result.sessionToken);
      set({
        sessionToken: result.sessionToken,
        tableSession: result.tableSession,
        isConfigured: true,
        loading: false,
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '자동 로그인에 실패했습니다.';
      set({ loading: false, error: message });
      return false;
    }
  },

  resetTable: () => {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(TABLE_CONFIG_KEY);
    set({
      sessionToken: null,
      tableSession: null,
      isConfigured: false,
      error: null,
    });
  },
}));
