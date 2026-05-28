import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { submitHelpRequest } from '@/api/helpRequests'

const BG = '#1e3a5f'

// ── 사이트맵 데이터 ───────────────────────────────────
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
      { to: '/worship/sermon/weekday',          label: '수요·금요예배' },
      { to: '/worship/training-intro',          label: '훈련소개' },
    ],
  },
  {
    title: '공지 및 자료',
    links: [
      { to: '/notices',      label: '공지사항' },
      { to: '/bulletin',     label: '주보' },
      { to: '/applications', label: '신청양식' },
    ],
  },
  {
    title: '부서',
    links: [
      { to: '/department/nursery',      label: '태영아부' },
      { to: '/department/preschool',    label: '유아유치부' },
      { to: '/department/children',     label: '초등부' },
      { to: '/department/youth',        label: '중고등부' },
      { to: '/department/young-adults', label: '대학청년부' },
    ],
  },
]

// ── 문의 모달 ─────────────────────────────────────────
const ContactModal = ({ onClose }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', content: '' })
  const [submitted, setSubmitted] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: submitHelpRequest,
    onSuccess: () => setSubmitted(true),
  })

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  const handleSubmit = (e) => {
    e.preventDefault()
    mutate(form)
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none"
        >×</button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✉️</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">문의가 접수되었습니다</h3>
            <p className="text-sm text-slate-500 mb-6">담당자가 확인 후 연락드리겠습니다.</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
            >닫기</button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-slate-900 mb-1">문의하기</h3>
            <p className="text-sm text-slate-500 mb-6">궁금한 점을 남겨주시면 답변드리겠습니다.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">이름 <span className="text-red-400">*</span></label>
                  <input
                    name="name" value={form.name} onChange={handleChange} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder="홍길동"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">연락처</label>
                  <input
                    name="phone" value={form.phone} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">이메일</label>
                <input
                  name="email" type="email" value={form.email} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">문의 내용 <span className="text-red-400">*</span></label>
                <textarea
                  name="content" value={form.content} onChange={handleChange} required
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                  placeholder="문의 내용을 입력해주세요."
                />
              </div>
              <button
                type="submit" disabled={isPending}
                className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {isPending ? '전송 중...' : '문의 보내기'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ── 사이트맵 드랍업 패널 ──────────────────────────────
const SitemapDropup = ({ onClose }) => (
  <div
    className="fixed inset-0 z-[100]"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div
      className="absolute bottom-0 left-0 right-0 py-10 px-6 shadow-2xl"
      style={{ background: '#152233', borderTop: '1px solid rgba(255,255,255,0.1)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
            SITEMAP
          </span>
          <button
            onClick={onClose}
            className="text-sm hover:text-white transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >✕ 닫기</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {SITEMAP.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      onClick={onClose}
                      className="text-sm hover:text-white transition-colors"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
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
  </div>
)

// ── 메인 푸터 ─────────────────────────────────────────
const Footer = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [sitemapOpen, setSitemapOpen] = useState(false)

  return (
    <>
      {modalOpen   && <ContactModal   onClose={() => setModalOpen(false)} />}
      {sitemapOpen && <SitemapDropup  onClose={() => setSitemapOpen(false)} />}

      <footer style={{ background: BG, color: 'rgba(255,255,255,0.6)', position: 'relative', zIndex: 1 }}>

        {/* 상단 미니 링크바 */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <button
              onClick={() => setModalOpen(true)}
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs"
              style={{ color: 'inherit' }}
            >문의</button>
            <span className="mx-2 opacity-30">／</span>
            <span>이메일 무단수집금지</span>
            <span className="mx-2 opacity-30">／</span>
            <button
              onClick={() => setSitemapOpen(true)}
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs"
              style={{ color: 'inherit' }}
            >사이트맵</button>
          </div>
        </div>

        {/* 메인 로우 */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-0">

            {/* 로고 */}
            <div className="flex-shrink-0 md:mr-10">
              <Link to="/">
                <img
                  src="/logo.png"
                  alt="그리스도사랑교회"
                  className="h-14 w-auto brightness-0 invert opacity-80"
                />
              </Link>
            </div>

            {/* 주소 · 연락처 */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <p>대구광역시 동구 안심로55길 59</p>
                <p>
                  Tel.&nbsp;
                  <a href="tel:053-962-8948" className="hover:text-white transition-colors">053-962-8948</a>
                  <span className="mx-1 opacity-40">,</span>
                  <a href="tel:053-961-0931" className="hover:text-white transition-colors">053-961-0931</a>
                  <span className="mx-2 opacity-40">|</span>
                  Fax.&nbsp;053-961-0862
                </p>
                <p>
                  <a href="mailto:magamedia8948@gmail.com" className="hover:text-white transition-colors text-xs">
                    magamedia8948@gmail.com
                  </a>
                </p>
              </div>
              <Link
                to="/church/contact"
                className="flex-shrink-0 px-4 py-1.5 text-sm rounded transition-colors"
                style={{
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'rgba(255,255,255,0.7)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                }}
              >
                오시는 길
              </Link>
            </div>

            {/* 유튜브 아이콘 */}
            <div className="flex items-center gap-3 md:ml-8">
              <a
                href="https://www.youtube.com/@%EA%B7%B8%EB%A6%AC%EC%8A%A4%EB%8F%84%EC%82%AC%EB%9E%91%EA%B5%90%ED%9A%8C-k4z"
                target="_blank"
                rel="noreferrer"
                title="유튜브 채널"
                className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FF0000'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>

          </div>
        </div>

        {/* 하단 카피라이트 */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="max-w-6xl mx-auto px-6 py-4 text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Copyright &copy; 2026 그리스도사랑교회. All Rights Reserved.
          </div>
        </div>

      </footer>
    </>
  )
}

export default Footer
