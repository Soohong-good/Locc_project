import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { YoutubeLogo, InstagramLogo, ArrowUp, MapTrifold } from '@phosphor-icons/react'

const SITEMAP = [
  {
    title: '그리스도사랑교회',
    links: [
      { to: '/church/about',         label: '교회소개' },
      { to: '/church/confession',    label: '신앙고백' },
      { to: '/church/worship-guide', label: '예배 안내' },
      { to: '/church/staff',         label: '섬기는 분들' },
      { to: '/church/mission',       label: '선교' },
      { to: '/church/contact',       label: '오시는 길' },
    ],
  },
  {
    title: '예배',
    links: [
      { to: '/worship/sermon/sunday-morning',   label: '주일오전예배' },
      { to: '/worship/sermon/sunday-afternoon', label: '주일오후예배' },
      { to: '/worship/sermon/weekday',          label: '수요예배·금요기도회' },
      { to: '/worship/sermon/training-message', label: '훈련 메시지' },
      { to: '/worship/sermon/retreat',          label: '수련회/특강 말씀' },
    ],
  },
  {
    title: '자료실',
    links: [
      { to: '/notices',       label: '공지사항' },
      { to: '/bulletin',      label: '주보' },
      { to: '/praise-sheets', label: '찬양악보' },
    ],
  },
  {
    title: '신청',
    links: [
      { to: '/training',     label: '훈련신청' },
      { to: '/applications', label: '기타신청' },
    ],
  },
]

export default function Footer() {
  const [sitemapOpen, setSitemapOpen] = useState(false)
  const sitemapRef = useRef(null)
  const [sitemapHeight, setSitemapHeight] = useState(0)

  useEffect(() => {
    if (sitemapRef.current) {
      setSitemapHeight(sitemapRef.current.scrollHeight)
    }
  }, [])

  const handleLinkClick = () => setSitemapOpen(false)

  return (
    <footer className="bg-white border-t border-[#E5E5E5]" style={{ position: 'relative', zIndex: 1 }}>
      <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5]">

        {/* 사이트맵 — 슬라이드 */}
        <div
          ref={sitemapRef}
          style={{
            maxHeight: sitemapOpen ? sitemapHeight : 0,
            overflow: 'hidden',
            transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="px-8 md:px-16 lg:px-24 py-12 border-b border-[#E5E5E5]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {SITEMAP.map((col) => (
                <div key={col.title}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">
                    {col.title}
                  </p>
                  <ul className="space-y-2">
                    {col.links.map(({ to, label }) => (
                      <li key={to}>
                        <Link
                          to={to}
                          onClick={handleLinkClick}
                          className="text-sm text-[#737373] hover:text-[#171717] transition-colors"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 로고 + SNS + 사이트맵 버튼 */}
        <div className="p-8 md:p-16 lg:p-24 border-b border-[#E5E5E5] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
          <div className="flex flex-col gap-8">
            <Link to="/">
              <img
                src="/logo.png"
                alt="그리스도사랑교회"
                className="h-12 w-auto object-contain hover:opacity-80 transition-opacity duration-300"
              />
            </Link>
            <div className="flex flex-wrap gap-8 text-sm font-bold tracking-[0.1em] uppercase text-[#171717]">
              <Link to="/church/contact" className="hover:text-[#737373] transition-colors">문의</Link>
              <span className="text-[#E5E5E5]">/</span>
              <span className="cursor-default text-[#737373]">이메일 무단수집거부</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* 사이트맵 토글 버튼 */}
            <button
              onClick={() => setSitemapOpen((v) => !v)}
              className={`flex items-center gap-2 h-12 px-5 border text-sm font-bold tracking-[0.1em] uppercase transition-all ${
                sitemapOpen
                  ? 'bg-[#171717] border-[#171717] text-white'
                  : 'border-[#E5E5E5] text-[#737373] hover:bg-[#171717] hover:border-[#171717] hover:text-white'
              }`}
              title="사이트맵"
            >
              <MapTrifold size={16} weight={sitemapOpen ? 'fill' : 'regular'} />
              <span>사이트맵</span>
              <ArrowUp
                size={14}
                className="transition-transform duration-300"
                style={{ transform: sitemapOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
              />
            </button>

            <a
              href="https://www.youtube.com/@%EA%B7%B8%EB%A6%AC%EC%8A%A4%EB%8F%84%EC%82%AC%EB%9E%91%EA%B5%90%ED%9A%8C-k4z"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:bg-[#171717] hover:border-[#171717] hover:text-white transition-all"
              title="유튜브 채널"
            >
              <YoutubeLogo size={20} weight="fill" />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:bg-[#171717] hover:border-[#171717] hover:text-white transition-all"
            >
              <InstagramLogo size={20} weight="fill" />
            </a>
          </div>
        </div>

        {/* 주소 + 카피라이트 */}
        <div className="px-8 md:px-16 lg:px-24 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-50/50">
          <div className="text-xs text-[#737373] font-light tracking-wide space-y-1">
            <p>대구광역시 동구 안심로55길 59</p>
            <p>
              Tel.&nbsp;
              <a href="tel:053-962-8948" className="hover:text-[#171717] transition-colors">053-962-8948</a>
              <span className="mx-2 text-[#C8C8C8]">|</span>
              <a href="tel:053-961-0931" className="hover:text-[#171717] transition-colors">053-961-0931</a>
              <span className="mx-2 text-[#C8C8C8]">|</span>
              Fax. 053-961-0862
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-xs text-[#737373] font-light tracking-wide">
              © 2026 Christ Love Church. All Rights Reserved.
            </p>
            <p className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-[0.2em]">Sola Scriptura</p>
          </div>
        </div>

      </div>
    </footer>
  )
}
