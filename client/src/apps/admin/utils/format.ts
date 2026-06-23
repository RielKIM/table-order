/**
 * 금액을 한국 원화 형식으로 표시한다. 예: 12000 -> "12,000원"
 */
export function formatPrice(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `${new Intl.NumberFormat('ko-KR').format(value)}원`;
}

/**
 * ISO 날짜 문자열을 'YYYY-MM-DD HH:mm' 형식으로 표시한다.
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) {
    return '-';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/**
 * ISO 날짜 문자열을 'YYYY-MM-DD' 형식의 날짜 키로 변환한다.
 * 날짜 필터 비교에 사용한다.
 */
export function toDateKey(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 알 수 없는 에러 객체에서 사용자에게 보여줄 메시지를 추출한다.
 * API 표준 에러 포맷 { success:false, error:{ code, message } } 및 axios 에러를 처리한다.
 */
export function extractErrorMessage(error: unknown, fallback = '오류가 발생했습니다.'): string {
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object') {
    const anyErr = error as {
      response?: { data?: { error?: { message?: string } } };
      message?: string;
    };
    const apiMessage = anyErr.response?.data?.error?.message;
    if (apiMessage) {
      return apiMessage;
    }
    if (anyErr.message) {
      return anyErr.message;
    }
  }
  return fallback;
}
