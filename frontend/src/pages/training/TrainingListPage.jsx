import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTrainingList } from '@/api/training'
import useAuthStore from '@/stores/authStore'
import Button from '@/components/ui/Button'
import PageHero from '@/components/ui/PageHero'
import TrainingFormModal from './TrainingFormModal'

const fmtDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const fmtDateTime = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ── 상태 배지 ────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) =>
  status === 'OPEN' ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 flex-shrink-0 border border-emerald-300 text-emerald-600">
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      신청가능
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 border border-slate-200 text-slate-400 flex-shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      마감
    </span>
  )

// ── 훈련 카드 ────────────────────────────────────────────────────────────────
const TrainingCard = ({ training, onClick }) => (
  <article
    onClick={onClick}
    className="group cursor-pointer bg-white border border-slate-200 hover:border-slate-400
               transition-all duration-200 hover:shadow-md"
  >
    <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* 왼쪽: 상태 + 제목 */}
      <div className="flex-1 min-w-0">
        <div className="mb-2.5">
          <StatusBadge status={training.status} />
        </div>
        <h3 className="text-base md:text-lg font-medium text-slate-900 group-hover:text-slate-700
                       transition-colors leading-snug">
          {training.title}
        </h3>
        {training.description && (
          <p className="text-sm text-slate-500 mt-1 font-light line-clamp-1">
            {training.description}
          </p>
        )}
      </div>

      {/* 오른쪽: 메타 정보 */}
      <div className="flex sm:flex-col items-start sm:items-end gap-4 sm:gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor"
               strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span className="font-light tabular-nums">
            {fmtDate(training.startDate)} – {fmtDate(training.endDate)}
          </span>
        </div>
        {training.applicationDeadline && (
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor"
                 strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="font-light tabular-nums">
              마감 {fmtDateTime(training.applicationDeadline)}
            </span>
          </div>
        )}
      </div>

      {/* 화살표 */}
      <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1
                      transition-all duration-200 flex-shrink-0 hidden sm:block"
           fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 18l6-6-6-6"/>
      </svg>
    </div>
  </article>
)

// ── 스켈레톤 ─────────────────────────────────────────────────────────────────
const TrainingCardSkeleton = () => (
  <div className="bg-white border border-slate-100 p-6 animate-pulse">
    <div className="h-5 w-14 bg-slate-100 rounded mb-3" />
    <div className="h-5 w-2/3 bg-slate-100 rounded mb-2" />
    <div className="h-4 w-1/3 bg-slate-100 rounded" />
  </div>
)

// ── 메인 ─────────────────────────────────────────────────────────────────────
const TrainingListPage = () => {
  const navigate  = useNavigate()
  const [page, setPage] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)

  const { isAdminOrOperator: isAdminOrOperatorFn, user } = useAuthStore()
  const canWrite = isAdminOrOperatorFn()

  const { data, isLoading } = useQuery({
    queryKey: ['training-list', page],
    queryFn:  () => getTrainingList(page),
  })

  const items       = data?.content       ?? []
  const pageInfo    = data?.pageInfo       ?? {}
  const totalPages  = pageInfo.totalPages  ?? 0
  const currentPage = pageInfo.page        ?? 0

  return (
    <>
      <main>
        {/* Hero */}
        <PageHero
          eyebrow="Training"
          title="훈련신청"
          subtitle="교회 훈련 프로그램에 신청하세요"
        >
          <div className="flex items-center gap-3">
            {user && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/training/my')}
                className="border-white text-white hover:bg-white hover:text-slate-900"
              >
                내 신청내역
              </Button>
            )}
            {canWrite && (
              <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
                + 새 훈련 등록
              </Button>
            )}
          </div>
        </PageHero>

        {/* 목록 */}
        <section className="py-16 bg-white px-6">
          <div className="max-w-4xl mx-auto">

            {isLoading && (
              <div className="flex flex-col gap-3">
                {[...Array(4)].map((_, i) => <TrainingCardSkeleton key={i} />)}
              </div>
            )}

            {!isLoading && items.length === 0 && (
              <div className="text-center py-24">
                <svg className="w-14 h-14 mx-auto text-slate-200 mb-4" fill="none"
                     stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                       M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-slate-400 font-light">등록된 훈련이 없습니다.</p>
              </div>
            )}

            {!isLoading && items.length > 0 && (
              <>
                <div className="flex flex-col gap-3">
                  {items.map((t) => (
                    <TrainingCard
                      key={t.id}
                      training={t}
                      onClick={() => navigate(`/training/${t.id}`)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-1">
                    <button
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="w-9 h-9 flex items-center justify-center border border-slate-200
                                 text-slate-500 hover:bg-slate-50 disabled:opacity-30
                                 disabled:cursor-not-allowed transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-9 h-9 text-sm font-light transition border
                          ${i === currentPage
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="w-9 h-9 flex items-center justify-center border border-slate-200
                                 text-slate-500 hover:bg-slate-50 disabled:opacity-30
                                 disabled:cursor-not-allowed transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {createOpen && (
        <TrainingFormModal onClose={() => setCreateOpen(false)} />
      )}
    </>
  )
}

export default TrainingListPage
