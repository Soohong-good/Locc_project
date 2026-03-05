import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import { useLogout } from '@/hooks/useAuth'

const navItems = [
  { to: '/admin', label: '대시보드', end: true },
  { to: '/admin/notices', label: '공지사항' },
  { to: '/admin/sermons', label: '설교' },
  { to: '/admin/users', label: '회원 관리' },
]

/**
 * 관리자 레이아웃
 * - 좌측 사이드바 + 우측 콘텐츠
 * - PrivateRoute(adminOnly) 내부에서 사용
 */
const AdminLayout = () => {
  const { user } = useAuthStore()
  const { mutate: logout } = useLogout()

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* 사이드바 */}
      <aside className="w-56 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        {/* 로고 */}
        <div className="px-5 py-4 border-b border-gray-700">
          <p className="text-xs text-gray-500 mb-0.5">관리자</p>
          <p className="text-sm font-semibold text-white">그리스도사랑교회</p>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* 하단 유저 정보 */}
        <div className="px-5 py-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 truncate">{user?.name}</p>
          <button
            onClick={() => logout()}
            className="mt-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* 콘텐츠 영역 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
