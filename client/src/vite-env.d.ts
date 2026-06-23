/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * API 베이스 URL.
   * - 배포: 백엔드 절대 URL (예: https://api.example.com/api)
   * - 개발/미설정 시: '/api' 로 폴백되어 vite proxy 가 localhost:3000 으로 전달
   * api.ts(API_BASE_URL) 및 sse.ts(buildEventsUrl) 가 동일 값을 사용한다.
   */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
