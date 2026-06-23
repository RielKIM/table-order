import { MenuService } from './menuService';
import { MenuModel } from '../../models/menuModel';
import { MenuNotFoundError } from '../../shared/errors';
import type { Menu } from '../../types';

jest.mock('../../models/menuModel');

const mockedMenuModel = MenuModel as jest.Mocked<typeof MenuModel>;

function buildMenu(overrides: Partial<Menu> = {}): Menu {
  return {
    id: 1,
    name: 'Coffee',
    price: 5000,
    category: 'drinks',
    description: null,
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('MenuService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMenuById', () => {
    it('존재하는 메뉴를 반환한다', async () => {
      const menu = buildMenu();
      mockedMenuModel.findById.mockResolvedValue(menu);

      await expect(MenuService.getMenuById(1)).resolves.toBe(menu);
    });

    it('메뉴가 없으면 MenuNotFoundError 를 던진다', async () => {
      mockedMenuModel.findById.mockResolvedValue(null);

      await expect(MenuService.getMenuById(1)).rejects.toBeInstanceOf(MenuNotFoundError);
    });
  });

  describe('createMenu - displayOrder 계산', () => {
    it('카테고리 최대 displayOrder + 1 로 메뉴를 생성한다', async () => {
      mockedMenuModel.maxDisplayOrder.mockResolvedValue(3);
      const created = buildMenu({ id: 2, displayOrder: 4 });
      mockedMenuModel.create.mockResolvedValue(created);

      const input = { name: 'Tea', price: 3000, category: 'drinks' };
      const result = await MenuService.createMenu(input);

      expect(mockedMenuModel.maxDisplayOrder).toHaveBeenCalledWith('drinks');
      expect(mockedMenuModel.create).toHaveBeenCalledWith(input, 4);
      expect(result).toBe(created);
    });
  });

  describe('updateMenu', () => {
    it('존재하지 않는 메뉴 수정 시 MenuNotFoundError 를 던진다', async () => {
      mockedMenuModel.update.mockResolvedValue(null);

      await expect(MenuService.updateMenu(1, { name: 'New' })).rejects.toBeInstanceOf(
        MenuNotFoundError
      );
    });
  });

  describe('deleteMenu - Soft Delete', () => {
    it('soft delete 가 성공하면 정상 종료한다', async () => {
      mockedMenuModel.softDelete.mockResolvedValue(true);

      await expect(MenuService.deleteMenu(1)).resolves.toBeUndefined();
      expect(mockedMenuModel.softDelete).toHaveBeenCalledWith(1);
    });

    it('대상 메뉴가 없으면 MenuNotFoundError 를 던진다', async () => {
      mockedMenuModel.softDelete.mockResolvedValue(false);

      await expect(MenuService.deleteMenu(1)).rejects.toBeInstanceOf(MenuNotFoundError);
    });
  });

  describe('reorderMenus', () => {
    it('각 항목의 displayOrder 를 갱신한다', async () => {
      mockedMenuModel.update
        .mockResolvedValueOnce(buildMenu({ id: 1, displayOrder: 2 }))
        .mockResolvedValueOnce(buildMenu({ id: 2, displayOrder: 1 }));

      const result = await MenuService.reorderMenus([
        { id: 1, displayOrder: 2 },
        { id: 2, displayOrder: 1 },
      ]);

      expect(mockedMenuModel.update).toHaveBeenCalledWith(1, { displayOrder: 2 });
      expect(mockedMenuModel.update).toHaveBeenCalledWith(2, { displayOrder: 1 });
      expect(result).toHaveLength(2);
    });

    it('대상 메뉴가 없으면 MenuNotFoundError 를 던진다', async () => {
      mockedMenuModel.update.mockResolvedValue(null);

      await expect(
        MenuService.reorderMenus([{ id: 99, displayOrder: 1 }])
      ).rejects.toBeInstanceOf(MenuNotFoundError);
    });
  });
});
