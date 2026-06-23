import type { OrderStatus } from '@/shared/types';
import { STATUS_LABEL } from '../utils/orderStatus';

interface StatusBadgeProps {
  status: OrderStatus;
}

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: 'bg-gray-200 text-gray-800',
  preparing: 'bg-yellow-200 text-yellow-900',
  completed: 'bg-green-200 text-green-900',
};

/**
 * 주문 상태를 색상 뱃지로 표시한다.
 */
function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}
      data-testid="status-badge-label"
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export default StatusBadge;
