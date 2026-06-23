import { MenuModel } from '../../models/menuModel';
import type { CreateMenuInput, UpdateMenuInput } from '../../models/menuModel';
import type { Menu } from '../../types';
import { MenuNotFoundError } from '../../shared/errors';

// 메뉴 관리 비즈니스 로직 (BR-04: Soft Delete)
export const MenuService = {
  // 고객/관리자용 메뉴 목록 조회 (isActive=true, displayOrder 정렬)
  async getMenus(category?: string): Promise<Menu[]> {
    return MenuModel.findAll(category);
  },

  // 메뉴 상세 조회
  async getMenuById(id: number): Promise<Menu> {
    const menu = await MenuModel.findById(id);
    if (!menu) {
      throw new MenuNotFoundError();
    }
    return menu;
  },

  // 메뉴 등록: displayOrder = 카테고리 내 최대값 + 1
  async createMenu(input: CreateMenuInput): Promise<Menu> {
    const maxOrder = await MenuModel.maxDisplayOrder(input.category);
    return MenuModel.create(input, maxOrder + 1);
  },

  // 메뉴 수정
  async updateMenu(id: number, input: UpdateMenuInput): Promise<Menu> {
    const updated = await MenuModel.update(id, input);
    if (!updated) {
      throw new MenuNotFoundError();
    }
    return updated;
  },

  // 메뉴 삭제 (Soft Delete: isActive=false)
  async deleteMenu(id: number): Promise<void> {
    const deleted = await MenuModel.softDelete(id);
    if (!deleted) {
      throw new MenuNotFoundError();
    }
  },

  // 메뉴 순서 변경 (displayOrder 일괄 업데이트)
  async reorderMenus(orders: { id: number; displayOrder: number }[]): Promise<Menu[]> {
    const updated: Menu[] = [];
    for (const { id, displayOrder } of orders) {
      const menu = await MenuModel.update(id, { displayOrder });
      if (!menu) {
        throw new MenuNotFoundError(`메뉴(${id})를 찾을 수 없습니다`);
      }
      updated.push(menu);
    }
    return updated;
  },
};
