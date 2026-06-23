import { useEffect, useState } from 'react';
import type { OrderStatus, OrderWithItems } from '@/shared/types';
import { useOrderStore } from '@/shared/store/orderStore';
import api from '@/shared/services/api';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import StatusBadge from './StatusBadge';
import OrderHistoryModal from './OrderHistoryModal';
import { canTransitionTo, STATUS_LABEL } from '../utils/orderStatus';
import { extractErrorMessage, formatDateTime, formatPrice } from '../utils/format';

interface TableDetailModalProps {
  tableSessionId: number;
  tableNumber: string;
  onClose: () => void;
  /** 상태 변경/삭제/이용완료 후 대시보드 갱신을 위해 호출. */
  onChanged: () => void;
}

type ConfirmAction =
  | { type: 'delete'; orderId: number }
  | { type: 'complete' }
  | null;

/**
 * 테이블 전체 주문 상세 모달. (US-A05, US-A06, US-A07, US-A08)
 * - 주문별 상태 변경 (단방향)
 * - 주문 삭제 (확인 팝업)
 * - 이용 완료 (확인 팝업)
 * - 과거 내역 보기
 */
function TableDetailModal({ tableSessionId, tableNumber, onClose, onChanged }: TableDetailModalProps) {
  const currentOrders = useOrderStore((s) => s.currentOrders);
  const fetchCurrentOrders = useOrderStore((s) => s.fetchCurrentOrders);
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);
  const deleteOrder = useOrderStore((s) => s.deleteOrder);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const loadOrders = () => {
    setLoading(true);
    setError(null);
    return fetchCurrentOrders(tableSessionId)
      .catch((err: unknown) => {
        setError(extractErrorMessage(err, '주문 내역을 불러오지 못했습니다.'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableSessionId]);

  const refreshAfterMutation = async () => {
    await loadOrders();
    onChanged();
  };

  const handleStatusChange = async (orderId: number, target: OrderStatus) => {
    setActionError(null);
    setBusy(true);
    try {
      await updateOrderStatus(orderId, target);
      await refreshAfterMutation();
    } catch (err) {
      setActionError(extractErrorMessage(err, '상태 변경에 실패했습니다.'));
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) {
      return;
    }
    setActionError(null);
    setBusy(true);
    try {
      if (confirmAction.type === 'delete') {
        await deleteOrder(confirmAction.orderId);
      } else {
        // 이용 완료: 현재 세션 주문을 과거 이력으로 이동 (US-A08)
        await api.post(`/tables/${tableSessionId}/complete`);
      }
      const wasComplete = confirmAction.type === 'complete';
      setConfirmAction(null);
      await refreshAfterMutation();
      if (wasComplete) {
        onClose();
      }
    } catch (err) {
      setActionError(
        extractErrorMessage(
          err,
          confirmAction.type === 'delete' ? '주문 삭제에 실패했습니다.' : '이용 완료 처리에 실패했습니다.',
        ),
      );
      setConfirmAction(null);
    } finally {
      setBusy(false);
    }
  };

  const orders: OrderWithItems[] = currentOrders;
  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      data-testid="table-detail-modal-overlay"
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-bold text-gray-900" data-testid="table-detail-modal-title">
            테이블 {tableNumber} 주문 상세
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            data-testid="table-detail-close-button"
          >
            닫기
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4" data-testid="table-detail-order-list">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <p className="text-sm text-red-500" data-testid="table-detail-error">
              {error}
            </p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-gray-500" data-testid="table-detail-empty">
              현재 세션에 주문이 없습니다.
            </p>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => {
                const canPrepare = canTransitionTo(order.status, 'preparing');
                const canComplete = canTransitionTo(order.status, 'completed');
                return (
                  <li
                    key={order.id}
                    className="rounded-md border border-gray-200 p-3"
                    data-testid="order-detail-card"
                    data-order-id={order.id}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        주문 #{order.id}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</p>
                    <ul className="mt-2 text-sm text-gray-700">
                      {(order.items ?? []).map((item) => (
                        <li
                          key={item.id}
                          className="flex justify-between"
                          data-testid="order-detail-item"
                        >
                          <span>
                            {item.menuName ?? `메뉴 #${item.menuId}`} × {item.quantity}
                          </span>
                          <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-right text-sm font-bold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={!canPrepare || busy}
                        onClick={() => handleStatusChange(order.id, 'preparing')}
                        className="rounded-md bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-40"
                        data-testid="order-status-preparing-button"
                      >
                        {STATUS_LABEL.preparing}
                      </button>
                      <button
                        type="button"
                        disabled={!canComplete || busy}
                        onClick={() => handleStatusChange(order.id, 'completed')}
                        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                        data-testid="order-status-completed-button"
                      >
                        {STATUS_LABEL.completed}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirmAction({ type: 'delete', orderId: order.id })}
                        className="ml-auto rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-40"
                        data-testid="order-delete-button"
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {actionError && (
            <p className="mt-3 text-sm text-red-500" data-testid="table-detail-action-error">
              {actionError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 p-4">
          <span className="text-sm font-semibold text-gray-900" data-testid="table-detail-total">
            총 주문액 {formatPrice(totalAmount)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              data-testid="table-detail-history-button"
            >
              과거 내역
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmAction({ type: 'complete' })}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              data-testid="table-detail-complete-button"
            >
              이용 완료
            </button>
          </div>
        </div>
      </div>

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.type === 'delete' ? '주문 삭제' : '테이블 이용 완료'}
          message={
            confirmAction.type === 'delete'
              ? '이 주문을 삭제하시겠습니까? 삭제 후 총 주문액이 재계산됩니다.'
              : '이 테이블을 이용 완료 처리하시겠습니까? 현재 주문이 과거 이력으로 이동합니다.'
          }
          confirmText="확인"
          cancelText="취소"
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {historyOpen && (
        <OrderHistoryModal
          tableSessionId={tableSessionId}
          tableNumber={tableNumber}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  );
}

export default TableDetailModal;
