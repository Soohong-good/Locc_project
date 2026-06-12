import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { List, X, CaretDown } from '@phosphor-icons/react'

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

export default function TemplHeader() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // index.css의 html/body overflow-x:hidden이 sticky를 깨뜨리는 것을 방지
  // overflow-x:clip은 hidden과 달리 새 스크롤 컨테이너를 생성하지 않아 sticky 정상 작동
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

        {/* 데스크탑 nav + 로그인/가입 — 오른쪽 정렬 */}
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

          {/* 로그인/가입 */}
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
        </div>

        {/* 모바일 햄버거 */}
        <button className="lg:hidden text-[#171717]" onClick={() => setOpen(true)}>
          <List size={28} />
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col p-8 overflow-y-auto">
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
          <div className="mt-auto pt-8 flex gap-4">
            <Link
              to="/login"
              className="flex-1 text-center py-4 border border-[#E5E5E5] text-sm font-bold uppercase tracking-widest"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="flex-1 text-center py-4 bg-[#171717] text-white text-sm font-bold uppercase tracking-widest"
              onClick={() => setOpen(false)}
            >
              Join
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
