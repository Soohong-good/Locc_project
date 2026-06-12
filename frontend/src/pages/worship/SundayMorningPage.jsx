import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSundayMorningGroupedData, deleteSermon } from '@/api/sermons'
import useAuthStore from '@/stores/authStore'
import YoutubeLatestSection from '@/components/sermon/YoutubeLatestSection'
import SermonPagination from '@/components/sermon/SermonPagination'
import SundayMorningModal from '@/components/sermon/SundayMorningModal'
import Button from '@/components/ui/Button'
import PageHero from '@/components/ui/PageHero'
import SkeletonGrid from '@/components/ui/SkeletonCard'
import ErrorMessage from '@/components/common/ErrorMessage'

const extractVideoId = (url) => {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0]
    return u.searchParams.get('v') || null
  } catch { return null }
}

// ── 날짜 카드 ────────────────────────────────────────────────────────────────
const GroupCard = ({ group, canEdit, onEditGroup, onDeleteGroup }) => {
  const navigate = useNavigate()
  const hasBoth = group.part1 && group.part2
  const dateStr = group.sermonDate
    ? String(group.sermonDate).replace(/-/g, '. ')
    : ''
  const videoUrl = group.part1?.videoUrl ?? group.part2?.videoUrl
  const videoId  = extractVideoId(videoUrl)

  return (
    <article
      className="group flex flex-col bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all duration-200 overflow-hidden relative cursor-pointer"
      onClick={() => navigate(`/worship/sermon/sunday-morning/${group.sermonDate}`)}
    >
      {/* 관리자 버튼 */}
      {canEdit && (
        <div
          className="absolute top-3 right-3 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEditGroup(group)}
            className="px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:border-slate-700 hover:text-slate-900 shadow-sm transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => onDeleteGroup(group)}
            className="px-2.5 py-1.5 text-xs font-medium bg-white border border-red-200 text-red-500 hover:border-red-500 hover:text-red-600 shadow-sm transition-colors"
          >
            삭제
          </button>
        </div>
      )}

      {/* 썸네일 */}
      <div className="aspect-video bg-slate-100 overflow-hidden">
        {videoId ? (
          <img
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            alt={group.representativeTitle ?? ''}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
        )}
      </div>

      {/* 날짜 헤더 */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <p className="text-xs font-medium tracking-[0.2em] text-slate-400 uppercase mb-1">
          주일오전예배
        </p>
        <p className="text-sm font-mono text-slate-500">{dateStr}</p>
      </div>

      {/* 설교 정보 */}
      <div className="flex-1 px-6 py-5">
        <h3 className="text-lg font-medium text-slate-900 mb-3 group-hover:text-slate-600 transition-colors leading-snug line-clamp-2">
          {group.representativeTitle ?? '(제목 없음)'}
        </h3>
        {group.representativePreacher && (
          <p className="text-sm text-slate-500 mb-4">{group.representativePreacher}</p>
        )}
        <div className="flex gap-2 mt-auto">
          {group.part1 && (
            <span className="px-2.5 py-1 text-xs font-medium bg-slate-900 text-white">1부</span>
          )}
          {group.part2 && (
            <span className="px-2.5 py-1 text-xs font-medium bg-slate-600 text-white">2부</span>
          )}
          {!hasBoth && (
            <span className="text-xs text-slate-400 self-center">
              {group.part1 ? '1부만 등록됨' : '2부만 등록됨'}
            </span>
          )}
        </div>
      </div>

      {/* 화살표 */}
      <div className="px-6 pb-5 flex justify-end">
        <span className="text-slate-300 group-hover:text-slate-600 transition-colors text-lg">→</span>
      </div>
    </article>
  )
}

// ── 페이지 ───────────────────────────────────────────────────────────────────
const SundayMorningPage = () => {
  const [page, setPage] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editGroup, setEditGroup] = useState(null)

  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn } = useAuthStore()
  const canWrite = isAdminOrOperatorFn()
  const isAdmin  = isAdminFn()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['sermons', 'sunday-morning', 'grouped', page],
    queryFn: () => getSundayMorningGroupedData({ page }),
    placeholderData: (prev) => prev,
  })

  const openCreate = () => { setEditGroup(null); setIsModalOpen(true) }
  const openEdit   = (group) => { setEditGroup(group); setIsModalOpen(true) }
  const closeModal = () => setIsModalOpen(false)

  // 그룹 삭제 (1부·2부 동시 삭제)
  const deleteGroupMutation = useMutation({
    mutationFn: async (group) => {
      if (group.part1) await deleteSermon(group.part1.id)
      if (group.part2) await deleteSermon(group.part2.id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sermons', 'sunday-morning', 'grouped'] }),
  })

  const handleDeleteGroup = (group) => {
    const title = group.representativeTitle ?? group.part1?.title ?? group.part2?.title
    if (!confirm(`${group.sermonDate} "${title}" 설교(1·2부)를 모두 삭제하시겠습니까?`)) return
    deleteGroupMutation.mutate(group)
  }

  return (
    <>
      <PageHero eyebrow="Sunday Morning Service" title="주일오전 예배"
        bgImage="/images/bg-worship.jpg">
        {canWrite && (
          <Button variant="secondary" size="sm" onClick={openCreate}
            className="border-white text-white hover:bg-white hover:text-slate-900">
            + 설교 등록
          </Button>
        )}
      </PageHero>

      {/* YouTube 최신 섹션 */}
      {data && (
        <YoutubeLatestSection
          youtubeVideos={data.youtubeVideos}
          latestSermon={(() => {
            const rep = data.latestGroup?.part2 ?? data.latestGroup?.part1
            return rep?.id
              ? { ...rep, detailPath: `/worship/sermon/sunday-morning/${data.latestGroup.sermonDate}` }
              : null
          })()}
          title="주일오전 최신 설교"
        />
      )}

      {/* 날짜 기반 목록 */}
      <section className="py-16 bg-slate-50 px-6">
        <div className="max-w-6xl mx-auto">
          {isLoading && <SkeletonGrid count={6} />}
          {error && <ErrorMessage error={error} fallback="설교 목록을 불러올 수 없습니다." />}
          {data && !isLoading && (
            <>
              {data.groups.length === 0 ? (
                <p className="text-center text-slate-500 py-20">등록된 설교가 없습니다.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.groups.map((group) => (
                    <GroupCard
                      key={group.sermonDate}
                      group={group}
                      canEdit={canWrite && isAdmin}
                      onEditGroup={openEdit}
                      onDeleteGroup={handleDeleteGroup}
                    />
                  ))}
                </div>
              )}
              <SermonPagination
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </section>

      {/* 등록/수정 모달 (1부·2부 통합) */}
      <SundayMorningModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editGroup={editGroup}
      />
    </>
  )
}

export default SundayMorningPage
