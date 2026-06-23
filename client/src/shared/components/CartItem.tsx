import type { CartItem as CartItemType } from '@/shared/types';

/** 장바구니 항목 — 이름, 단가, 수량 +/-, 삭제 */
interface CartItemProps {
  item: CartItemType;
  /** 수량 증가 */
  onIncrease: (menuId: number) => void;
  /** 수량 감소 (1에서 감소 시 삭제) */
  onDecrease: (menuId: number) => void;
  /** 항목 삭제 */
  onRemove: (menuId: number) => void;
}

function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

function CartItem({ item, onIncrease, onDecrease, onRemove }: CartItemProps) {
  const { menu, quantity } = item;
  const subtotal = menu.price * quantity;

  return (
    <div
      data-testid={`cart-item-${menu.id}`}
      className="flex items-center gap-3 border-b border-gray-100 py-3"
    >
      <div className="min-w-0 flex-1">
        <h3
          data-testid={`cart-item-name-${menu.id}`}
          className="truncate text-base font-medium text-gray-900"
        >
          {menu.name}
        </h3>
        <p
          data-testid={`cart-item-unit-price-${menu.id}`}
          className="text-sm text-gray-500"
        >
          {formatPrice(menu.price)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          data-testid={`cart-item-decrease-${menu.id}`}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-gray-300 text-lg font-bold text-gray-700 hover:bg-gray-50"
          onClick={() => onDecrease(menu.id)}
          aria-label={`${menu.name} 수량 감소`}
        >
          −
        </button>
        <span
          data-testid={`cart-item-quantity-${menu.id}`}
          className="min-w-[2rem] text-center text-base font-medium"
        >
          {quantity}
        </span>
        <button
          type="button"
          data-testid={`cart-item-increase-${menu.id}`}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-gray-300 text-lg font-bold text-gray-700 hover:bg-gray-50"
          onClick={() => onIncrease(menu.id)}
          aria-label={`${menu.name} 수량 증가`}
        >
          +
        </button>
      </div>

      <div className="w-24 text-right">
        <p
          data-testid={`cart-item-subtotal-${menu.id}`}
          className="text-base font-semibold text-gray-900"
        >
          {formatPrice(subtotal)}
        </p>
      </div>

      <button
        type="button"
        data-testid={`cart-item-remove-${menu.id}`}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-sm text-red-600 hover:bg-red-50"
        onClick={() => onRemove(menu.id)}
        aria-label={`${menu.name} 삭제`}
      >
        삭제
      </button>
    </div>
  );
}

export default CartItem;
