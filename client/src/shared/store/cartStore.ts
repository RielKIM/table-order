/**
 * cartStore — 장바구니 (US-C05 ~ US-C08)
 *
 * - localStorage 'cart' 동기화 (새로고침 시 유지)
 * - totalAmount 자동 계산
 * - 수량이 0 이하가 되면 항목 제거
 */
import { create } from 'zustand';
import type { CartItem, Menu } from '@/shared/types';

const CART_STORAGE_KEY = 'cart';

interface CartState {
  items: CartItem[];
  totalAmount: number;

  addItem: (menu: Menu, quantity?: number) => void;
  removeItem: (menuId: number) => void;
  updateQuantity: (menuId: number, quantity: number) => void;
  increaseQuantity: (menuId: number) => void;
  /** 1에서 감소 시 항목 제거 */
  decreaseQuantity: (menuId: number) => void;
  clearCart: () => void;
}

function computeTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.menu.price * item.quantity, 0);
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && item.menu && item.quantity > 0);
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // 저장 실패는 무시 (용량 초과 등)
  }
}

/** items 변경을 적용하고 totalAmount 재계산 + localStorage 동기화 */
function applyItems(items: CartItem[]): Pick<CartState, 'items' | 'totalAmount'> {
  persistCart(items);
  return { items, totalAmount: computeTotal(items) };
}

const initialItems = loadCart();

export const useCartStore = create<CartState>((set, get) => ({
  items: initialItems,
  totalAmount: computeTotal(initialItems),

  addItem: (menu, quantity = 1) => {
    const items = get().items;
    const existing = items.find((item) => item.menu.id === menu.id);
    let next: CartItem[];
    if (existing) {
      next = items.map((item) =>
        item.menu.id === menu.id
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      );
    } else {
      next = [...items, { menu, quantity }];
    }
    set(applyItems(next));
  },

  removeItem: (menuId) => {
    const next = get().items.filter((item) => item.menu.id !== menuId);
    set(applyItems(next));
  },

  updateQuantity: (menuId, quantity) => {
    let next: CartItem[];
    if (quantity <= 0) {
      next = get().items.filter((item) => item.menu.id !== menuId);
    } else {
      next = get().items.map((item) =>
        item.menu.id === menuId ? { ...item, quantity } : item,
      );
    }
    set(applyItems(next));
  },

  increaseQuantity: (menuId) => {
    const next = get().items.map((item) =>
      item.menu.id === menuId ? { ...item, quantity: item.quantity + 1 } : item,
    );
    set(applyItems(next));
  },

  decreaseQuantity: (menuId) => {
    const next = get()
      .items.map((item) =>
        item.menu.id === menuId ? { ...item, quantity: item.quantity - 1 } : item,
      )
      .filter((item) => item.quantity > 0);
    set(applyItems(next));
  },

  clearCart: () => {
    set(applyItems([]));
  },
}));
