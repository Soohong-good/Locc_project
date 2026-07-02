import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { List, X, CaretDown } from '@phosphor-icons/react'
import useAuthStore from '@/stores/authStore'
import { useLogout } from '@/hooks/useAuth'
import { getPendingCount } from '@/api/users'
import { DEPARTMENTS } from '@/constants/departments'

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
      { href: '/notices',  label: '공지' },
      { href: '/bulletin', label: '주보' },
    ],
  },
  {
    label: '부서',
    children: [
      ...DEPARTMENTS.map((d) => ({ href: `/department/${d.code}`, label: d.label })),
      { href: '/department/gallery', label: '갤러리' },
    ],
  },
  {
    label: '찬양',
    children: [
      { href: '/praise-sheets',  label: '찬양악보' },
      { href: '/praise/choir',   label: '찬양대' },
    ],
  },
  {
    label: '신청',
    children: [
      { href: '/training',     label: '훈련신청' },
      { href: '/applications', label: '기타신청' },
    ],
  },
]

// ── 데스크탑 드롭다운 ─────────────────────────────────
const DesktopDropdown = ({ label, children, minWidth, isActive }) => {
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)

  const handleEnter = () => { clearTimeout(timerRef.current); setOpen(true) }
  const handleLeave = () => { timerRef.current = setTimeout(() => setOpen(false), 150) }

  return (
    <div className="nav-dropdown" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        className={`flex items-center gap-1 text-[15px] transition-colors bg-transparent border-0 cursor-pointer py-1
          ${isActive ? 'font-bold text-[#171717]' : 'font-medium text-[#737373] hover:text-[#171717]'}`}
      >
        {label}
        <CaretDown size={12} weight="bold" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
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
          <Link key={l} to={href}>{l}</Link>
        ))}
      </div>
    </div>
  )
}

// ── 유저 드롭다운 (로그인 시) ──────────────────────────
const UserDropdown = ({ user, isAdmin, pendingCount, onLogout, isLoggingOut }) => {
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)

  const handleEnter = () => { clearTimeout(timerRef.current); setOpen(true) }
  const handleLeave = () => { timerRef.current = setTimeout(() => setOpen(false), 150) }

  return (
    <div className="nav-dropdown align-right" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        className="flex items-center gap-2 text-[15px] font-medium text-[#737373] hover:text-[#171717] transition-colors bg-transparent border-0 cursor-pointer py-1"
      >
        <span className="relative">
          <span className="w-7 h-7 rounded-full bg-[#171717] text-white text-xs flex items-center justify-center font-medium">
            {user.name?.charAt(0) ?? '?'}
          </span>
          {isAdmin && pendingCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-0.5">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </span>
        <span>{user.name}</span>
        <CaretDown size={12} weight="bold" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        className="nav-dropdown-menu"
        style={{
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          transform: open ? 'translateY(0)' : 'translateY(-6px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease, visibility 0.25s',
          pointerEvents: open ? 'auto' : 'none',
          minWidth: '160px',
        }}
      >
        <Link to="/mypage">마이페이지</Link>
        {isAdmin && <Link to="/admin">관리자 대시보드</Link>}
        <button onClick={onLogout} disabled={isLoggingOut}>
          {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
        </button>
      </div>
    </div>
  )
}

// ── 모바일 아코디언 ──────────────────────────────────
const MobileAccordion = ({ label, children, onClose }) => {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        className="w-full flex items-center justify-between py-4 text-2xl font-bold tracking-tight text-[#737373] hover:text-[#171717] transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
        <CaretDown size={16} weight="bold" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-96' : 'max-h-0'}`}>
        <div className="flex flex-col gap-1 pb-4 pl-4">
          {children.map(({ href, label: l }) => (
            <Link
              key={l}
              to={href}
              onClick={onClose}
              className="py-2 text-lg text-[#737373] hover:text-[#171717] transition-colors"
            >
              {l}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 메인 헤더 ─────────────────────────────────────────
export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, isAdmin: isAdminFn } = useAuthStore()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()
  const isAdmin = isAdminFn()

  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['admin', 'users', 'pending', 'count'],
    queryFn: getPendingCount,
    enabled: isAdmin,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  // overflow-x:hidden → clip 전환으로 sticky 헤더 정상 작동
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtml = html.style.overflowX
    const prevBody = body.style.overflowX
    html.style.overflowX = 'clip'
    body.style.overflowX = 'clip'
    return () => {
      html.style.overflowX = prevHtml
      body.style.overflowX = prevBody
    }
  }, [])

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E5E5] transition-all">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between border-x border-[#E5E5E5] bg-white/50">

        {/* 로고 */}
        <Link to="/" className="flex items-center group">
          <img
            src="/logo.png"
            alt="그리스도사랑교회"
            className="h-16 w-auto object-contain group-hover:opacity-80 transition-opacity duration-300"
          />
        </Link>

        {/* 데스크탑 nav + 인증 */}
        <div className="hidden lg:flex items-center gap-10 ml-auto">
          <nav className="flex items-center gap-10">
            {NAV_MENUS.map((item) => {
              if (item.children) {
                return (
                  <DesktopDropdown
                    key={item.label}
                    label={item.label}
                    children={item.children}
                    minWidth={item.minWidth}
                    isActive={item.children.some(c => isActive(c.href))}
                  />
                )
              }
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`text-[15px] transition-colors ${
                    isActive(item.href)
                      ? 'font-bold text-[#171717]'
                      : 'font-medium text-[#737373] hover:text-[#171717]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* 인증 */}
          {user ? (
            <UserDropdown
              user={user}
              isAdmin={isAdmin}
              pendingCount={pendingCount}
              onLogout={() => logout()}
              isLoggingOut={isLoggingOut}
            />
          ) : (
            <div className="flex items-center gap-6">
              <Link
                to="/login"
                className="text-xs font-bold tracking-[0.1em] uppercase text-[#A3A3A3] hover:text-[#171717] transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-xs font-bold tracking-[0.1em] uppercase bg-[#171717] text-white px-6 py-2.5 hover:bg-black transition-colors"
              >
                Join
              </Link>
            </div>
          )}
        </div>

        {/* 모바일 햄버거 */}
        <button className="lg:hidden text-[#171717]" onClick={() => setOpen(true)}>
          <List size={28} />
        </button>
      </div>

      {/* 모바일 메뉴 — header의 backdrop-blur(backdrop-filter)가 fixed 자손의 containing block을
          header 자신으로 바꿔버려서(Chrome 동작), header 내부에 두면 전체화면이 아니라
          header 높이(h-20)만큼만 렌더링되는 버그가 있었음. createPortal로 body에 직접 그려서 회피 */}
      {open && createPortal(
        <div className="fixed inset-0 z-[100] bg-white flex flex-col p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" onClick={() => setOpen(false)}>
              <img src="/logo.png" alt="그리스도사랑교회" className="h-10 w-auto object-contain" />
            </Link>
            <button onClick={() => setOpen(false)}><X size={28} /></button>
          </div>

          <nav className="flex flex-col divide-y divide-[#F5F5F5]">
            {NAV_MENUS.map((item) => {
              if (item.children) {
                return (
                  <MobileAccordion
                    key={item.label}
                    label={item.label}
                    children={item.children}
                    onClose={() => setOpen(false)}
                  />
                )
              }
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`py-4 text-2xl font-bold tracking-tight ${isActive(item.href) ? 'text-[#171717]' : 'text-[#737373]'}`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* 모바일 인증 */}
          <div className="mt-auto pt-8 flex gap-4">
            {user ? (
              <div className="w-full space-y-2">
                <div className="flex items-center gap-3 pb-4 border-b border-[#E5E5E5]">
                  <span className="w-9 h-9 rounded-full bg-[#171717] text-white text-sm flex items-center justify-center font-medium">
                    {user.name?.charAt(0) ?? '?'}
                  </span>
                  <div>
                    <p className="font-bold text-[#171717]">{user.name}</p>
                    {isAdmin && <p className="text-xs text-[#737373]">관리자</p>}
                  </div>
                </div>
                {[
                  { to: '/mypage', label: '마이페이지' },
                  ...(isAdmin ? [{ to: '/admin', label: '관리자 대시보드' }] : []),
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-lg font-medium text-[#737373] hover:text-[#171717] transition-colors"
                  >
                    {label}
                  </Link>
                ))}
                <button
                  onClick={() => { logout(); setOpen(false) }}
                  disabled={isLoggingOut}
                  className="block w-full text-left py-3 text-lg font-medium text-red-500 hover:text-red-600 transition-colors border-t border-[#E5E5E5] mt-2 pt-4"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex-1 text-center py-4 border border-[#E5E5E5] text-sm font-bold uppercase tracking-widest hover:bg-[#F4F2EA] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center py-4 bg-[#171717] text-white text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </header>
  )
}
