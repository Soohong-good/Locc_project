import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useAuthStore from '@/stores/authStore'
import { useLogout } from '@/hooks/useAuth'

// ── 아이콘 ────────────────────────────────────────────────────────────────

const Icon = ({ path, className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={path} />
  </svg>
)

const ICONS = {
  dashboard:    'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
  posts:        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  sermon:       'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
  notice:       'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  bulletin:     'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  gallery:      'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  users:        'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  help:         'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  facility:     'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  popup:        'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
  youtube:      'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  home:         'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  menu:         'M4 6h16M4 12h16M4 18h16',
  close:        'M6 18L18 6M6 6l12 12',
}

const SectionLabel = ({ label }) => (
  <p className="px-3 pt-5 pb-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
    {label}
  </p>
)

const NavItem = ({ to, label, iconPath, end = false, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
        isActive
          ? 'bg-blue-600 text-white font-medium'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`
    }
  >
    <Icon path={iconPath} />
    {label}
  </NavLink>
)

const POST_CHILDREN = [
  { to: '/admin/sermons',   label: '설교',    iconPath: ICONS.sermon },
  { to: '/admin/notices',   label: '공지사항', iconPath: ICONS.notice },
  { to: '/admin/bulletins', label: '주보',    iconPath: ICONS.bulletin },
  { to: '/admin/gallery',   label: '갤러리',  iconPath: ICONS.gallery },
]

const POST_PATHS = POST_CHILDREN.map((c) => c.to)

const NavGroup = ({ label, iconPath, children, defaultOpen, onChildClick }) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
          defaultOpen
            ? 'text-white font-medium bg-gray-800'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
      >
        <Icon path={iconPath} />
        <span className="flex-1 text-left">{label}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-0.5 ml-3 pl-3 border-l border-gray-700 space-y-0.5">
          {children.map(({ to, label: childLabel, iconPath: childIcon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onChildClick}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'text-blue-400 font-medium'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon path={childIcon} className="w-3.5 h-3.5" />
              {childLabel}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 관리자 레이아웃 ───────────────────────────────────────────────────────

const AdminLayout = () => {
  const { user } = useAuthStore()
  const { mutate: logout } = useLogout()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isInPostGroup = POST_PATHS.some((p) => location.pathname.startsWith(p))

  // 라우트 변경 시 모바일 사이드바 닫기
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const closeSidebar = () => setSidebarOpen(false)

  const sidebarContent = (
    <>
      {/* 로고 */}
      <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-widest">관리자</p>
          <p className="text-sm font-semibold text-white">그리스도사랑교회</p>
        </div>
        {/* 모바일 닫기 버튼 */}
        <button
          onClick={closeSidebar}
          className="lg:hidden p-1 text-gray-400 hover:text-white"
        >
          <Icon path={ICONS.close} className="w-5 h-5" />
        </button>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <NavItem to="/admin" label="대시보드" iconPath={ICONS.dashboard} end onClick={closeSidebar} />

        <SectionLabel label="콘텐츠" />
        <div className="space-y-0.5">
          <NavGroup
            label="게시물"
            iconPath={ICONS.posts}
            defaultOpen={isInPostGroup}
            onChildClick={closeSidebar}
          >
            {POST_CHILDREN}
          </NavGroup>
        </div>

        <SectionLabel label="운영" />
        <div className="space-y-0.5">
          <NavItem to="/admin/users"         label="회원 관리"      iconPath={ICONS.users}    onClick={closeSidebar} />
          <NavItem to="/admin/help-requests"  label="도움문의"       iconPath={ICONS.help}     onClick={closeSidebar} />
          <NavItem to="/admin/applications"   label="시설·차량 신청" iconPath={ICONS.facility} onClick={closeSidebar} />
        </div>

        <SectionLabel label="설정" />
        <div className="space-y-0.5">
          <NavItem to="/admin/popups"  label="팝업 관리"    iconPath={ICONS.popup}   onClick={closeSidebar} />
          <NavItem to="/admin/youtube" label="YouTube 관리" iconPath={ICONS.youtube} onClick={closeSidebar} />
        </div>

        <div className="border-t border-gray-700 mt-4 mb-2" />
        <Link
          to="/"
          onClick={closeSidebar}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Icon path={ICONS.home} />
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
    </>
  )

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* ── 데스크탑 사이드바 (lg 이상 항상 표시) ── */}
      <aside className="hidden lg:flex w-56 bg-gray-900 text-gray-300 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* ── 모바일 사이드바 오버레이 ── */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={closeSidebar}
        />
      )}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-gray-900 text-gray-300 flex flex-col z-50
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {sidebarContent}
      </aside>

      {/* ── 콘텐츠 영역 ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* 모바일 상단 바 */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Icon path={ICONS.menu} className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-gray-800">그리스도사랑교회 관리자</span>
        </div>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
