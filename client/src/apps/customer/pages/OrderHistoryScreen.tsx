import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/shared/store/orderStore';
import { useTableSessionStore } from '@/shared/store/tableSessionStore';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { ORDER_STATUS_LABELS, type OrderStatus, type OrderWithItems } from '@/shared/types';

function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  preparing: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
};

function OrderHistoryCard({ order }: { order: OrderWithItems }) {
  return (
    <div
      data-testid={`order-history-card-${order.id}`}
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900">주문 #{order.id}</span>
        <span
          data-testid={`order-history-status-${order.id}`}
          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-400">{formatTime(order.createdAt)}</p>

      <ul className="mt-3 space-y-1">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm text-gray-700">
            <span>
              {item.menuName ?? `메뉴 #${item.menuId}`} × {item.quantity}
            </span>
            <span>{formatPrice(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex justify-between border-t border-gray-100 pt-2">
        <span className="text-sm text-gray-600">합계</span>
        <span className="text-sm font-bold text-gray-900">{formatPrice(order.totalAmount)}</span>
      </div>
    </div>
  );
}

/** 주문 내역 화면 (US-C10, US-C11) — SSE 실시간 상태 갱신은 CustomerApp 에서 처리 */
function OrderHistoryScreen() {
  const navigate = useNavigate();

  const currentOrders = useOrderStore((s) => s.currentOrders);
  const loading = useOrderStore((s) => s.loading);
  const error = useOrderStore((s) => s.error);
  const fetchCurrentOrders = useOrderStore((s) => s.fetchCurrentOrders);

  const tableSession = useTableSessionStore((s) => s.tableSession);

  useEffect(() => {
    if (tableSession) {
      void fetchCurrentOrders(tableSession.id);
    }
  }, [tableSession, fetchCurrentOrders]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          data-testid="order-history-back-button"
          className="min-h-[44px] min-w-[44px] text-sm text-gray-600"
          onClick={() => navigate('/menu')}
          aria-label="메뉴로 돌아가기"
        >
          ← 메뉴
        </button>
        <h1 className="text-lg font-bold text-gray-900">주문 내역</h1>
        <span className="min-w-[44px]" />
      </header>

      <main className="flex-1 space-y-3 p-4">
        {loading && currentOrders.length === 0 ? (
          <LoadingSpinner label="주문 내역을 불러오는 중..." />
        ) : error ? (
          <p data-testid="order-history-error" className="py-8 text-center text-sm text-red-600">
            {error}
          </p>
        ) : currentOrders.length === 0 ? (
          <p data-testid="order-history-empty" className="py-16 text-center text-sm text-gray-500">
            주문 내역이 없습니다.
          </p>
        ) : (
          currentOrders.map((order) => <OrderHistoryCard key={order.id} order={order} />)
        )}
      </main>
    </div>
  );
}

export default OrderHistoryScreen;
