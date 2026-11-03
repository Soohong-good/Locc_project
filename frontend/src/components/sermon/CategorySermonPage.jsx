import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  MagnifyingGlass, Play, ArrowRight, CaretLeft, CaretRight, VideoCamera, Eye,
} from '@phosphor-icons/react'
import useAuthStore from '@/stores/authStore'
import useSermonCrud from '@/hooks/useSermonCrud'
import SermonModal from '@/components/sermon/SermonModal'
import SermonDeleteModal from '@/components/sermon/SermonDeleteModal'
import { formatDateDot as fmtDot, formatDateDash as fmtDash } from '@/utils/dateFormat'
import { getPageRange } from '@/utils/pagination'
import { extractYouTubeId as extractVideoId } from '@/utils/youtube'

const PAGE_SIZE = 9

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
const SermonCard = ({ sermon, placeholder, canWrite, isAdmin, userId, onEdit, onDelete }) => {
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
            <span className="text-[11px] mt-2 font-serif italic">{placeholder}</span>
          </div>
        )}
      </div>

      <div className="p-8 pb-7 flex flex-col flex-1">
        <div className="text-[11px] text-[#A0A0A0] mb-4 font-mono tracking-wider uppercase flex items-center gap-2">
          <span>{fmtDot(sermon.sermonDate)}</span>
          <span className="text-[#D8D8D8]">·</span>
          <span className="inline-flex items-center gap-1"><Eye size={12} />{sermon.viewCount ?? 0}</span>
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
const FeaturedSermon = ({ sermon, config, onOpen }) => {
  const thumb = thumbnailSrc(sermon)
  return (
    <section className="border-b border-[#E5E5E5] bg-[#FAF9F6]">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 md:py-24 border-x border-[#E5E5E5]">
        <span className="text-xs uppercase tracking-[0.2em] font-mono text-[#737373] mb-4 block">Latest Sermon</span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2C2C2C] mb-12">{config.latestHeading}</h2>
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
                <span className="text-[13px] mt-3 font-serif italic">{config.placeholder}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            <button className="relative w-16 h-16 bg-white/80 backdrop-blur-sm flex items-center justify-center group-hover:bg-white transition-colors">
              <Play size={28} weight="fill" className="text-[#7192AD] ml-1" />
            </button>
          </div>
          <div className="lg:col-span-4 flex flex-col justify-center">
            <h3 className="text-2xl md:text-[1.75rem] font-bold text-[#2C2C2C] leading-snug mb-6 break-keep">
              {fmtDot(sermon.sermonDate).slice(2)} {config.featuredLabel}.<br />
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
const HeroSection = ({ config, activeTab, onTabChange, searchInput, onSearchChange, onSearchSubmit }) => (
  <section className="mt-20 bg-[#171717] relative overflow-hidden border-b border-[#E5E5E5]">
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/bg-worship.jpg')" }} />
    <div className="absolute inset-0" style={{ background: 'rgba(23,23,23,0.75)' }} />
    <div className="relative z-10 max-w-[1600px] mx-auto border-x border-[#333333] flex flex-col pt-24 md:pt-32">
      <div className="px-6 md:px-12 mb-16 md:mb-24">
        <span className="text-xs uppercase tracking-[0.2em] font-mono text-[#A3A3A3] mb-4 block">{config.eyebrow}</span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">{config.title}</h1>
      </div>
      <div className={`flex border-t border-[#333333] bg-[#171717]/50 backdrop-blur-sm ${
        config.tabs ? 'flex-col lg:flex-row justify-between items-end lg:items-center' : 'justify-end'
      }`}>
        {config.tabs && (
          <div className="flex w-full lg:w-auto overflow-x-auto border-b lg:border-b-0 border-[#333333]">
            {config.tabs.map(({ id, label }) => (
              <button
                key={label}
                onClick={() => onTabChange(id)}
                className={`flex-shrink-0 px-6 md:px-10 py-5 border-r border-[#333333] font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === id ? 'text-white font-bold bg-white/5' : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => { e.preventDefault(); onSearchSubmit() }}
          className={`w-full lg:w-[450px] p-4 lg:p-0 flex border-[#333333] ${config.tabs ? 'border-l-0 lg:border-l' : 'border-l'}`}
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
/**
 * 단일 카테고리 설교 목록 페이지 (검색 + 최신 설교 + 카드 목록)
 * config: { category, queryKey, fetchPage, eyebrow, title, latestHeading, featuredLabel, placeholder, tabs? }
 * tabs: [{ id: serviceNumber | null(전체), label }] — 지정 시 세부 구분 탭 표시, fetchPage에 serviceNumber 전달
 */
const CategorySermonPage = ({ config }) => {
  const navigate = useNavigate()
  const [page, setPage]               = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword]         = useState('')
  const [modalVideoId, setModalVideoId] = useState(null)
  const [activeTab, setActiveTab]     = useState(config.tabs?.[0]?.id ?? null)

  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const canWrite = isAdminOrOperatorFn()
  const isAdmin  = isAdminFn()
  const userId   = getUserId()

  const queryKey = ['sermons', config.queryKey, activeTab, page, keyword]

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => config.fetchPage({ serviceNumber: activeTab ?? undefined, page, size: PAGE_SIZE, keyword }),
    placeholderData: (prev) => prev,
  })

  // 탭·페이지 무관하게 이 페이지의 모든 목록 캐시 무효화 (prefix 일치)
  const crud = useSermonCrud([['sermons', config.queryKey]])

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

  const handleTabChange = (id) => {
    setActiveTab(id)
    setPage(0)
  }

  // 세부 구분 탭이 있으면 등록/수정 모달에 구분 선택 노출 (전체 탭은 제외)
  const serviceNumberOptions = config.tabs
    ? config.tabs.filter((t) => t.id != null).map((t) => ({ value: t.id, label: t.label }))
    : null
  const activeTabLabel = config.tabs && activeTab != null
    ? config.tabs.find((t) => t.id === activeTab)?.label
    : null
  const featuredConfig = activeTabLabel
    ? { ...config, latestHeading: `${activeTabLabel} 최신 말씀`, featuredLabel: activeTabLabel }
    : config

  const handleSearchSubmit = () => {
    setKeyword(searchInput.trim())
    setPage(0)
  }

  return (
    <>
      <HeroSection
        config={config}
        activeTab={activeTab}
        onTabChange={handleTabChange}
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
        <FeaturedSermon sermon={latest} config={featuredConfig} onOpen={openVideo} />
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
                placeholder={config.placeholder}
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
        fixedCategory={config.category}
        serviceNumberOptions={serviceNumberOptions}
        defaultServiceNumber={activeTab ?? serviceNumberOptions?.[0]?.value ?? null}
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

export default CategorySermonPage
