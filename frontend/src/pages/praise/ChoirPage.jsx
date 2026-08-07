import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Play, CaretLeft, CaretRight, VideoCamera,
} from '@phosphor-icons/react'
import { getChoirVideos } from '@/api/choir'
import { CHOIR_NAMES } from '@/constants/choirs'
import { getPageRange } from '@/utils/pagination'
import { formatDateDot as fmtDot } from '@/utils/dateFormat'
import { extractYouTubeId as extractVideoId } from '@/utils/youtube'

const thumbnailSrc = (video) => {
  if (!video) return null
  const vid = extractVideoId(video.videoUrl)
  if (vid) return `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`
  return video.thumbnailUrl ?? null
}

const onThumbError = (e) => {
  const el = e.currentTarget
  if (el.src.includes('maxresdefault')) el.src = el.src.replace('maxresdefault', 'hqdefault')
  else el.style.display = 'none'
}

/* ── 영상 모달 ──────────────────────────────────────────────── */
const VideoModal = ({ videoId, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-white/60 z-10">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="w-full max-w-5xl aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          className="w-full h-full"
        />
      </div>
    </div>
  )
}

/* ── 영상 카드 ──────────────────────────────────────────────── */
const ChoirCard = ({ video, onOpen }) => {
  const thumb = thumbnailSrc(video)

  return (
    <div
      onClick={() => onOpen(video)}
      className="bg-white flex flex-col group/card cursor-pointer border border-[#E8E8E8] hover:border-[#C8C8C8] hover:shadow-xl transition-all duration-300 relative"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="bg-[#F0F1F3] aspect-video relative flex items-center justify-center overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={video.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
            onError={onThumbError}
          />
        ) : (
          <div className="flex flex-col items-center text-[#A3B1C6]">
            <VideoCamera size={36} />
            <span className="text-[11px] mt-2 font-serif italic">Choir</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition-colors flex items-center justify-center">
          <span className="w-12 h-12 rounded-full bg-white/0 group-hover/card:bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all">
            <Play size={20} weight="fill" className="text-[#7192AD] ml-0.5" />
          </span>
        </div>
      </div>

      <div className="p-8 pb-7 flex flex-col flex-1">
        <div className="text-[11px] text-[#A0A0A0] mb-4 font-mono tracking-wider uppercase">
          {fmtDot(video.publishedAt)}
        </div>
        <h3 className="text-[18px] font-bold text-[#1A1A1A] leading-[1.45] break-keep line-clamp-2">
          {video.title || '(제목 없음)'}
        </h3>
      </div>
    </div>
  )
}

/* ── 히어로 ─────────────────────────────────────────────────── */
const HeroSection = () => (
  <section className="mt-20 bg-[#171717] relative overflow-hidden border-b border-[#E5E5E5]">
    <img
      src="/choir.png"
      alt=""
      className="absolute inset-0 w-full h-full object-cover opacity-50"
      onError={(e) => { e.currentTarget.style.display = 'none' }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/80 to-[#171717]/50" />
    <div className="relative z-10 max-w-[1600px] mx-auto border-x border-[#333333] flex flex-col pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="px-6 md:px-12">
        <span className="text-xs uppercase tracking-[0.2em] font-mono text-[#A3A3A3] mb-4 block">Praise / Choir</span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white break-keep">찬양대</h1>
      </div>
    </div>
  </section>
)

/* ── 카테고리 탭 ────────────────────────────────────────────── */
const CHOIR_TABS = [
  { value: undefined, label: '전체' },
  { value: CHOIR_NAMES.SION,             label: CHOIR_NAMES.SION },
  { value: CHOIR_NAMES.HALLELUJAH,       label: CHOIR_NAMES.HALLELUJAH },
  { value: CHOIR_NAMES.JUYOUNGGWANG,     label: CHOIR_NAMES.JUYOUNGGWANG },
  { value: CHOIR_NAMES.SUNDAY_AFTERNOON, label: CHOIR_NAMES.SUNDAY_AFTERNOON },
]

const CategoryTabs = ({ active, onChange }) => (
  <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto px-6 md:px-12">
      <nav className="flex gap-1 overflow-x-auto">
        {CHOIR_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => onChange(tab.value)}
            className={`shrink-0 px-5 py-4 text-xs font-bold tracking-[0.1em] uppercase border-b-2 transition-colors whitespace-nowrap ${
              active === tab.value
                ? 'border-[#171717] text-[#171717]'
                : 'border-transparent text-[#737373] hover:text-[#2C2C2C]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  </section>
)


const PaginationSection = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null
  const pages = getPageRange(currentPage, totalPages)
  return (
    <section className="border-b border-[#E5E5E5] bg-[#FAF9F6] py-16 md:py-24">
      <div className="max-w-[1600px] mx-auto flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="w-10 h-10 flex items-center justify-center border border-[#E5E5E5] text-[#737373] hover:text-[#2C2C2C] transition-colors bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CaretLeft size={16} />
          </button>
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-10 h-10 flex items-center justify-center font-mono text-sm transition-colors ${
                p === currentPage ? 'bg-[#171717] text-white' : 'border border-[#E5E5E5] text-[#737373] hover:text-[#2C2C2C] bg-white'
              }`}
            >
              {p + 1}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="w-10 h-10 flex items-center justify-center border border-[#E5E5E5] text-[#737373] hover:text-[#2C2C2C] transition-colors bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CaretRight size={16} />
          </button>
        </div>
        <div className="text-[13px] font-mono text-[#737373] tracking-widest">{currentPage + 1} / {totalPages}</div>
      </div>
    </section>
  )
}

/* ── 메인 ───────────────────────────────────────────────────── */
const PAGE_SIZE = 12

const ChoirPage = () => {
  const [page, setPage] = useState(0)
  const [choirName, setChoirName] = useState(undefined)
  const [modalVideoId, setModalVideoId] = useState(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['choir', page, choirName],
    queryFn: () => getChoirVideos({ page, size: PAGE_SIZE, choirName }),
    placeholderData: (prev) => prev,
  })

  const videos = data?.content ?? []
  const totalPages = data?.pageInfo?.totalPages ?? 1
  const currentPage = data?.pageInfo?.page ?? page

  const openVideo = (video) => {
    const vid = extractVideoId(video?.videoUrl)
    if (vid) setModalVideoId(vid)
  }

  const changeCategory = (value) => {
    setChoirName(value)
    setPage(0)
  }

  return (
    <>
      <HeroSection />
      <CategoryTabs active={choirName} onChange={changeCategory} />

      <section className="bg-[#FAF9F6]">
        {isLoading && (
          <div className="max-w-[1600px] mx-auto py-32 text-center text-[#737373]">불러오는 중...</div>
        )}
        {error && (
          <div className="max-w-[1600px] mx-auto py-32 text-center text-[#B91C1C]">영상 목록을 불러올 수 없습니다.</div>
        )}
        {!isLoading && !error && videos.length === 0 && (
          <div className="max-w-[1600px] mx-auto py-32 flex flex-col items-center gap-3 text-[#737373]">
            <VideoCamera size={40} className="text-[#C5C6CD]" />
            <p className="text-[15px]">등록된 영상이 없습니다.</p>
          </div>
        )}
        {!isLoading && !error && videos.length > 0 && (
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {videos.map((video) => (
              <ChoirCard key={video.id} video={video} onOpen={openVideo} />
            ))}
          </div>
        )}
      </section>

      <PaginationSection currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />

      {modalVideoId && <VideoModal videoId={modalVideoId} onClose={() => setModalVideoId(null)} />}
    </>
  )
}

export default ChoirPage
