import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenuStore } from '@/shared/store/menuStore';
import { useCartStore } from '@/shared/store/cartStore';
import MenuCard from '@/shared/components/MenuCard';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import CategoryTabs from '@/apps/customer/components/CategoryTabs';
import MenuDetailModal from '@/apps/customer/components/MenuDetailModal';
import type { Menu } from '@/shared/types';

/** 메뉴 화면 (US-C03, US-C04) — 카테고리 탭 + 그리드 + 장바구니 진입 */
function MenuScreen() {
  const navigate = useNavigate();

  const menus = useMenuStore((s) => s.menus);
  const categories = useMenuStore((s) => s.categories);
  const loading = useMenuStore((s) => s.loading);
  const error = useMenuStore((s) => s.error);
  const fetchMenus = useMenuStore((s) => s.fetchMenus);

  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const [detailMenu, setDetailMenu] = useState<Menu | null>(null);

  // 최초 진입 시 전체 메뉴 로드
  useEffect(() => {
    void fetchMenus();
  }, [fetchMenus]);

  // 카테고리 로드 후 첫 번째 카테고리 자동 선택 (US-C03 Scenario 1)
  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const visibleMenus = useMemo(() => {
    if (!activeCategory) return menus;
    return menus.filter((menu) => menu.category === activeCategory);
  }, [menus, activeCategory]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const handleAdd = (menu: Menu) => {
    addItem(menu);
    setDetailMenu(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-24">
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">메뉴</h1>
        </div>
        <CategoryTabs
          categories={categories}
          selected={activeCategory}
          onSelect={setActiveCategory}
        />
      </header>

      <main className="flex-1 p-4">
        {loading && menus.length === 0 ? (
          <LoadingSpinner label="메뉴를 불러오는 중..." />
        ) : error ? (
          <p data-testid="menu-screen-error" className="py-8 text-center text-sm text-red-600">
            {error}
          </p>
        ) : visibleMenus.length === 0 ? (
          <p data-testid="menu-screen-empty" className="py-8 text-center text-sm text-gray-500">
            표시할 메뉴가 없습니다.
          </p>
        ) : (
          <div
            data-testid="menu-grid"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            {visibleMenus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onAdd={handleAdd}
                onSelect={setDetailMenu}
              />
            ))}
          </div>
        )}
      </main>

      {/* 장바구니 진입 버튼 (하단 고정) */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white p-3">
        <button
          type="button"
          data-testid="menu-screen-cart-button"
          className="relative min-h-[44px] w-full rounded-md bg-blue-600 px-4 text-base font-medium text-white hover:bg-blue-700"
          onClick={() => navigate('/cart')}
        >
          장바구니 보기
          {cartCount > 0 && (
            <span
              data-testid="menu-screen-cart-count"
              className="ml-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-white px-2 text-sm font-bold text-blue-600"
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <MenuDetailModal
        menu={detailMenu}
        onClose={() => setDetailMenu(null)}
        onAddToCart={handleAdd}
      />
    </div>
  );
}

export default MenuScreen;
