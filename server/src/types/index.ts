// 도메인 공유 타입 정의

export type OrderStatus = 'pending' | 'preparing' | 'completed';

export interface User {
  id: number;
  storeId: string;
  username: string;
  hashedPassword: string;
  failedAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
}

export interface Menu {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
}

export interface TableSession {
  id: number;
  storeId: string;
  tableNumber: string;
  sessionToken: string;
  activatedAt: Date | null;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  completedAt: Date | null;
}

export interface Order {
  id: number;
  tableSessionId: number;
  tableNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: number;
  orderId: number;
  menuId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface OrderHistory {
  id: number;
  orderId: number;
  tableSessionId: number;
  tableNumber: string;
  status: string;
  totalAmount: number;
  itemsSnapshot: OrderItem[];
  createdAt: Date;
  completedAt: Date;
  archivedAt: Date;
}

export interface TableDashboardItem {
  tableSessionId: number;
  tableNumber: string;
  totalAmount: number;
  orderCount: number;
  recentOrders: OrderWithItems[];
}

// API 응답 래퍼
export interface ApiSuccess<T> {
  success: true;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// JWT payload
export interface JwtPayload {
  userId: number;
  storeId: string;
  username: string;
}

// SSE 이벤트
export type SSEEventType =
  | 'order_created'
  | 'order_status_changed'
  | 'order_deleted'
  | 'table_session_completed';

export interface SSEEvent {
  type: SSEEventType;
  data: Record<string, unknown>;
}
