/**
 * SSE (Server-Sent Events) 연결 헬퍼
 *
 * - connectSSE(url, onMessage): EventSource 를 생성하고 메시지를 파싱해 콜백 전달
 * - 연결 끊김 시 지수 백오프로 자동 재연결
 * - 반환된 핸들의 disconnect() 로 정리
 * - buildEventsUrl(path): API_BASE_URL(VITE_API_URL) 기반으로 SSE 엔드포인트 URL 생성
 */
import type { SSEEvent } from '@/shared/types';
import { API_BASE_URL } from '@/shared/services/api';

/**
 * SSE 엔드포인트 절대/루트상대 URL 을 생성한다.
 * 예) buildEventsUrl('/events/orders?session=abc')
 *   - 개발:  '/api/events/orders?session=abc' (vite proxy)
 *   - 배포:  'https://api.example.com/api/events/orders?session=abc' (VITE_API_URL)
 */
export function buildEventsUrl(path: string): string {
  const base = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

export interface SSEConnectionOptions {
  /** 최초 재연결 지연(ms) */
  baseDelayMs?: number;
  /** 최대 재연결 지연(ms) */
  maxDelayMs?: number;
  /** 최대 재시도 횟수 (초과 시 onMaxRetries 호출) */
  maxRetries?: number;
  /** 연결 성공 시 콜백 */
  onOpen?: () => void;
  /** 에러 발생 시 콜백 */
  onError?: (error: Event) => void;
  /** 최대 재시도 초과 시 콜백 (새로고침 안내 등) */
  onMaxRetries?: () => void;
}

export interface SSEConnection {
  /** 연결 종료 및 재연결 타이머 정리 */
  disconnect: () => void;
}

const DEFAULT_OPTIONS: Required<
  Pick<SSEConnectionOptions, 'baseDelayMs' | 'maxDelayMs' | 'maxRetries'>
> = {
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  maxRetries: 10,
};

/**
 * SSE 연결을 생성한다. 끊기면 지수 백오프로 자동 재연결한다.
 */
export function connectSSE(
  url: string,
  onMessage: (event: SSEEvent) => void,
  options: SSEConnectionOptions = {},
): SSEConnection {
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_OPTIONS.baseDelayMs;
  const maxDelayMs = options.maxDelayMs ?? DEFAULT_OPTIONS.maxDelayMs;
  const maxRetries = options.maxRetries ?? DEFAULT_OPTIONS.maxRetries;

  let eventSource: EventSource | null = null;
  let retryCount = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  const clearReconnectTimer = () => {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const scheduleReconnect = () => {
    if (closed) return;

    if (retryCount >= maxRetries) {
      options.onMaxRetries?.();
      return;
    }

    const delay = Math.min(baseDelayMs * 2 ** retryCount, maxDelayMs);
    retryCount += 1;

    clearReconnectTimer();
    reconnectTimer = setTimeout(() => {
      open();
    }, delay);
  };

  const handleMessage = (rawEvent: MessageEvent<string>) => {
    if (!rawEvent.data) return;
    try {
      const parsed = JSON.parse(rawEvent.data) as SSEEvent;
      onMessage(parsed);
    } catch {
      // 파싱 불가한 메시지(keep-alive 등)는 무시
    }
  };

  const open = () => {
    if (closed) return;

    // 기존 연결 정리
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    const es = new EventSource(url, { withCredentials: true });
    eventSource = es;

    es.onopen = () => {
      retryCount = 0;
      options.onOpen?.();
    };

    es.onmessage = handleMessage;

    es.onerror = (error) => {
      options.onError?.(error);
      // EventSource 는 자체 재연결을 시도하지만, 명시적으로 제어한다.
      es.close();
      if (eventSource === es) {
        eventSource = null;
      }
      scheduleReconnect();
    };
  };

  open();

  return {
    disconnect: () => {
      closed = true;
      clearReconnectTimer();
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    },
  };
}
