/**
 * menuStore — 메뉴 목록/카테고리 (US-C03) + 관리자 메뉴 CRUD (US-A10~A14)
 */
import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDelete } from '@/shared/services/api';
import type { Menu } from '@/shared/types';

/** 메뉴 등록/수정 입력 (서버 계약) */
export interface MenuInput {
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface MenuState {
  menus: Menu[];
  categories: string[];
  loading: boolean;
  error: string | null;
  /** 현재 선택된 카테고리 (undefined = 전체) */
  selectedCategory?: string;

  fetchMenus: (category?: string) => Promise<void>;
  setSelectedCategory: (category?: string) => void;

  // --- 관리자 CRUD ---
  createMenu: (input: MenuInput) => Promise<Menu>;
  updateMenu: (id: number, input: MenuInput) => Promise<Menu>;
  deleteMenu: (id: number) => Promise<void>;
}

/** 메뉴 목록에서 카테고리 추출 (displayOrder 기준 정렬 유지) */
function extractCategories(menus: Menu[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const menu of menus) {
    if (!seen.has(menu.category)) {
      seen.add(menu.category);
      ordered.push(menu.category);
    }
  }
  return ordered;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menus: [],
  categories: [],
  loading: false,
  error: null,
  selectedCategory: undefined,

  fetchMenus: async (category) => {
    set({ loading: true, error: null });
    try {
      const query = category ? `?category=${encodeURIComponent(category)}` : '';
      const menus = await apiGet<Menu[]>(`/menus${query}`);
      const sorted = [...menus].sort((a, b) => a.displayOrder - b.displayOrder);

      // 전체 조회 시에만 카테고리 목록 갱신 (카테고리 필터 조회 시 탭 유지)
      const categories = category ? get().categories : extractCategories(sorted);

      set({
        menus: sorted,
        categories: categories.length > 0 ? categories : extractCategories(sorted),
        loading: false,
        selectedCategory: category,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '메뉴를 불러오지 못했습니다.';
      set({ loading: false, error: message });
    }
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  // -----------------------------------------------------------------------
  // 관리자 메뉴 CRUD
  // -----------------------------------------------------------------------
  createMenu: async (input) => {
    const created = await apiPost<Menu>('/menus', input);
    set((state) => {
      const next = [...state.menus, created].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      );
      return { menus: next };
    });
    return created;
  },

  updateMenu: async (id, input) => {
    const updated = await apiPut<Menu>(`/menus/${id}`, input);
    set((state) => {
      const next = state.menus
        .map((menu) => (menu.id === id ? updated : menu))
        .sort((a, b) => a.displayOrder - b.displayOrder);
      return { menus: next };
    });
    return updated;
  },

  deleteMenu: async (id) => {
    await apiDelete<void>(`/menus/${id}`);
    set((state) => ({
      menus: state.menus.filter((menu) => menu.id !== id),
    }));
  },
}));
