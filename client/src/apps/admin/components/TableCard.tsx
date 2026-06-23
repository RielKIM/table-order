import type { TableDashboardItem } from '@/shared/types';
import OrderPreview from './OrderPreview';
import { formatPrice } from '../utils/format';

interface TableCardProps {
  item: TableDashboardItem;
  onClick: () => void;
  /** 신규 주문 수신 시 true. 색상/애니메이션으로 강조한다. (US-A04) */
  isNew: boolean;
}

/**
 * 대시보드의 테이블별 카드.
 * 테이블번호, 총 주문액, 최신 주문 미리보기를 표시한다. (US-A03)
 * 신규 주문 수신 시 강조 효과를 적용한다. (US-A04)
 */
function TableCard({ item, onClick, isNew }: TableCardProps) {
  const highlightClass = isNew
    ? 'border-blue-500 ring-2 ring-blue-400 animate-pulse bg-blue-50'
    : 'border-gray-200 bg-white';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col gap-3 rounded-lg border p-4 text-left shadow-sm transition hover:shadow-md ${highlightClass}`}
      data-testid="table-card-button"
      data-table-session-id={item.tableSessionId}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-900" data-testid="table-card-number">
          테이블 {item.tableNumber}
        </span>
        {isNew && (
          <span
            className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white"
            data-testid="table-card-new-badge"
          >
            신규
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-sm text-gray-500">총 주문액</span>
        <span className="text-base font-bold text-gray-900" data-testid="table-card-total">
          {formatPrice(item.totalAmount)}
        </span>
      </div>

      <OrderPreview order={item.latestOrder ?? null} />
    </button>
  );
}

export default TableCard;
