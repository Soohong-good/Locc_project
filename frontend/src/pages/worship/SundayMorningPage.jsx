import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSundayMorningGroupedData } from '@/api/sermons'
import useAuthStore from '@/stores/authStore'
import useSermonCrud from '@/hooks/useSermonCrud'
import YoutubeLatestSection from '@/components/sermon/YoutubeLatestSection'
import SermonPagination from '@/components/sermon/SermonPagination'
import SermonModal from '@/components/sermon/SermonModal'
import SermonDeleteModal from '@/components/sermon/SermonDeleteModal'
import Button from '@/components/ui/Button'
import PageHero from '@/components/ui/PageHero'
import SkeletonGrid from '@/components/ui/SkeletonCard'
import ErrorMessage from '@/components/common/ErrorMessage'

const SERVICE_NUMBER_OPTIONS = [
  { value: 1, label: '1부 예배' },
  { value: 2, label: '2부 예배' },
]

const extractVideoId = (url) => {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0]
    return u.searchParams.get('v') || null
  } catch { return null }
}

// ── 날짜 카드 ────────────────────────────────────────────────────────────────
const GroupCard = ({ group }) => {
  const hasBoth = group.part1 && group.part2
  const dateStr = group.sermonDate
    ? String(group.sermonDate).replace(/-/g, '. ')
    : ''
  const videoUrl = group.part1?.videoUrl ?? group.part2?.videoUrl
  const videoId  = extractVideoId(videoUrl)

  return (
    <Link
      to={`/worship/sermon/sunday-morning/${group.sermonDate}`}
      className="group flex flex-col bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
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
        {/* 제목 */}
        <h3 className="text-lg font-medium text-slate-900 mb-3 group-hover:text-slate-600 transition-colors leading-snug line-clamp-2">
          {group.representativeTitle ?? '(제목 없음)'}
        </h3>

        {/* 설교자 */}
        {group.representativePreacher && (
          <p className="text-sm text-slate-500 mb-4">{group.representativePreacher}</p>
        )}

        {/* 1부/2부 뱃지 */}
        <div className="flex gap-2 mt-auto">
          {group.part1 && (
            <span className="px-2.5 py-1 text-xs font-medium bg-slate-900 text-white">
              1부
            </span>
          )}
          {group.part2 && (
            <span className="px-2.5 py-1 text-xs font-medium bg-slate-600 text-white">
              2부
            </span>
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
    </Link>
  )
}

// ── 페이지 ───────────────────────────────────────────────────────────────────
const SundayMorningPage = () => {
  const [page, setPage] = useState(0)
  const { isAdminOrOperator: isAdminOrOperatorFn } = useAuthStore()
  const canWrite = isAdminOrOperatorFn()

  const queryKey = ['sermons', 'sunday-morning', 'grouped', page]

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getSundayMorningGroupedData({ page }),
    placeholderData: (prev) => prev,
  })

  // 등록/수정/삭제 시 그룹 목록 전체 invalidate (page 무관)
  const crud = useSermonCrud([['sermons', 'sunday-morning', 'grouped']])

  return (
    <>
      <PageHero eyebrow="Sunday Morning Service" title="주일오전 예배"
        bgImage="/images/bg-worship.jpg">
        {canWrite && (
          <Button variant="secondary" size="sm" onClick={crud.openCreate}
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
                    <GroupCard key={group.sermonDate} group={group} />
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

      {/* 등록 모달 */}
      <SermonModal
        isOpen={crud.isModalOpen}
        onClose={crud.closeModal}
        onSave={crud.handleSave}
        isSaving={crud.isSaving}
        isLoadingDetail={crud.isLoadingDetail}
        editTarget={crud.editTarget}
        fixedCategory="주일오전"
        serviceNumberOptions={SERVICE_NUMBER_OPTIONS}
        defaultServiceNumber={1}
      />

      {/* 삭제 모달 */}
      <SermonDeleteModal
        target={crud.deleteTarget}
        onCancel={() => crud.setDeleteTarget(null)}
        onConfirm={crud.handleDeleteConfirm}
        isDeleting={crud.isDeleting}
      />
    </>
  )
}

export default SundayMorningPage
