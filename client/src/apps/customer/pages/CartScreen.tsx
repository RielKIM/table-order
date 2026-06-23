import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/shared/store/cartStore';
import { useOrderStore } from '@/shared/store/orderStore';
import { useTableSessionStore } from '@/shared/store/tableSessionStore';
import CartItem from '@/shared/components/CartItem';
import ConfirmDialog from '@/shared/components/ConfirmDialog';

function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

/** 장바구니 화면 (US-C05 ~ US-C09) */
function CartScreen() {
  const navigate = useNavigate();

  const items = useCartStore((s) => s.items);
  const totalAmount = useCartStore((s) => s.totalAmount);
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const createOrder = useOrderStore((s) => s.createOrder);
  const ordering = useOrderStore((s) => s.loading);

  const tableSession = useTableSessionStore((s) => s.tableSession);

  const [orderError, setOrderError] = useState<string | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const isEmpty = items.length === 0;

  const handleOrder = async () => {
    setOrderError(null);
    if (isEmpty) return;
    if (!tableSession) {
      setOrderError('테이블 세션이 유효하지 않습니다. 다시 시도해주세요.');
      return;
    }
    try {
      const order = await createOrder(tableSession.id, items);
      clearCart();
      // 주문 확인 화면으로 이동 (US-C09)
      navigate('/order-confirmation', { state: { orderId: order.id } });
    } catch (error) {
      const message = error instanceof Error ? error.message : '주문에 실패했습니다.';
      setOrderError(message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          data-testid="cart-back-button"
          className="min-h-[44px] min-w-[44px] text-sm text-gray-600"
          onClick={() => navigate('/menu')}
          aria-label="메뉴로 돌아가기"
        >
          ← 메뉴
        </button>
        <h1 className="text-lg font-bold text-gray-900">장바구니</h1>
        <button
          type="button"
          data-testid="cart-clear-button"
          className="min-h-[44px] min-w-[44px] text-sm text-red-600 disabled:opacity-40"
          onClick={() => setClearDialogOpen(true)}
          disabled={isEmpty}
        >
          전체 비우기
        </button>
      </header>

      <main className="flex-1 px-4">
        {isEmpty ? (
          <p data-testid="cart-empty" className="py-16 text-center text-sm text-gray-500">
            장바구니가 비어 있습니다.
          </p>
        ) : (
          <div data-testid="cart-item-list">
            {items.map((item) => (
              <CartItem
                key={item.menu.id}
                item={item}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}

        {orderError && (
          <p data-testid="cart-order-error" className="mt-4 text-sm text-red-600">
            {orderError}
          </p>
        )}
      </main>

      {/* 총액 + 주문 버튼 (하단 고정) */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-base text-gray-600">총 금액</span>
          <span data-testid="cart-total-amount" className="text-xl font-bold text-gray-900">
            {formatPrice(totalAmount)}
          </span>
        </div>
        <button
          type="button"
          data-testid="cart-order-button"
          className="min-h-[44px] w-full rounded-md bg-blue-600 px-4 text-base font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={handleOrder}
          disabled={isEmpty || ordering}
        >
          {ordering ? '주문 중...' : '주문하기'}
        </button>
      </div>

      <ConfirmDialog
        open={clearDialogOpen}
        title="장바구니 비우기"
        message="장바구니의 모든 항목을 삭제하시겠습니까?"
        confirmLabel="비우기"
        destructive
        onConfirm={() => {
          clearCart();
          setClearDialogOpen(false);
        }}
        onCancel={() => setClearDialogOpen(false)}
      />
    </div>
  );
}

export default CartScreen;
