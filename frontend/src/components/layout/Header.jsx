import { Link, NavLink } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import { useLogout } from '@/hooks/useAuth'

/**
 * 공통 헤더
 * - 비로그인: 로그인 버튼
 * - 로그인: 이름 표시 + 로그아웃
 * - ADMIN: 관리자 페이지 링크 추가
 */
const Header = () => {
  const { user } = useAuthStore()
  const { mutate: logout, isPending } = useLogout()
  const isAdmin = user?.role === 'ROLE_ADMIN'

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link
          to="/"
          className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors"
        >
          그리스도사랑교회
        </Link>

        {/* 네비게이션 */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <NavLink
            to="/sermons"
            className={({ isActive }) =>
              isActive ? 'text-blue-600 font-medium' : 'hover:text-gray-900 transition-colors'
            }
          >
            설교
          </NavLink>
          <NavLink
            to="/notices"
            className={({ isActive }) =>
              isActive ? 'text-blue-600 font-medium' : 'hover:text-gray-900 transition-colors'
            }
          >
            공지사항
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-600 font-medium'
                  : 'hover:text-gray-900 transition-colors'
              }
            >
              관리자
            </NavLink>
          )}
        </nav>

        {/* 인증 영역 */}
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-gray-600 hidden sm:inline">
                {user.name}
              </span>
              <button
                onClick={() => logout()}
                disabled={isPending}
                className="text-gray-400 hover:text-red-500 transition-colors text-xs"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors text-xs font-medium"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
