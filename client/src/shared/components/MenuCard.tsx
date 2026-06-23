import type { Menu } from '@/shared/types';

/** 메뉴 카드 — 이미지, 이름, 가격, 추가 버튼 */
interface MenuCardProps {
  menu: Menu;
  /** 장바구니 추가 */
  onAdd: (menu: Menu) => void;
  /** 카드 클릭(상세 모달 열기 등) — 선택적 */
  onSelect?: (menu: Menu) => void;
}

function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

function MenuCard({ menu, onAdd, onSelect }: MenuCardProps) {
  return (
    <div
      data-testid={`menu-card-${menu.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
    >
      <button
        type="button"
        data-testid={`menu-card-select-${menu.id}`}
        className="block w-full text-left"
        onClick={() => onSelect?.(menu)}
        aria-label={`${menu.name} 상세 보기`}
      >
        <div className="aspect-square w-full bg-gray-100">
          {menu.imageUrl ? (
            <img
              src={menu.imageUrl}
              alt={menu.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              data-testid={`menu-card-noimage-${menu.id}`}
              className="flex h-full w-full items-center justify-center text-sm text-gray-400"
            >
              이미지 없음
            </div>
          )}
        </div>
        <div className="p-3">
          <h3
            data-testid={`menu-card-name-${menu.id}`}
            className="truncate text-base font-semibold text-gray-900"
          >
            {menu.name}
          </h3>
          <p
            data-testid={`menu-card-price-${menu.id}`}
            className="mt-1 text-sm font-medium text-gray-700"
          >
            {formatPrice(menu.price)}
          </p>
        </div>
      </button>
      <div className="mt-auto p-3 pt-0">
        <button
          type="button"
          data-testid={`menu-card-add-${menu.id}`}
          className="min-h-[44px] w-full rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
          onClick={() => onAdd(menu)}
          aria-label={`${menu.name} 장바구니에 추가`}
        >
          추가
        </button>
      </div>
    </div>
  );
}

export default MenuCard;
