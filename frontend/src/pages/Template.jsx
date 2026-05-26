import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useQuery } from '@tanstack/react-query'
import { getLatestNotices } from '@/api/notices'
import { getLatestSermons, getNewYearVideo, getLatestSundayMorning2 } from '@/api/sermons'
import { getOpenTrainings } from '@/api/training'
import { SkeletonRow } from '@/components/ui/SkeletonCard'
import useScrollAnimation from '@/hooks/useScrollAnimation'

// ─────────────────────────────────────────────
// 영상 모달
// ─────────────────────────────────────────────
const VideoModal = ({ videoId, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-slate-300 transition-colors z-10"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="w-full max-w-6xl aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Hero 섹션
// ─────────────────────────────────────────────
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
    <div
      className="absolute inset-0 z-0"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1517837016564-bfc3ffd67455?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
    </div>
    <div className="absolute inset-0 bg-black/70 z-10" />
    <div className="relative z-20 max-w-5xl w-full px-4 sm:px-6 py-12 sm:py-16 pb-20 sm:pb-24">
      <div className="text-center text-white">
        <div className="inline-block px-4 py-2 border border-white/30 mb-8 sm:mb-10 backdrop-blur-sm bg-white/10">
          <p className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase font-light">
            2026 Church Motto
          </p>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light leading-tight mb-8 sm:mb-10 tracking-tight px-2">
          여호와의 거룩한 이름을
          <br className="sm:hidden" />
          위함이라
        </h1>
        <p className="text-base sm:text-lg md:text-xl tracking-wide sm:tracking-wider mb-10 sm:mb-12 text-slate-200">
          에스겔 36:22
        </p>
        <div className="w-12 sm:w-16 h-px bg-white/40 mx-auto mb-10 sm:mb-14" />
        <blockquote className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl leading-relaxed font-light max-w-4xl mx-auto mb-12 sm:mb-16 px-4">
          "그러므로 너는 이스라엘 족속에게 이르기를
          <br className="hidden sm:block" />
          주 여호와께서 이같이 말씀하시되
          <br className="hidden sm:block" />
          이스라엘 족속아 내가 이렇게 행함은
          <br className="hidden sm:block" />
          <span className="font-medium text-white">너희를 위함이 아니요</span>
          <br className="hidden sm:block" />
          너희가 들어간 그 이방 중에서
          <br className="hidden sm:block" />
          더럽힌 <span className="font-medium text-white">나의 거룩한 이름을 위함이라</span>"
        </blockquote>
        <a
          href="/salvation"
          className="group relative inline-flex items-center px-6 sm:px-10 py-3 sm:py-4 overflow-hidden text-white transition-all duration-300 ease-out border-2 border-white hover:text-slate-900 text-base sm:text-lg backdrop-blur-sm bg-white/10 hover:bg-white rounded-sm"
        >
          <span className="relative font-medium tracking-wide flex items-center">
            복음말씀
            <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  </section>
)

// ─────────────────────────────────────────────
// About 섹션
// ─────────────────────────────────────────────
const AboutSection = () => {
  const { ref, isVisible } = useScrollAnimation()
  return (
  <section id="about" className="py-20 sm:py-24 md:py-32 bg-slate-50 px-6">
    <div
      ref={ref}
      className={`max-w-4xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="mb-16 sm:mb-20">
        <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-3">About Church</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-slate-900 tracking-tight">
          그리스도 사랑교회의 예배
        </h2>
      </div>
      <div className="space-y-16">
        <div>
          <h3 className="text-2xl font-medium text-slate-900 mb-6">우리의 믿음</h3>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light">
            "하나님을 영화롭게 하며 그를 영원토록 즐거워하는 것"을<br />
            삶의 제일 되는 목적으로 삼은 성도들이 모여<br />
            영과 진리로 예배를 드립니다.
          </p>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light mt-6">
            우리는 교회의 여러 사역 중 예배를 가장 소중히 여기며,<br />
            살아계신 삼위일체 하나님을 경배하고 기도하며,<br />
            선포되는 강해 설교를 통해 하나님의 말씀을 듣습니다.
          </p>
        </div>
        <div className="space-y-12 pt-8">
          {[
            {
              ref: '이사야 43:7',
              lines: ['내 이름으로 불려지는 모든 자 곧', '내가 내 영광을 위하여 창조한 자를 오게 하라', '그를 내가 지었고 그를 내가 만들었느니라'],
            },
            {
              ref: '시편 16:11',
              lines: ['주께서 생명의 길을 내게 보이시리니', '주의 앞에는 충만한 기쁨이 있고', '주의 오른쪽에는 영원한 즐거움이 있나이다'],
            },
            {
              ref: '요한복음 4:23',
              lines: ['아버지께 참되게 예배하는 자들은', '영과 진리로 예배할 때가 오나니 곧 이 때라', '아버지께서는 자기에게 이렇게 예배하는 자들을 찾으시느니라'],
            },
          ].map(({ ref: r, lines }) => (
            <div key={r} className="border-l-4 border-slate-300 pl-8 py-2">
              <p className="text-sm text-slate-500 font-medium mb-3">{r}</p>
              <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-light">
                {lines.map((line, i) => (
                  <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
)
}

// ─────────────────────────────────────────────
// Sermon 섹션 (카테고리 전환 + 영상 모달)
// ─────────────────────────────────────────────
const SermonSection = () => {
  const { ref, isVisible } = useScrollAnimation()
  const [category, setCategory] = useState('newyear')
  const [modalVideoId, setModalVideoId] = useState(null)

  const { data: newYearData } = useQuery({
    queryKey: ['newyear', 'latest'],
    queryFn: getNewYearVideo,
    staleTime: 10 * 60 * 1000,
  })

  const { data: sundayData } = useQuery({
    queryKey: ['sermon', 'sunday-morning', 2, 'latest'],
    queryFn: getLatestSundayMorning2,
    staleTime: 5 * 60 * 1000,
  })

  const extractVideoId = (url) => {
    if (!url) return null
    try {
      const u = new URL(url)
      if (u.hostname === 'youtu.be') return u.pathname.slice(1)
      return u.searchParams.get('v') || null
    } catch {
      return null
    }
  }

  const latestSermon = sundayData?.latestSermon ?? null
  const hasLatestSermon =
    latestSermon && typeof latestSermon === 'object' && latestSermon.id
  const latestVideoId = hasLatestSermon ? extractVideoId(latestSermon.videoUrl) : null

  const newYearVideoId = newYearData?.latestVideoId ?? null
  const hasNewYear = !!newYearVideoId

  return (
    <>
      <section id="sermon" className="py-32 bg-slate-900 text-white px-6">
        <div
          ref={ref}
          className={`max-w-6xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* 헤더 */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-3">
              {category === 'sermon' ? "This Week's Message" : "New Year's Eve Service"}
            </p>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
              {category === 'sermon' ? '이번 주 설교' : '송구영신예배'}
            </h2>
            {/* 카테고리 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => setCategory('newyear')}
                className={`px-6 py-2.5 rounded-sm transition-all text-sm font-medium ${
                  category === 'newyear'
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                송구영신예배
              </button>
              <button
                onClick={() => setCategory('sermon')}
                className={`px-6 py-2.5 rounded-sm transition-all text-sm font-medium ${
                  category === 'sermon'
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                주일강단
              </button>
            </div>
          </div>

          {/* 영상 영역 */}
          <div className="max-w-5xl mx-auto">

            {/* ── 송구영신예배 ── */}
            {category === 'newyear' && (
              hasNewYear ? (
                <>
                  <div
                    className="relative cursor-pointer group overflow-hidden rounded-lg"
                    onClick={() => setModalVideoId(newYearVideoId)}
                  >
                    <div className="aspect-video bg-black">
                      <img
                        src={`https://img.youtube.com/vi/${newYearVideoId}/maxresdefault.jpg`}
                        alt={newYearData?.latestVideoTitle ?? '송구영신예배'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 shadow-2xl">
                        <svg className="w-10 h-10 text-slate-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <h3 className="text-2xl font-light text-white mb-2">
                      {newYearData?.latestVideoTitle ?? '송구영신예배'}
                    </h3>
                    <p className="text-slate-400">송구영신예배 · {newYearData?.year ?? ''}</p>
                  </div>
                </>
              ) : (
                <p className="text-slate-400 font-light text-lg text-center py-16">
                  송구영신예배 영상이 없습니다.
                </p>
              )
            )}

            {/* ── 주일강단 ── */}
            {category === 'sermon' && (
              !hasLatestSermon ? (
                <p className="text-slate-400 font-light text-lg text-center py-16">최근 설교가 없습니다.</p>
              ) : !latestVideoId ? (
                <p className="text-slate-400 font-light text-lg text-center py-16">등록된 영상이 없습니다.</p>
              ) : (
                <>
                  <div
                    className="relative cursor-pointer group overflow-hidden rounded-lg"
                    onClick={() => setModalVideoId(latestVideoId)}
                  >
                    <div className="aspect-video bg-black">
                      <img
                        src={`https://img.youtube.com/vi/${latestVideoId}/maxresdefault.jpg`}
                        alt={latestSermon.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 shadow-2xl">
                        <svg className="w-10 h-10 text-slate-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <h3 className="text-2xl font-light text-white mb-2">{latestSermon.title}</h3>
                    <p className="text-slate-400">
                      주일 2부 ·{' '}
                      {latestSermon.sermonDate
                        ? latestSermon.sermonDate
                        : new Date(latestSermon.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      </section>

      {modalVideoId && <VideoModal videoId={modalVideoId} onClose={() => setModalVideoId(null)} />}
    </>
  )
}

// ─────────────────────────────────────────────
// Worship Schedule 섹션
// ─────────────────────────────────────────────
const WorshipScheduleSection = () => {
  const { ref, isVisible } = useScrollAnimation()
  return (
  <section id="worship" className="py-32 bg-slate-50 px-6">
    <div
      ref={ref}
      className={`max-w-5xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="mb-20">
        <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-3">Worship</p>
        <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-4">예배</h2>
        <p className="text-lg text-slate-500 font-light">모든 예배에 여러분을 초대합니다</p>
      </div>
      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        <div>
          <h3 className="text-2xl font-medium text-slate-900 mb-10 pb-4 border-b border-slate-200">주일 예배</h3>
          <div className="space-y-8">
            {[
              { name: '주일 1부 예배', place: '본당', time: '09:00' },
              { name: '주일 2부 예배', place: '본당', time: '11:00' },
              { name: '주일 오후 예배', place: '본당', time: '15:00' },
            ].map(({ name, place, time }) => (
              <div key={name} className="flex justify-between items-baseline">
                <div>
                  <p className="text-lg font-medium text-slate-900 mb-1">{name}</p>
                  <p className="text-base text-slate-500 font-light">{place}</p>
                </div>
                <p className="text-3xl font-light text-slate-900 tabular-nums">{time}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-medium text-slate-900 mb-10 pb-4 border-b border-slate-200">주중 예배</h3>
          <div className="space-y-8">
            {[
              { name: '수요예배', place: '본당', time: '20:00' },
              { name: '금요기도회', place: '본당', time: '20:30' },
              { name: '새벽기도', place: '101호실', time: '05:30' },
            ].map(({ name, place, time }) => (
              <div key={name} className="flex justify-between items-baseline">
                <div>
                  <p className="text-lg font-medium text-slate-900 mb-1">{name}</p>
                  <p className="text-base text-slate-500 font-light">{place}</p>
                </div>
                <p className="text-3xl font-light text-slate-900 tabular-nums">{time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-16 pt-16 border-t border-slate-200">
        <h3 className="text-2xl font-medium text-slate-900 mb-10 pb-4 border-b border-slate-200">부서 예배</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: '태영아부', place: '태영아부실', time: '11:00' },
            { name: '유아유치부', place: '유아유치부실', time: '11:00' },
            { name: '초등부', place: '초등부실', time: '11:00' },
            { name: '중·고등부', place: '중고등부실', time: '11:00' },
            { name: '대학청년부', place: '본당', time: '11:00' },
          ].map(({ name, place, time }) => (
            <div key={name} className="flex justify-between items-baseline border-b border-slate-100 pb-4">
              <div>
                <p className="text-lg font-medium text-slate-900 mb-1">{name}</p>
                <p className="text-base text-slate-500 font-light">{place}</p>
              </div>
              <p className="text-2xl font-light text-slate-900 tabular-nums">{time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
)
}

// ─────────────────────────────────────────────
// Notice 섹션 — 공지 + 진행 중인 훈련 통합
// ─────────────────────────────────────────────
const NoticeSection = () => {
  const navigate = useNavigate()
  const { ref, isVisible } = useScrollAnimation()

  const { data, isLoading: noticeLoading } = useQuery({
    queryKey: ['notices', 'latest', 5],
    queryFn: () => getLatestNotices(5),
    staleTime: 5 * 60 * 1000,
  })
  const notices = data?.content ?? []

  const { data: trainings = [], isLoading: trainingLoading } = useQuery({
    queryKey: ['trainings', 'open'],
    queryFn: getOpenTrainings,
    staleTime: 5 * 60 * 1000,
  })

  const fmtDate = (val) => {
    if (!val) return ''
    const d = new Date(val)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  const fmtDeadline = (val) => {
    if (!val) return ''
    const d = new Date(val)
    return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} 마감`
  }

  return (
    <section id="notice" className="py-32 bg-white px-6">
      <div
        ref={ref}
        className={`max-w-4xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* ── 공지사항 ── */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-3">Notice</p>
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight">공지사항</h2>
          </div>
          <Link
            to="/notices"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 border border-slate-300 hover:border-slate-500 hover:text-slate-900 transition-colors"
            style={{ padding: '0.45rem 1rem', borderRadius: '100px' }}
          >
            전체 보기
          </Link>
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--church-border)', borderRadius: '10px', overflow: 'hidden' }}>
          {noticeLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : notices.length === 0 ? (
            <p style={{ padding: '2.5rem', textAlign: 'center', color: '#9a9a9a', fontWeight: 300 }}>공지사항이 없습니다.</p>
          ) : (
            notices.map((notice, i) => (
              <div
                key={notice.id}
                className="church-notice-item flex items-center gap-4 cursor-pointer transition-colors"
                style={{ padding: '1.1rem 1.6rem', borderBottom: i < notices.length - 1 ? '1px solid var(--church-border)' : 'none' }}
                onClick={() => navigate(`/notices/${notice.id}`)}
              >
                {notice.isPinned ? (
                  <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.66rem', fontWeight: 700, padding: '0.17rem 0.58rem', borderRadius: '4px', flexShrink: 0, border: '1px solid #cbd5e1' }}>
                    고정
                  </span>
                ) : (
                  <span style={{ background: '#f1f5f9', color: '#9a9a9a', fontSize: '0.66rem', fontWeight: 600, padding: '0.17rem 0.58rem', borderRadius: '4px', flexShrink: 0 }}>
                    공지
                  </span>
                )}
                <span className="flex-1 text-sm font-normal" style={{ color: '#282828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {notice.title}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#9a9a9a', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {notice.createdAt
                    ? new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                      }).replace(/\. /g, '.').replace(/\.$/, '')
                    : ''}
                </span>
                <span className="church-notice-arrow" style={{ fontSize: '0.8rem', color: 'var(--church-border)', flexShrink: 0, transition: 'color 0.2s' }}>→</span>
              </div>
            ))
          )}
        </div>

        {/* ── 진행 중인 훈련 (OPEN 있을 때만) ── */}
        {(trainingLoading || trainings.length > 0) && (
          <div className="mt-14">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-3">Training</p>
                <h3 className="text-2xl font-light text-slate-900 tracking-tight">진행 중인 훈련</h3>
              </div>
              <Link
                to="/training"
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 border border-slate-300 hover:border-slate-500 hover:text-slate-900 transition-colors"
                style={{ padding: '0.45rem 1rem', borderRadius: '100px' }}
              >
                전체 보기
              </Link>
            </div>
            <div style={{ background: '#fff', border: '1px solid var(--church-border)', borderRadius: '10px', overflow: 'hidden' }}>
              {trainingLoading ? (
                Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} />)
              ) : (
                trainings.map((training, i) => (
                  <div
                    key={training.id}
                    className="church-notice-item flex items-center gap-4 cursor-pointer transition-colors"
                    style={{ padding: '1.1rem 1.6rem', borderBottom: i < trainings.length - 1 ? '1px solid var(--church-border)' : 'none' }}
                    onClick={() => navigate(`/training/${training.id}`)}
                  >
                    <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.66rem', fontWeight: 700, padding: '0.17rem 0.58rem', borderRadius: '4px', flexShrink: 0, border: '1px solid #bbf7d0' }}>
                      신청가능
                    </span>
                    <span className="flex-1 text-sm font-normal" style={{ color: '#282828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {training.title}
                    </span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {training.startDate && training.endDate && (
                        <span style={{ fontSize: '0.78rem', color: '#9a9a9a', whiteSpace: 'nowrap' }}>
                          {fmtDate(training.startDate)} – {fmtDate(training.endDate)}
                        </span>
                      )}
                      {training.applicationDeadline && (
                        <span style={{ fontSize: '0.78rem', color: '#d97706', whiteSpace: 'nowrap' }}>
                          {fmtDeadline(training.applicationDeadline)}
                        </span>
                      )}
                    </div>
                    <span className="church-notice-arrow" style={{ fontSize: '0.8rem', color: 'var(--church-border)', flexShrink: 0, transition: 'color 0.2s' }}>→</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// Department 섹션
// ─────────────────────────────────────────────
const DepartmentSection = () => {
  const { ref, isVisible } = useScrollAnimation()
  return (
  <section id="ministry" className="py-32 bg-slate-50 px-6">
    <div
      ref={ref}
      className={`max-w-4xl mx-auto text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-slate-900 leading-relaxed mb-12">
        하나님과의 친밀한 교제와<br />
        성도들과의 진실한 사랑의 교제
      </h2>
      <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light max-w-3xl mx-auto mb-12">
        그리스도 사랑교회는 예배를 통하여, 그리고 예배가 지배하는 삶을 통해 하나님의 보상을
        기대합니다. 그 보상은 세상도 줄 수 있는 잠시의 위안이나 물질적인 복, 건강, 명예와 같은
        보잘것없는 것이 아니라 오히려 그 보상은 궁극적인 모든 선의 근원이 되시는 하나님과의
        친밀한 교제이며, 그분의 자녀들인 성도들과의 진실한 사랑의 교제입니다.
      </p>
      <a
        href="/department/nursery"
        className="group relative inline-flex items-center px-10 py-4 overflow-hidden text-slate-900 transition-all duration-300 ease-out border border-slate-900 hover:text-white text-lg"
      >
        <span className="absolute inset-0 bg-slate-900 transition-all duration-300 ease-out transform translate-y-full group-hover:translate-y-0" />
        <span className="relative font-medium tracking-wide">부서 소개</span>
      </a>
    </div>
  </section>
)
}

// ─────────────────────────────────────────────
// Contact 섹션 (카카오맵 + 교통 정보)
// ─────────────────────────────────────────────
const KAKAO_MAP_API_KEY = import.meta.env.VITE_KAKAO_MAP_KEY

const CHURCH = {
  lat: 35.871497,
  lng: 128.715387,
  name: '그리스도 사랑교회',
  address: '대구광역시 동구 안심로55길 59',
}

function drawMap(container) {
  const coords = new window.kakao.maps.LatLng(CHURCH.lat, CHURCH.lng)
  const map = new window.kakao.maps.Map(container, { center: coords, level: 3 })

  // Ctrl+wheel 일 때만 줌 허용, 일반 스크롤은 페이지로 전달
  container.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) {
      map.setZoomable(false)
    } else {
      map.setZoomable(true)
    }
  }, { passive: true })

  // 마우스가 지도 밖으로 나가면 줌 다시 비활성화
  container.addEventListener('mouseleave', () => {
    map.setZoomable(false)
  })

  // 초기 상태: 휠 줌 비활성화
  map.setZoomable(false)

  const overlayContent = `
    <div style="position:relative;">
      <div style="padding:15px 20px;background:white;border-radius:8px;
        box-shadow:0 4px 12px rgba(0,0,0,0.15);min-width:220px;position:relative;">
        <div style="font-size:16px;font-weight:600;color:#1e293b;margin-bottom:8px;">${CHURCH.name}</div>
        <div style="font-size:13px;color:#64748b;line-height:1.5;margin-bottom:10px;">${CHURCH.address}</div>
        <a href="https://map.kakao.com/link/to/${CHURCH.name},${CHURCH.lat},${CHURCH.lng}"
           target="_blank"
           style="display:inline-block;padding:6px 12px;background:#0f172a;color:white;
                  text-decoration:none;border-radius:4px;font-size:12px;font-weight:500;"
           onmouseover="this.style.background='#334155'"
           onmouseout="this.style.background='#0f172a'">길찾기</a>
      </div>
      <div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);
        width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;
        border-top:8px solid white;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.1));"></div>
    </div>
  `
  new window.kakao.maps.CustomOverlay({ map, position: coords, content: overlayContent, yAnchor: 1 })
}

const ContactSection = () => {
  const mapRef = useRef(null)
  const { ref, isVisible } = useScrollAnimation()
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    const container = mapRef.current
    if (!container) return

    const initMap = () => {
      if (!window.kakao?.maps) return
      try {
        drawMap(container)
      } catch (e) {
        console.warn('카카오맵 초기화 실패:', e)
        setMapError(true)
      }
    }

    // SDK가 이미 로드된 경우
    if (window.kakao?.maps) {
      window.kakao.maps.load(initMap)
      return
    }

    // SDK 동적 로드
    if (!KAKAO_MAP_API_KEY) {
      setMapError(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false`
    script.async = true
    script.onload = () => window.kakao.maps.load(initMap)
    script.onerror = () => setMapError(true)
    document.head.appendChild(script)
  }, [])

  return (
    <section id="contact" className="py-32 bg-white px-6">
      <div
        ref={ref}
        className={`max-w-5xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="mb-20">
          <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-3">Location</p>
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-4">오시는 길</h2>
          <p className="text-lg text-slate-500 font-light">그리스도 사랑교회로 오시는 길을 안내합니다</p>
        </div>
        <div className="bg-slate-100 h-96 lg:h-[500px] mb-16">
          {mapError ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm">지도를 불러올 수 없습니다</p>
              <a
                href={`https://map.kakao.com/link/to/${CHURCH.name},${CHURCH.lat},${CHURCH.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                카카오맵에서 보기 →
              </a>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <div ref={mapRef} className="w-full h-full" />
              <div
                className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  padding: '5px 12px',
                  borderRadius: '100px',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.02em',
                }}
              >
                Ctrl + 스크롤로 지도를 확대·축소할 수 있습니다
              </div>
            </div>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-xl font-medium text-slate-900 mb-6">주소</h3>
            <div className="space-y-1 text-slate-600 font-light text-lg">
              <p>대구광역시 동구</p>
              <p>안심로55길 59</p>
              <p className="mt-4 font-medium text-slate-900">그리스도 사랑교회</p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-medium text-slate-900 mb-6">연락처</h3>
            <div className="space-y-1 text-slate-600 font-light text-lg">
              <p>Tel: 053-962-8948</p>
              <p>Email: magamedia8948@gmail.com</p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-medium text-slate-900 mb-6">교통편</h3>
            <div className="text-slate-600 font-light text-lg space-y-1">
              <p className="font-medium text-slate-900 mb-2">지하철</p>
              <p>1호선 반야월역 4번 출구</p>
              <p className="text-base text-slate-500 mb-4">도보 약 10분</p>
              <p className="font-medium text-slate-900 mb-2 mt-4">버스</p>
              <p className="text-base">경북교통앞 정류장 (도보 5분)</p>
              <p className="text-sm text-slate-500">805, 836, 동구4, 동구10, 북구3</p>
              <p className="text-base mt-2">동부고교앞·건너 정류장 (도보 8분)</p>
              <p className="text-sm text-slate-500">55, 555, 802, 814, 818, 북구3</p>
              <p className="mt-4 font-medium text-slate-900">주차</p>
              <p className="text-base">교회 주차장 이용 가능</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────
const Template = () => (
  <>
    <Header />
    <HeroSection />
    <AboutSection />
    <SermonSection />
    <WorshipScheduleSection />
    <NoticeSection />
    <DepartmentSection />
    <ContactSection />
  </>
)

export default Template
