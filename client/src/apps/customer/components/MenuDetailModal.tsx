import type { Menu } from '@/shared/types';

/** 메뉴 상세 모달 (US-C04) — 이름, 가격, 설명, 이미지 + 장바구니 추가 */
interface MenuDetailModalProps {
  menu: Menu | null;
  onClose: () => void;
  onAddToCart: (menu: Menu) => void;
}

function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

function MenuDetailModal({ menu, onClose, onAddToCart }: MenuDetailModalProps) {
  if (!menu) return null;

  return (
    <div
      data-testid="menu-detail-overlay"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="menu-detail-title"
      onClick={onClose}
    >
      <div
        data-testid="menu-detail-panel"
        className="w-full max-w-md overflow-hidden rounded-t-2xl bg-white sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-video w-full bg-gray-100">
          {menu.imageUrl ? (
            <img
              src={menu.imageUrl}
              alt={menu.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
              이미지 없음
            </div>
          )}
        </div>

        <div className="p-5">
          <h2
            id="menu-detail-title"
            data-testid="menu-detail-name"
            className="text-xl font-bold text-gray-900"
          >
            {menu.name}
          </h2>
          <p data-testid="menu-detail-price" className="mt-1 text-lg font-semibold text-blue-600">
            {formatPrice(menu.price)}
          </p>
          {menu.description && (
            <p data-testid="menu-detail-description" className="mt-3 text-sm text-gray-600">
              {menu.description}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              data-testid="menu-detail-close"
              className="min-h-[44px] flex-1 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              닫기
            </button>
            <button
              type="button"
              data-testid="menu-detail-add"
              className="min-h-[44px] flex-1 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
              onClick={() => onAddToCart(menu)}
            >
              장바구니 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuDetailModal;
