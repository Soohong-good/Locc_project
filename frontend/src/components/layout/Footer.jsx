import { Link } from 'react-router-dom'

const QUICK_LINKS = [
  { to: '/church/about',    label: '교회소개' },
  { to: '/salvation',       label: '복음말씀' },
  { to: '/worship/sermon/sunday-morning', label: '주일오전예배' },
  { to: '/notices',         label: '공지사항' },
  { to: '/training',        label: '훈련 신청' },
]

const Footer = () => (
  <footer className="bg-slate-900 text-slate-400 relative" style={{ zIndex: 1 }}>
    {/* 메인 영역 */}
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

        {/* 교회 소개 */}
        <div className="lg:col-span-2">
          <Link to="/" className="inline-block mb-3">
            <img src="/logo.png" alt="그리스도 사랑교회" className="h-20 w-auto brightness-0 invert opacity-80" />
          </Link>
          <p className="text-xs font-medium tracking-[0.25em] text-slate-500 uppercase mb-5">
            Love of Christ Church
          </p>
          <p className="text-sm leading-relaxed text-slate-400">
            하나님을 경배하고 이웃을 사랑하는 교회<br />
            여러분을 환영합니다.
          </p>
        </div>

        {/* 바로가기 */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 tracking-[0.15em] uppercase mb-5">바로가기</h4>
          <ul className="space-y-3">
            {QUICK_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 연락처 */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 tracking-[0.15em] uppercase mb-5">연락처</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5 text-slate-400">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>대구광역시 동구 안심로55길 59</span>
            </li>
            <li className="flex items-center gap-2.5 text-slate-400">
              <svg className="w-4 h-4 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href="tel:053-962-8948" className="hover:text-white transition-colors">053-962-8948</a>
            </li>
            <li className="flex items-center gap-2.5 text-slate-400">
              <svg className="w-4 h-4 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:magamedia8948@gmail.com" className="hover:text-white transition-colors text-xs break-all">
                magamedia8948@gmail.com
              </a>
            </li>
          </ul>

          {/* 유튜브 링크 */}
          <a
            href="https://www.youtube.com/@%EA%B7%B8%EB%A6%AC%EC%8A%A4%EB%8F%84%EC%82%AC%EB%9E%91%EA%B5%90%ED%9A%8C-k4z"
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 mt-6 text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            유튜브 채널
          </a>
        </div>
      </div>
    </div>

    {/* 하단 카피라이트 */}
    <div className="border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-slate-600">&copy; 2026 그리스도 사랑교회. All rights reserved.</p>
        <Link to="/church/contact" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
          오시는 길
        </Link>
      </div>
    </div>
  </footer>
)

export default Footer
