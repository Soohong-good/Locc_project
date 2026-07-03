import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  MagnifyingGlass, Play, ArrowRight, CaretLeft, CaretRight, VideoCamera,
} from '@phosphor-icons/react'
import { getSundayMorningGroupedData } from '@/api/sermons'
import useAuthStore from '@/stores/authStore'
import SundayMorningModal from '@/components/sermon/SundayMorningModal'
import useSermonGroupDelete from '@/hooks/useSermonGroupDelete'

const fmtDot = (val) => {
  if (!val) return ''
  const d = new Date(String(val))
  if (Number.isNaN(d.getTime())) return String(val)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const fmtDash = (val) => fmtDot(val).replace(/\./g, '-')

const extractVideoId = (url) => {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

const thumbSrc = (videoUrl) => {
  const vid = extractVideoId(videoUrl)
  return vid ? `https://img.youtube.com/vi/${vid}/maxresdefault.jpg` : null
}

const onThumbError = (e) => {
  const el = e.currentTarget
  if (el.src.includes('maxresdefault')) el.src = el.src.replace('maxresdefault', 'hqdefault')
  else el.style.display = 'none'
}

/* ── 날짜 카드 ─────────────────────────────────────────────── */
const GroupCard = ({ group, canEdit, onEditGroup, onDeleteGroup }) => {
  const navigate = useNavigate()
  const thumb    = thumbSrc(group.part1?.videoUrl ?? group.part2?.videoUrl)

  return (
    <div
      onClick={() => navigate(`/worship/sermon/sunday-morning/${group.sermonDate}`)}
      className="bg-white flex flex-col group/card cursor-pointer border border-[#E8E8E8] hover:border-[#C8C8C8] hover:shadow-xl transition-all duration-300 relative"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      {canEdit && (
        <div
          className="absolute top-3 right-3 flex gap-1.5 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEditGroup(group)}
            className="px-2.5 py-1.5 text-xs font-medium bg-white border border-[#E5E5E5] hover:border-[#171717] hover:text-[#171717] shadow-sm transition-colors"
          >수정</button>
          <button
            onClick={() => onDeleteGroup(group)}
            className="px-2.5 py-1.5 text-xs font-medium bg-white border border-red-200 text-red-500 hover:border-red-500 hover:text-red-600 shadow-sm transition-colors"
          >삭제</button>
        </div>
      )}

      <div className="bg-[#F0F1F3] aspect-video relative flex items-center justify-center overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={group.representativeTitle ?? ''}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
            onError={onThumbError}
          />
        ) : (
          <div className="flex flex-col items-center text-[#A3B1C6]">
            <VideoCamera size={36} />
            <span className="text-[11px] mt-2 font-serif italic">Sunday Morning</span>
          </div>
        )}
      </div>

      <div className="p-8 pb-7 flex flex-col flex-1">
        <div className="text-[11px] text-[#A0A0A0] mb-4 font-mono tracking-wider uppercase">
          {fmtDot(group.sermonDate)}
        </div>
        <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-4 leading-[1.45] break-keep line-clamp-2">
          {group.representativeTitle ?? '(제목 없음)'}
        </h3>
        {group.representativePreacher && (
          <div className="text-[13px] text-[#A0A0A0] mb-3">{group.representativePreacher}</div>
        )}
        <div className="flex gap-2">
          {group.part1 && <span className="px-2.5 py-1 text-xs font-bold bg-[#171717] text-white">1부</span>}
          {group.part2 && <span className="px-2.5 py-1 text-xs font-bold bg-[#555555] text-white">2부</span>}
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

/* ── 최신 설교(피처드) ────────────────────────────────────── */
const FeaturedSermon = ({ group }) => {
  const navigate = useNavigate()
  const latest   = group.part2 ?? group.part1
  const thumb    = thumbSrc(latest?.videoUrl)
  const partLabel = group.part2 ? '2부' : '1부'

  return (
    <section className="border-b border-[#E5E5E5] bg-[#FAF9F6]">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 md:py-24 border-x border-[#E5E5E5]">
        <span className="text-xs uppercase tracking-[0.2em] font-mono text-[#737373] mb-4 block">Latest Sermon</span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2C2C2C] mb-12">주일오전 최신 설교</h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div
            onClick={() => navigate(`/worship/sermon/sunday-morning/${group.sermonDate}`)}
            className="lg:col-span-8 bg-[#F4F5F7] aspect-video relative flex items-center justify-center border border-[#E5E5E5] overflow-hidden cursor-pointer group"
          >
            {thumb ? (
              <img
                src={thumb}
                alt={latest?.title ?? ''}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={onThumbError}
              />
            ) : (
              <div className="flex flex-col items-center text-[#A3B1C6]">
                <VideoCamera size={56} />
                <span className="text-[13px] mt-3 font-serif italic">Sunday Morning</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            <button className="relative w-16 h-16 bg-white/80 backdrop-blur-sm flex items-center justify-center group-hover:bg-white transition-colors">
              <Play size={28} weight="fill" className="text-[#7192AD] ml-1" />
            </button>
          </div>
          <div className="lg:col-span-4 flex flex-col justify-center">
            <h3 className="text-2xl md:text-[1.75rem] font-bold text-[#2C2C2C] leading-snug mb-6 break-keep">
              {fmtDot(group.sermonDate).slice(2)} 주일오전 {partLabel}.<br />
              {latest?.title}<br />
              {latest?.scripture && <>({latest.scripture})<br /></>}
              {latest?.preacher}
            </h3>
            <div className="text-[#737373] font-mono text-sm mb-10">{fmtDash(group.sermonDate)}</div>
            <button
              onClick={() => navigate(`/worship/sermon/sunday-morning/${group.sermonDate}`)}
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
        <span className="text-xs uppercase tracking-[0.2em] font-mono text-[#A3A3A3] mb-4 block">Sunday Morning Service</span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">주일오전 예배</h1>
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
              placeholder="제목·설교자 검색"
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
const SundayMorningPage = () => {
  const [page, setPage]             = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword]       = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editGroup, setEditGroup]   = useState(null)

  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn } = useAuthStore()
  const canWrite    = isAdminOrOperatorFn()
  const isAdmin     = isAdminFn()

  const { data, isLoading, error } = useQuery({
    queryKey: ['sermons', 'sunday-morning', 'grouped', page, keyword],
    queryFn:  () => getSundayMorningGroupedData({ page, keyword }),
    placeholderData: (prev) => prev,
  })

  const groups      = data?.groups ?? []
  const latestGroup = data?.latestGroup ?? null
  const totalPages  = data?.totalPages ?? 1
  const currentPage = data?.currentPage ?? page

  const deleteGroupMutation = useSermonGroupDelete([['sermons', 'sunday-morning', 'grouped']])

  const handleDeleteGroup = (group) => {
    const title = group.representativeTitle ?? group.part1?.title ?? group.part2?.title
    if (!confirm(`${group.sermonDate} "${title}" 설교(1·2부)를 모두 삭제하시겠습니까?`)) return
    deleteGroupMutation.mutate(group)
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
              onClick={() => { setEditGroup(null); setIsModalOpen(true) }}
              className="bg-[#171717] text-white px-6 py-2.5 text-sm font-bold tracking-wide hover:bg-black transition-colors"
            >
              + 설교 등록
            </button>
          </div>
        </div>
      )}

      {!keyword && latestGroup && (
        <FeaturedSermon group={latestGroup} />
      )}

      <section className="bg-[#FAF9F6]">
        {isLoading && (
          <div className="max-w-[1600px] mx-auto py-32 text-center text-[#737373]">불러오는 중...</div>
        )}
        {error && (
          <div className="max-w-[1600px] mx-auto py-32 text-center text-[#B91C1C]">설교 목록을 불러올 수 없습니다.</div>
        )}
        {!isLoading && !error && groups.length === 0 && (
          <div className="max-w-[1600px] mx-auto py-32 flex flex-col items-center gap-3 text-[#737373]">
            <VideoCamera size={40} className="text-[#C5C6CD]" />
            <p className="text-[15px]">{keyword ? '검색 결과가 없습니다.' : '등록된 설교가 없습니다.'}</p>
          </div>
        )}
        {!isLoading && !error && groups.length > 0 && (
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {groups.map((group) => (
              <GroupCard
                key={group.sermonDate}
                group={group}
                canEdit={canWrite && isAdmin}
                onEditGroup={(g) => { setEditGroup(g); setIsModalOpen(true) }}
                onDeleteGroup={handleDeleteGroup}
              />
            ))}
          </div>
        )}
      </section>

      <PaginationSection currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />

      <SundayMorningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editGroup={editGroup}
      />
    </>
  )
}

export default SundayMorningPage
