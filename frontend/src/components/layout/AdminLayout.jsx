import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '@/stores/authStore'
import { useLogout } from '@/hooks/useAuth'

// 일반 링크 항목
const flatItems = [
  { to: '/admin',          label: '대시보드',    end: true },
  { to: '/admin/users',    label: '회원 관리' },
  { to: '/admin/popups',   label: '팝업 관리' },
  { to: '/admin/youtube',  label: 'YouTube 관리' },
  { to: '/admin/help-requests', label: '도움문의' },
  { to: '/admin/applications',  label: '시설·차량 신청' },
]

// 드롭다운 그룹 — "게시물" 항목
const postGroupChildren = [
  { to: '/admin/sermons',  label: '설교' },
  { to: '/admin/notices',  label: '공지사항' },
  { to: '/admin/bulletins',label: '주보' },
  { to: '/admin/gallery',  label: '갤러리' },
]

// 게시물 그룹에 속하는 경로 prefix
const POST_PATHS = postGroupChildren.map((c) => c.to)

// ── 드롭다운 그룹 컴포넌트 ─────────────────────────────────────────────
const NavGroup = ({ label, children, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      {/* 그룹 헤더 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
          defaultOpen
            ? 'text-white font-medium bg-gray-800'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
      >
        <span>{label}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 하위 항목 */}
      {open && (
        <div className="mt-0.5 ml-3 pl-3 border-l border-gray-700 space-y-0.5">
          {children.map(({ to, label: childLabel }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'text-blue-400 font-medium'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {childLabel}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * 관리자 레이아웃
 * - 좌측 사이드바 + 우측 콘텐츠
 * - PrivateRoute(adminOnly) 내부에서 사용
 */
const AdminLayout = () => {
  const { user } = useAuthStore()
  const { mutate: logout } = useLogout()
  const location = useLocation()

  // 현재 경로가 게시물 그룹에 속하면 기본 열림
  const isInPostGroup = POST_PATHS.some((p) => location.pathname.startsWith(p))

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
          {/* 대시보드 */}
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            대시보드
          </NavLink>

          {/* 게시물 드롭다운 그룹 */}
          <NavGroup
            label="게시물"
            children={postGroupChildren}
            defaultOpen={isInPostGroup}
          />

          {/* 나머지 일반 항목 (대시보드 제외) */}
          {flatItems.slice(1).map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
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

          {/* 구분선 */}
          <div className="border-t border-gray-700 my-2" />

          {/* 홈페이지 바로가기 */}
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h4a1 1 0 001-1v-3h2v3a1 1 0 001 1h4a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            홈페이지 메인
          </Link>
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
