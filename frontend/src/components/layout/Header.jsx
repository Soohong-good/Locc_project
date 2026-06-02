import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import useAuthStore from '@/stores/authStore'
import { useLogout } from '@/hooks/useAuth'
import { getPendingCount } from '@/api/users'

/**
 * 투명 헤더 라우트: 이 경로에서는 최상단에서 투명+흰 글씨,
 * 스크롤 시 흰 배경으로 전환됩니다.
 */
const TRANSPARENT_ROUTES = ['/', '/template']

const NAV_MENUS = [
  { label: '복음 말씀', href: '/salvation' },
  {
    label: '그리스도사랑교회',
    minWidth: '210px',
    children: [
      { href: '/church/about',         label: '교회소개' },
      { href: '/church/confession',    label: '신앙고백' },
      { href: '/church/first-visit',   label: '처음 교회에 방문하신 분' },
      { href: '/church/worship-guide', label: '예배 안내' },
      { href: '/church/staff',         label: '섬기는 분들' },
      { href: '/church/mission',       label: '선교' },
      { href: '/church/contact',       label: '오시는 길' },
    ],
  },
  {
    label: '예배',
    children: [
      { href: '/worship/newyear',                 label: '송구영신예배' },
      { href: '/worship/sermon/sunday-morning',   label: '주일오전예배' },
      { href: '/worship/sermon/sunday-afternoon', label: '주일오후예배' },
      { href: '/worship/sermon/weekday',          label: '수요예배·금요기도회' },
      { href: '/worship/training-intro',          label: '훈련소개' },
      { href: '/worship/sermon/training-message', label: '훈련 메시지' },
    ],
  },
  {
    label: '공지 및 자료실',
    minWidth: '210px',
    children: [
      { href: '/notices',       label: '공지' },
      { href: '/bulletin',      label: '주보' },
      { href: '/praise-sheets', label: '찬양악보' },
      { href: '/applications',  label: '신청양식' },
    ],
  },
  {
    label: '부서',
    children: [
      { href: '/department/nursery',      label: '태영아부' },
      { href: '/department/preschool',    label: '유아유치부' },
      { href: '/department/children',     label: '초등부' },
      { href: '/department/youth',        label: '중고등부' },
      { href: '/department/young-adults', label: '대학청년부' },
      { href: '/department/newcomers',    label: '새가족부' },
      { href: '/department/multiethnic',  label: '다민족부' },
      { href: '/department/healing',      label: '치유부' },
    ],
  },
  { label: '훈련 신청', href: '/training' },
]

// ── 공통: 드롭다운 아이템 ────────────────────────────
const NavItem = ({ href, label, onClick, isActive }) => {
  if (!href) {
    return (
      <span className="block px-5 py-2.5 text-lg text-slate-400 cursor-not-allowed select-none" title="준비 중">
        {label}
      </span>
    )
  }
  return (
    <Link
      to={href}
      onClick={onClick}
      className={`block px-5 py-2.5 text-lg transition-colors duration-150
        ${isActive ? 'text-slate-900 font-medium bg-slate-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
    >
      {label}
    </Link>
  )
}

const ChevronDown = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

// ── 데스크탑 드롭다운 ─────────────────────────────────
const DesktopDropdown = ({ label, children, minWidth, alignRight, extraBottom, glass }) => {
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)

  const handleEnter = () => { clearTimeout(timerRef.current); setOpen(true) }
  const handleLeave = () => { timerRef.current = setTimeout(() => setOpen(false), 150) }

  return (
    <div
      className={`nav-dropdown${alignRight ? ' align-right' : ''}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        className={`transition-colors duration-150 font-medium text-lg flex items-center gap-1.5 bg-transparent border-0 cursor-pointer py-1
          ${glass ? 'text-white/90 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
      >
        {label}
        <ChevronDown />
      </button>
      <div
        className="nav-dropdown-menu"
        style={{
          ...(minWidth ? { minWidth } : {}),
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          transform: open ? 'translateY(0)' : 'translateY(-6px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease, visibility 0.25s',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {children.map(({ href, label: l }) => (
          <NavItem key={l} href={href} label={l} />
        ))}
        {extraBottom}
      </div>
    </div>
  )
}

// ── 모바일 아코디언 ──────────────────────────────────
const MobileDropdown = ({ label, children, onClose }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 text-slate-700 hover:text-slate-900 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-medium text-lg">{label}</span>
        <ChevronDown />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pb-2 bg-slate-50">
          {children.map(({ href, label: l }) => (
            <NavItem key={l} href={href} label={l} onClick={onClose} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 메인 헤더 ─────────────────────────────────────────
const Header = () => {
  const { user, isAdmin: isAdminFn } = useAuthStore()
  const { mutate: logout, isPending } = useLogout()
  const isAdmin = isAdminFn()
  const [mobileOpen, setMobileOpen] = useState(false)

  // 관리자 전용: 승인 대기 회원 수 (1분 주기 polling)
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['admin', 'users', 'pending', 'count'],
    queryFn: getPendingCount,
    enabled: isAdmin,
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  })
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  const isTransparent = TRANSPARENT_ROUTES.includes(location.pathname)
  // glass = 투명 라우트 + 스크롤 안 됨 + 모바일 메뉴 닫힌 상태
  const glass = isTransparent && !scrolled && !mobileOpen

  // 스크롤 감지 (항상 유지, glass 계산에 사용)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // 라우트 이동 시 현재 스크롤 위치 즉시 반영
    return () => window.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  // 라우트 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300
        ${glass
          ? 'bg-transparent border-b border-transparent'
          : 'bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm'}`}
    >
      <div className="w-full px-6 xl:px-12">
        <div className="flex items-center justify-between h-[95px]">

          {/* 로고 */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/logo.png"
              style={{
                width: '220px',
                height: 'auto',
                filter: glass ? 'brightness(0) invert(1)' : 'none',
                transition: 'filter 0.3s',
              }}
              alt="그리스도 사랑교회"
              className="block"
            />
          </Link>

          {/* 데스크탑 네비게이션 */}
          <div className="hidden xl:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              {NAV_MENUS.map((item) => {
                if (!item.children && !item.href) {
                  return (
                    <span key={item.label}
                      className="text-slate-400 font-medium text-lg cursor-not-allowed select-none"
                      title="준비 중">
                      {item.label}
                    </span>
                  )
                }
                if (item.children) {
                  return (
                    <DesktopDropdown
                      key={item.label}
                      label={item.label}
                      children={item.children}
                      minWidth={item.minWidth}
                      glass={glass}
                    />
                  )
                }
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`font-medium text-lg transition-colors duration-150
                      ${glass
                        ? (location.pathname === item.href ? 'text-white font-semibold' : 'text-white/90 hover:text-white')
                        : (location.pathname === item.href ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900')}`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* 인증 영역 */}
            <div className={`flex items-center gap-3 pl-4 border-l transition-colors duration-300
              ${glass ? 'border-white/30' : 'border-slate-200'}`}>
              {user ? (
                <DesktopDropdown
                  alignRight
                  glass={glass}
                  label={
                    <span className="flex items-center gap-2">
                      <span className="relative">
                        <span className={`w-7 h-7 rounded-full text-white text-xs flex items-center justify-center font-medium transition-colors
                          ${glass ? 'bg-white/20' : 'bg-slate-900'}`}>
                          {user.name?.charAt(0) ?? '?'}
                        </span>
                        {isAdmin && pendingCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-0.5 border-2 border-white shadow-sm">
                            {pendingCount > 9 ? '9+' : pendingCount}
                          </span>
                        )}
                      </span>
                      <span className={`text-lg font-medium transition-colors
                        ${glass ? 'text-white/90' : 'text-slate-700'}`}>
                        {user.name}
                        {isAdmin && (
                          <span className="ml-1.5 text-xs text-blue-400 font-medium">[관리자]</span>
                        )}
                      </span>
                    </span>
                  }
                  children={[
                    { href: '/mypage',      label: '마이페이지' },
                    { href: '/training/my', label: '내 신청내역' },
                    ...(isAdmin ? [{ href: '/admin', label: '관리자 대시보드' }] : []),
                  ]}
                  extraBottom={
                    <button
                      onClick={() => logout()}
                      disabled={isPending}
                      className="w-full text-left px-5 py-2.5 text-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors border-t border-slate-100 mt-1"
                    >
                      로그아웃
                    </button>
                  }
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className={`px-4 py-2 text-lg font-medium transition-colors
                      ${glass ? 'text-white/85 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    로그인
                  </Link>
                  <Link
                    to="/register"
                    className={`px-4 py-2 text-lg font-medium transition-colors
                      ${glass ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* 모바일 햄버거 */}
          <button
            className={`xl:hidden p-2 transition-colors hover:bg-black/5
              ${glass ? 'text-white' : 'text-slate-700 hover:text-slate-900'}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="메뉴 열기"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span className={`block h-0.5 bg-current transition-all duration-300 origin-center
                ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300
                ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 origin-center
                ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        <div
          className={`xl:hidden overflow-hidden transition-all duration-300 ease-out border-t border-slate-100
            ${mobileOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <nav className="overflow-y-auto py-2 bg-white" style={{ maxHeight: 'calc(80vh - 0px)' }}>
            {NAV_MENUS.map((item) => {
              if (!item.children && !item.href) {
                return (
                  <span key={item.label}
                    className="block px-5 py-4 text-lg text-slate-400 cursor-not-allowed select-none border-b border-slate-100">
                    {item.label}
                  </span>
                )
              }
              if (item.children) {
                return (
                  <MobileDropdown
                    key={item.label}
                    label={item.label}
                    children={item.children}
                    onClose={() => setMobileOpen(false)}
                  />
                )
              }
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-5 py-4 text-lg font-medium border-b border-slate-100 transition-colors
                    ${location.pathname === item.href
                      ? 'text-slate-900 bg-slate-50'
                      : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {item.label}
                </Link>
              )
            })}

            {/* 모바일 인증 */}
            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50">
              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 pb-3 mb-2 border-b border-slate-200">
                    <span className="relative">
                      <span className="w-8 h-8 rounded-full bg-slate-900 text-white text-sm flex items-center justify-center font-medium">
                        {user.name?.charAt(0) ?? '?'}
                      </span>
                      {isAdmin && pendingCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-0.5 border-2 border-white shadow-sm">
                          {pendingCount > 9 ? '9+' : pendingCount}
                        </span>
                      )}
                    </span>
                    <div>
                      <p className="text-lg font-medium text-slate-900">{user.name}</p>
                      {isAdmin && <p className="text-xs text-blue-500">관리자</p>}
                    </div>
                  </div>
                  {[
                    { to: '/mypage',      label: '마이페이지' },
                    { to: '/training/my', label: '내 신청내역' },
                    ...(isAdmin ? [{ to: '/admin', label: '관리자 대시보드' }] : []),
                  ].map(({ to, label }) => (
                    <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                      className="block py-2.5 text-lg text-slate-700 hover:text-slate-900 transition-colors">
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { logout(); setMobileOpen(false) }}
                    disabled={isPending}
                    className="block w-full text-left py-2.5 text-lg text-red-500 hover:text-red-600 transition-colors mt-1 pt-3 border-t border-slate-200"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="py-3 text-center text-lg font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors">
                    로그인
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}
                    className="py-3 text-center text-lg font-medium bg-slate-900 text-white hover:bg-slate-700 transition-colors">
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
