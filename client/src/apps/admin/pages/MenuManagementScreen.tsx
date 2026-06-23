import { useEffect, useMemo, useState } from 'react';
import type { Menu } from '@/shared/types';
import { useMenuStore } from '@/shared/store/menuStore';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import MenuFormModal from '../components/MenuFormModal';
import { extractErrorMessage, formatPrice } from '../utils/format';

const ALL_CATEGORIES = '__all__';

/**
 * 메뉴 관리 화면. (US-A10 ~ US-A14)
 * 메뉴 목록 테이블 + 등록/수정/삭제. 카테고리 필터 제공.
 */
function MenuManagementScreen() {
  const menus = useMenuStore((s) => s.menus);
  const fetchMenus = useMenuStore((s) => s.fetchMenus);
  const deleteMenu = useMenuStore((s) => s.deleteMenu);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);

  const [formOpen, setFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadMenus = () => {
    setLoading(true);
    setError(null);
    return fetchMenus()
      .catch((err: unknown) => {
        setError(extractErrorMessage(err, '메뉴를 불러오지 못했습니다.'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    void loadMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    menus.forEach((menu) => set.add(menu.category));
    return Array.from(set).sort();
  }, [menus]);

  const visibleMenus = useMemo(() => {
    const filtered =
      categoryFilter === ALL_CATEGORIES
        ? menus
        : menus.filter((menu) => menu.category === categoryFilter);
    return [...filtered].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [menus, categoryFilter]);

  const openCreate = () => {
    setEditingMenu(null);
    setFormOpen(true);
  };

  const openEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setFormOpen(true);
  };

  const handleFormSaved = async () => {
    setFormOpen(false);
    setEditingMenu(null);
    await loadMenus();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }
    setActionError(null);
    setDeleting(true);
    try {
      await deleteMenu(deleteTarget.id);
      setDeleteTarget(null);
      await loadMenus();
    } catch (err) {
      setActionError(extractErrorMessage(err, '메뉴 삭제에 실패했습니다.'));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6" data-testid="menu-management-screen-container">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900" data-testid="menu-management-title">
          메뉴 관리
        </h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          data-testid="menu-management-create-button"
        >
          메뉴 등록
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="menu-category-filter">
          카테고리
        </label>
        <select
          id="menu-category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm"
          data-testid="menu-management-category-filter"
        >
          <option value={ALL_CATEGORIES}>전체</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {actionError && (
        <p className="mb-3 text-sm text-red-500" data-testid="menu-management-action-error">
          {actionError}
        </p>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-sm text-red-500" data-testid="menu-management-error">
          {error}
        </p>
      ) : visibleMenus.length === 0 ? (
        <p className="text-sm text-gray-500" data-testid="menu-management-empty">
          등록된 메뉴가 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm" data-testid="menu-management-table">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 font-medium">순서</th>
                <th className="px-4 py-2 font-medium">메뉴명</th>
                <th className="px-4 py-2 font-medium">카테고리</th>
                <th className="px-4 py-2 font-medium">가격</th>
                <th className="px-4 py-2 font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              {visibleMenus.map((menu) => (
                <tr
                  key={menu.id}
                  className="border-t border-gray-100"
                  data-testid="menu-management-row"
                  data-menu-id={menu.id}
                >
                  <td className="px-4 py-2 text-gray-500">{menu.displayOrder}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{menu.name}</td>
                  <td className="px-4 py-2 text-gray-700">{menu.category}</td>
                  <td className="px-4 py-2 text-gray-700">{formatPrice(menu.price)}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(menu)}
                        className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                        data-testid="menu-management-edit-button"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(menu)}
                        className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                        data-testid="menu-management-delete-button"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <MenuFormModal
          menu={editingMenu}
          onClose={() => {
            setFormOpen(false);
            setEditingMenu(null);
          }}
          onSaved={handleFormSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="메뉴 삭제"
          message={`'${deleteTarget.name}' 메뉴를 삭제하시겠습니까? 고객 화면에서 더 이상 표시되지 않습니다.`}
          confirmText={deleting ? '삭제 중...' : '확인'}
          cancelText="취소"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default MenuManagementScreen;
