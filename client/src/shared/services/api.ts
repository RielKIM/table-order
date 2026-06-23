/**
 * axios 인스턴스 + 공통 API 헬퍼
 *
 * - baseURL: import.meta.env.VITE_API_URL (없으면 '/api' — 개발 시 Vite proxy → localhost:3000)
 * - 요청 인터셉터: localStorage 'admin_token' JWT 를 Authorization 헤더로 주입
 * - 응답 인터셉터: 401 응답 시 만료된 admin 토큰 정리
 * - 응답 언래핑: ApiResponse<T> 의 success/data/error 처리
 */
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios';
import type { ApiResponse, Pagination } from '@/shared/types';

export const ADMIN_TOKEN_KEY = 'admin_token';

/**
 * API 베이스 URL.
 * - 배포: VITE_API_URL (예: https://api.example.com/api)
 * - 개발/폴백: '/api' (vite.config 의 proxy 로 localhost:3000 에 전달)
 *
 * SSE(EventSource) 도 동일 베이스를 사용하도록 sse.ts 에서 import 한다.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

/** API 호출 실패 시 throw 되는 에러 (code/message 보존) */
export class ApiRequestError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.status = status;
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: JWT 토큰 주입
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) {
    config.headers.set?.('Authorization', `Bearer ${token}`);
  }
  return config;
});

// 응답 인터셉터: 401(인증 만료) 시 저장된 admin 토큰 정리.
// 이후 authStore.validateToken / 라우팅 가드가 미인증 상태로 처리한다.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

/** 결과 + 페이지네이션을 함께 돌려주는 형태 */
export interface UnwrappedResult<T> {
  data: T;
  pagination?: Pagination;
}

/**
 * ApiResponse 를 언래핑한다.
 * 성공이면 data 를 반환하고, 실패면 ApiRequestError 를 throw 한다.
 */
function unwrap<T>(body: ApiResponse<T>, status?: number): T {
  if (body && body.success) {
    return body.data;
  }
  const code = body?.error?.code ?? 'UNKNOWN_ERROR';
  const message = body?.error?.message ?? '알 수 없는 오류가 발생했습니다.';
  throw new ApiRequestError(message, code, status);
}

/** axios 에러를 ApiRequestError 로 정규화 */
function normalizeError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) {
    return error;
  }
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const body = error.response?.data as ApiResponse<unknown> | undefined;
    if (body && body.success === false && body.error) {
      return new ApiRequestError(body.error.message, body.error.code, status);
    }
    return new ApiRequestError(
      error.message || '네트워크 오류가 발생했습니다.',
      'NETWORK_ERROR',
      status,
    );
  }
  return new ApiRequestError('알 수 없는 오류가 발생했습니다.', 'UNKNOWN_ERROR');
}

// ---------------------------------------------------------------------------
// 공통 HTTP 헬퍼 (언래핑된 data 반환)
// ---------------------------------------------------------------------------

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const res = await apiClient.get<ApiResponse<T>>(url, config);
    return unwrap(res.data, res.status);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function apiPost<T>(
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const res = await apiClient.post<ApiResponse<T>>(url, payload, config);
    return unwrap(res.data, res.status);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function apiPut<T>(
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const res = await apiClient.put<ApiResponse<T>>(url, payload, config);
    return unwrap(res.data, res.status);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const res = await apiClient.delete<ApiResponse<T>>(url, config);
    return unwrap(res.data, res.status);
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * 페이지네이션 메타가 필요한 GET 요청.
 * data 와 pagination 을 함께 반환한다.
 */
export async function apiGetWithMeta<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<UnwrappedResult<T>> {
  try {
    const res = await apiClient.get<ApiResponse<T>>(url, config);
    const data = unwrap(res.data, res.status);
    const pagination =
      res.data.success ? res.data.pagination : undefined;
    return { data, pagination };
  } catch (error) {
    throw normalizeError(error);
  }
}
