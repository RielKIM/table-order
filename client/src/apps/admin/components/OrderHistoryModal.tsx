import { useEffect, useMemo, useState } from 'react';
import type { OrderWithItems } from '@/shared/types';
import { useOrderStore } from '@/shared/store/orderStore';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import StatusBadge from './StatusBadge';
import { extractErrorMessage, formatDateTime, formatPrice, toDateKey } from '../utils/format';

interface OrderHistoryModalProps {
  tableSessionId: number;
  tableNumber: string;
  onClose: () => void;
}

/**
 * 테이블의 과거 주문 내역 모달. (US-A09)
 * 시간 역순 정렬 + 날짜 필터링 제공.
 */
function OrderHistoryModal({ tableSessionId, tableNumber, onClose }: OrderHistoryModalProps) {
  const fetchHistory = useOrderStore((s) => s.fetchHistory);

  const [history, setHistory] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchHistory(tableSessionId)
      .then((result) => {
        if (active) {
          setHistory(result ?? []);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(extractErrorMessage(err, '과거 내역을 불러오지 못했습니다.'));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [fetchHistory, tableSessionId]);

  const filteredHistory = useMemo(() => {
    const sorted = [...history].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (!dateFilter) {
      return sorted;
    }
    return sorted.filter((order) => toDateKey(order.createdAt) === dateFilter);
  }, [history, dateFilter]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      data-testid="order-history-modal-overlay"
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-bold text-gray-900" data-testid="order-history-modal-title">
            테이블 {tableNumber} 과거 내역
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            data-testid="order-history-modal-close-button"
          >
            닫기
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-200 p-4">
          <label className="text-sm font-medium text-gray-700" htmlFor="history-date-filter">
            날짜 필터
          </label>
          <input
            id="history-date-filter"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm"
            data-testid="order-history-date-filter"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="text-sm text-blue-600 hover:underline"
              data-testid="order-history-clear-filter-button"
            >
              필터 해제
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4" data-testid="order-history-list">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <p className="text-sm text-red-500" data-testid="order-history-error">
              {error}
            </p>
          ) : filteredHistory.length === 0 ? (
            <p className="text-sm text-gray-500" data-testid="order-history-empty">
              과거 주문 내역이 없습니다.
            </p>
          ) : (
            <ul className="space-y-3">
              {filteredHistory.map((order) => (
                <li
                  key={order.id}
                  className="rounded-md border border-gray-200 p-3"
                  data-testid="order-history-item"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      주문 #{order.id}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-gray-500">
                    주문: {formatDateTime(order.createdAt)}
                  </p>
                  {order.completedAt && (
                    <p className="text-xs text-gray-500">
                      이용완료: {formatDateTime(order.completedAt)}
                    </p>
                  )}
                  <ul className="mt-2 text-sm text-gray-700">
                    {(order.items ?? []).map((item) => (
                      <li key={item.id} data-testid="order-history-item-line">
                        {item.menuName ?? `메뉴 #${item.menuId}`} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-right text-sm font-bold text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderHistoryModal;
