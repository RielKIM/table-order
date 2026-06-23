import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';

interface NavItem {
  to: string;
  label: string;
  testId: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin/dashboard', label: '대시보드', testId: 'sidebar-nav-dashboard' },
  { to: '/admin/menus', label: '메뉴 관리', testId: 'sidebar-nav-menus' },
];

/**
 * 관리자 앱 좌측 네비게이션.
 * 대시보드 / 메뉴 관리 이동 및 로그아웃 제공.
 */
function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside
      className="flex h-full w-56 flex-col justify-between border-r border-gray-200 bg-white p-4"
      data-testid="sidebar-container"
    >
      <div>
        <h1 className="mb-6 text-xl font-bold text-gray-900" data-testid="sidebar-title">
          테이블오더
        </h1>
        <nav className="flex flex-col gap-1" data-testid="sidebar-nav">
          {NAV_ITEMS.map((navItem) => (
            <NavLink
              key={navItem.to}
              to={navItem.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              data-testid={navItem.testId}
            >
              {navItem.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-gray-200 pt-4">
        {user && (
          <p className="mb-2 truncate text-xs text-gray-500" data-testid="sidebar-user">
            {user.username}
          </p>
        )}
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          data-testid="sidebar-logout-button"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
