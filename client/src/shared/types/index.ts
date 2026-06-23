/**
 * 공유 도메인 타입 정의 (서버 계약과 동일, camelCase)
 *
 * 서버 응답 포맷:
 *   성공: { success: true, data: T, pagination?: {...} }
 *   에러: { success: false, error: { code, message } }
 */

// ---------------------------------------------------------------------------
// 도메인 enum / 기본 타입
// ---------------------------------------------------------------------------

/** 주문 상태 — 대기중 → 준비중 → 완료 */
export type OrderStatus = 'pending' | 'preparing' | 'completed';

/** 주문 상태 한글 라벨 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '대기중',
  preparing: '준비중',
  completed: '완료',
};

// ---------------------------------------------------------------------------
// 엔티티
// ---------------------------------------------------------------------------

/** 메뉴 */
export interface Menu {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
}

/** 테이블 세션 */
export interface TableSession {
  id: number;
  storeId: string;
  tableNumber: string;
  sessionToken: string;
  createdAt?: string;
  expiresAt: string;
  isActive: boolean;
  completedAt?: string | null;
}

/** 주문 항목 (메뉴명은 서버에서 조인되어 내려올 수 있음) */
export interface OrderItem {
  id: number;
  orderId: number;
  menuId: number;
  quantity: number;
  unitPrice: number;
  /** 표시용 (서버 조인 시 제공) */
  menuName?: string;
}

/** 주문 */
export interface Order {
  id: number;
  tableSessionId: number;
  tableNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
}

/** 주문 + 항목 목록 */
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/** 관리자 대시보드 테이블 카드 항목 */
export interface TableDashboardItem {
  tableSessionId: number;
  tableNumber: string;
  totalAmount: number;
  orderCount: number;
  /** 최신 주문 미리보기 */
  latestOrder?: OrderWithItems | null;
  orders?: OrderWithItems[];
}

/** 관리자 계정 */
export interface AdminUser {
  id: number;
  storeId: string;
  username: string;
}

// ---------------------------------------------------------------------------
// 장바구니
// ---------------------------------------------------------------------------

/** 장바구니 항목 = 메뉴 + 수량 */
export interface CartItem {
  menu: Menu;
  quantity: number;
}

// ---------------------------------------------------------------------------
// 주문 생성 요청 payload
// ---------------------------------------------------------------------------

export interface CreateOrderItemInput {
  menuId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderInput {
  tableSessionId: number;
  items: CreateOrderItemInput[];
}

// ---------------------------------------------------------------------------
// API 응답 포맷 (서버 계약)
// ---------------------------------------------------------------------------

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  pagination?: Pagination;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// 인증 / 테이블 설정 payload
// ---------------------------------------------------------------------------

export interface AdminLoginInput {
  storeId: string;
  username: string;
  password: string;
}

export interface AdminLoginResult {
  token: string;
  user: AdminUser;
}

export interface TableSetupInput {
  storeId: string;
  tableNumber: string;
  tablePassword: string;
}

export interface TableLoginInput {
  storeId: string;
  tableNumber: string;
  tablePassword: string;
}

// ---------------------------------------------------------------------------
// SSE 이벤트
// ---------------------------------------------------------------------------

export type SSEEventType =
  | 'order_created'
  | 'order_status_changed'
  | 'order_deleted'
  | 'connected'
  | 'ping';

export interface SSEEvent {
  type: SSEEventType;
  data: unknown;
}

/** order_status_changed payload */
export interface OrderStatusChangedPayload {
  id: number;
  status: OrderStatus;
  tableSessionId?: number;
}

/** order_deleted payload */
export interface OrderDeletedPayload {
  id: number;
  tableSessionId?: number;
}
