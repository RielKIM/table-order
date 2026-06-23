import type { OrderWithItems } from '@/shared/types';
import StatusBadge from './StatusBadge';
import { formatDateTime } from '../utils/format';

interface OrderPreviewProps {
  /** 테이블의 최신 주문. 주문이 없으면 null. */
  order: OrderWithItems | null;
}

/**
 * 테이블 카드 내부에 표시되는 최신 주문 미리보기.
 * 주문이 없으면 "주문 없음"을 표시한다. (US-A03 Scenario 2)
 */
function OrderPreview({ order }: OrderPreviewProps) {
  if (!order) {
    return (
      <p className="text-sm text-gray-400" data-testid="order-preview-empty">
        주문 없음
      </p>
    );
  }

  const items = order.items ?? [];
  const previewItems = items.slice(0, 2);
  const remaining = items.length - previewItems.length;

  return (
    <div className="space-y-1" data-testid="order-preview-content">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500" data-testid="order-preview-time">
          {formatDateTime(order.createdAt)}
        </span>
        <StatusBadge status={order.status} />
      </div>
      {previewItems.length > 0 ? (
        <ul className="text-sm text-gray-700">
          {previewItems.map((item) => (
            <li key={item.id} data-testid="order-preview-item">
              {item.menuName ?? `메뉴 #${item.menuId}`} × {item.quantity}
            </li>
          ))}
          {remaining > 0 && (
            <li className="text-xs text-gray-400" data-testid="order-preview-more">
              외 {remaining}건
            </li>
          )}
        </ul>
      ) : (
        <p className="text-sm text-gray-500" data-testid="order-preview-no-items">
          주문번호 #{order.id}
        </p>
      )}
    </div>
  );
}

export default OrderPreview;
