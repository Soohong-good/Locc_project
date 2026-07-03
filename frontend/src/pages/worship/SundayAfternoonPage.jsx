import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  MagnifyingGlass, Play, ArrowRight, CaretLeft, CaretRight, VideoCamera,
} from '@phosphor-icons/react'
import { getSundayAfternoonData } from '@/api/sermons'
import useAuthStore from '@/stores/authStore'
import useSermonCrud from '@/hooks/useSermonCrud'
import SermonModal from '@/components/sermon/SermonModal'
import SermonDeleteModal from '@/components/sermon/SermonDeleteModal'

const PAGE_SIZE = 9

const fmtDot = (val) => {
  if (!val) return ''
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return String(val)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const fmtDash = (val) => fmtDot(val).replace(/\./g, '-')

const extractVideoId = (url) => {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

const thumbnailSrc = (sermon) => {
  if (!sermon) return null
  const vid = extractVideoId(sermon.videoUrl)
  if (vid) return `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`
  return sermon.thumbnailUrl ?? null
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
          className="w-full h-full"
        />
      </div>
    </div>
  )
}

/* ── 설교 카드 ──────────────────────────────────────────────── */
const SermonCard = ({ sermon, canWrite, isAdmin, userId, onEdit, onDelete }) => {
  const navigate = useNavigate()
  const thumb    = thumbnailSrc(sermon)
  const isAuthor = sermon.authorId === userId

  const handleCardClick = () => navigate(`/worship/sermon/${sermon.id}`)

  return (
    <div
      onClick={handleCardClick}
      className="bg-white flex flex-col group/card cursor-pointer border border-[#E8E8E8] hover:border-[#C8C8C8] hover:shadow-xl transition-all duration-300 relative"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      {canWrite && (isAdmin || isAuthor) && (
        <div
          className="absolute top-3 right-3 flex gap-1.5 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(sermon)}
            className="px-2.5 py-1.5 text-xs font-medium bg-white border border-[#E5E5E5] hover:border-[#171717] hover:text-[#171717] shadow-sm transition-colors"
          >수정</button>
          <button
            onClick={() => onDelete(sermon)}
            className="px-2.5 py-1.5 text-xs font-medium bg-white border border-red-200 text-red-500 hover:border-red-500 hover:text-red-600 shadow-sm transition-colors"
          >삭제</button>
        </div>
      )}

      <div className="bg-[#F0F1F3] aspect-video relative flex items-center justify-center overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={sermon.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
            onError={onThumbError}
          />
        ) : (
          <div className="flex flex-col items-center text-[#A3B1C6]">
            <VideoCamera size={36} />
            <span className="text-[11px] mt-2 font-serif italic">Sunday Afternoon</span>
          </div>
        )}
      </div>

      <div className="p-8 pb-7 flex flex-col flex-1">
        <div className="text-[11px] text-[#A0A0A0] mb-4 font-mono tracking-wider uppercase">
          {fmtDot(sermon.sermonDate)}
        </div>
        <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-4 leading-[1.45] break-keep line-clamp-2">
          {sermon.title || '(제목 없음)'}
        </h3>
        <div className="flex flex-col gap-0.5 mb-auto">
          {sermon.scripture && (
            <div className="text-[13px] text-[#737373] font-medium">{sermon.scripture}</div>
          )}
          <div className="text-[13px] text-[#A0A0A0]">{sermon.preacher || '-'}</div>
        </div>
        <div className="mt-8 pt-5 border-t border-[#F0F0F0] flex justify-between items-center">
          <span className="text-[13px] font-semibold tracking-wide text-[#737373] group-hover/card:text-[#1A1A1A] transition-colors">
            설교 보기
          </span>
          <span className="w-7 h-7 rounded-full border border-[#E8E8E8] flex items-center justify-center group-hover/card:bg-[#1A1A1A] group-hover/card:border-[#1A1A1A] transition-all duration-300">
            <ArrowRight size={13} className="text-[#A0A0A0] group-hover/card:text-white group-hover/card:translate-x-px transition-all duration-300" />
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── 최신 설교(피처드) ──────────────────────────────────────── */
const FeaturedSermon = ({ sermon, onOpen }) => {
  const thumb = thumbnailSrc(sermon)
  return (
    <section className="border-b border-[#E5E5E5] bg-[#FAF9F6]">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 md:py-24 border-x border-[#E5E5E5]">
        <span className="text-xs uppercase tracking-[0.2em] font-mono text-[#737373] mb-4 block">Latest Sermon</span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2C2C2C] mb-12">주일오후 최신 설교</h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div
            onClick={() => onOpen(sermon)}
            className="lg:col-span-8 bg-[#F4F5F7] aspect-video relative flex items-center justify-center border border-[#E5E5E5] overflow-hidden cursor-pointer group"
          >
            {thumb ? (
              <img
                src={thumb}
                alt={sermon.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={onThumbError}
              />
            ) : (
              <div className="flex flex-col items-center text-[#A3B1C6]">
                <VideoCamera size={56} />
                <span className="text-[13px] mt-3 font-serif italic">Sunday Afternoon</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            <button className="relative w-16 h-16 bg-white/80 backdrop-blur-sm flex items-center justify-center group-hover:bg-white transition-colors">
              <Play size={28} weight="fill" className="text-[#7192AD] ml-1" />
            </button>
          </div>
          <div className="lg:col-span-4 flex flex-col justify-center">
            <h3 className="text-2xl md:text-[1.75rem] font-bold text-[#2C2C2C] leading-snug mb-6 break-keep">
              {fmtDot(sermon.sermonDate).slice(2)} 주일오후.<br />
              {sermon.title}<br />
              {sermon.scripture && <>({sermon.scripture})<br /></>}
              {sermon.preacher}
            </h3>
            <div className="text-[#737373] font-mono text-sm mb-10">{fmtDash(sermon.sermonDate)}</div>
            <button
              onClick={() => onOpen(sermon)}
              className="bg-[#171717] text-white px-8 py-4 flex items-center gap-3 w-fit hover:bg-black transition-colors"
            >
              <Play size={18} weight="fill" />
              <span className="font-bold text-sm tracking-wide">설교 보기</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── 히어로 ─────────────────────────────────────────────────── */
const HeroSection = ({ searchInput, onSearchChange, onSearchSubmit }) => (
  <section className="mt-20 bg-[#171717] relative overflow-hidden border-b border-[#E5E5E5]">
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/bg-worship.jpg')" }} />
    <div className="absolute inset-0" style={{ background: 'rgba(23,23,23,0.75)' }} />
    <div className="relative z-10 max-w-[1600px] mx-auto border-x border-[#333333] flex flex-col pt-24 md:pt-32">
      <div className="px-6 md:px-12 mb-16 md:mb-24">
        <span className="text-xs uppercase tracking-[0.2em] font-mono text-[#A3A3A3] mb-4 block">Sunday Afternoon Service</span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">주일오후 예배</h1>
      </div>
      <div className="flex justify-end border-t border-[#333333] bg-[#171717]/50 backdrop-blur-sm">
        <form
          onSubmit={(e) => { e.preventDefault(); onSearchSubmit() }}
          className="w-full lg:w-[450px] p-4 lg:p-0 flex border-l border-[#333333]"
        >
          <div className="bg-white flex w-full h-12 lg:h-[65px]">
            <MagnifyingGlass size={20} className="text-[#737373] ml-4 lg:ml-6 self-center shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="제목·본문·설교자 검색"
              className="w-full h-full px-3 text-[#2C2C2C] bg-transparent outline-none text-[15px] placeholder-[#A0A0A0]"
            />
            <button type="submit" className="bg-[#171717] text-white px-6 lg:px-8 text-[15px] font-bold h-full border-l border-[#333333] hover:bg-black transition-colors">
              검색
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
)

/* ── 페이지네이션 ─────────────────────────────────────────── */
const PAGE_WINDOW = 5
const getPageRange = (current, total) => {
  if (total <= PAGE_WINDOW) return Array.from({ length: total }, (_, i) => i)
  let start = Math.max(0, current - Math.floor(PAGE_WINDOW / 2))
  const end = Math.min(total, start + PAGE_WINDOW)
  start = Math.max(0, end - PAGE_WINDOW)
  return Array.from({ length: PAGE_WINDOW }, (_, i) => start + i)
}

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
const SundayAfternoonPage = () => {
  const navigate = useNavigate()
  const [page, setPage]               = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword]         = useState('')
  const [modalVideoId, setModalVideoId] = useState(null)

  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const canWrite = isAdminOrOperatorFn()
  const isAdmin  = isAdminFn()
  const userId   = getUserId()

  const queryKey = ['sermons', 'sunday-afternoon', page, keyword]

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getSundayAfternoonData({ page, size: PAGE_SIZE, keyword }),
    placeholderData: (prev) => prev,
  })

  const crud = useSermonCrud([queryKey])

  const sermons     = data?.sermons ?? []
  const latest      = data?.latestSermon ?? null
  const totalPages  = data?.totalPages ?? 1
  const currentPage = data?.currentPage ?? page

  const openDetail = (sermon) => {
    if (sermon?.id) navigate(`/worship/sermon/${sermon.id}`)
  }

  const openVideo = (sermon) => {
    const vid = extractVideoId(sermon?.videoUrl)
    if (vid) setModalVideoId(vid)
    else openDetail(sermon)
  }

  const handleSearchSubmit = () => {
    setKeyword(searchInput.trim())
    setPage(0)
  }

  return (
    <>
      <HeroSection
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      {canWrite && (
        <div className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-4 flex justify-end">
            <button
              onClick={crud.openCreate}
              className="bg-[#171717] text-white px-6 py-2.5 text-sm font-bold tracking-wide hover:bg-black transition-colors"
            >
              + 설교 등록
            </button>
          </div>
        </div>
      )}

      {!keyword && latest?.id && (
        <FeaturedSermon sermon={latest} onOpen={openVideo} />
      )}

      <section className="bg-[#FAF9F6]">
        {isLoading && (
          <div className="max-w-[1600px] mx-auto py-32 text-center text-[#737373]">불러오는 중...</div>
        )}
        {error && (
          <div className="max-w-[1600px] mx-auto py-32 text-center text-[#B91C1C]">설교 목록을 불러올 수 없습니다.</div>
        )}
        {!isLoading && !error && sermons.length === 0 && (
          <div className="max-w-[1600px] mx-auto py-32 flex flex-col items-center gap-3 text-[#737373]">
            <VideoCamera size={40} className="text-[#C5C6CD]" />
            <p className="text-[15px]">{keyword ? '검색 결과가 없습니다.' : '등록된 설교가 없습니다.'}</p>
          </div>
        )}
        {!isLoading && !error && sermons.length > 0 && (
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {sermons.map((sermon) => (
              <SermonCard
                key={sermon.id}
                sermon={sermon}
                canWrite={canWrite}
                isAdmin={isAdmin}
                userId={userId}
                onEdit={crud.openEdit}
                onDelete={crud.setDeleteTarget}
              />
            ))}
          </div>
        )}
      </section>

      <PaginationSection currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />

      <SermonModal
        isOpen={crud.isModalOpen}
        onClose={crud.closeModal}
        onSave={crud.handleSave}
        isSaving={crud.isSaving}
        isLoadingDetail={crud.isLoadingDetail}
        editTarget={crud.editTarget}
        fixedCategory="주일오후"
        serviceNumberOptions={null}
        defaultServiceNumber={null}
      />

      <SermonDeleteModal
        target={crud.deleteTarget}
        onCancel={() => crud.setDeleteTarget(null)}
        onConfirm={crud.handleDeleteConfirm}
        isDeleting={crud.isDeleting}
      />

      {modalVideoId && <VideoModal videoId={modalVideoId} onClose={() => setModalVideoId(null)} />}
    </>
  )
}

export default SundayAfternoonPage
