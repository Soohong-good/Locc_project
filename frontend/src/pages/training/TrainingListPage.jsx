import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTrainingList } from '@/api/training'
import useAuthStore from '@/stores/authStore'
import { CalendarBlank, Clock, CaretLeft, CaretRight } from '@phosphor-icons/react'
import TrainingFormModal from './TrainingFormModal'
import { getPageRange } from '@/utils/pagination'
import { formatDateDot as fmtDate } from '@/utils/dateFormat'

const fmtDateTime = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ── 상태 배지 ────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) =>
  status === 'OPEN' ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 flex-shrink-0 border border-[#16A34A]/40 text-[#16A34A]">
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      신청가능
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 border border-[#E5E5E5] text-[#A3A3A3] flex-shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      마감
    </span>
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
  const totalElem   = pageInfo.totalElements ?? 0
  const currentPage = pageInfo.page        ?? 0
  const pageSize    = pageInfo.size        ?? items.length

  const goPage = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero */}
      <section className="pt-20 bg-[#171717] text-[#FAF9F6] border-b border-[#2C2C2C] relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/bg-training.jpg')" }} />
        <div className="absolute inset-0" style={{ background: 'rgba(23,23,23,0.75)' }} />
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-8 md:py-16 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-5 md:gap-8">
          <div>
            <span className="font-mono text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.25em] uppercase text-[#737373] mb-2 md:mb-4 block">Training</span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight break-keep">훈련신청</h1>
          </div>
          <div className="flex items-center flex-wrap gap-3">
            {user && (
              <button
                onClick={() => navigate('/training/my')}
                className="text-xs font-bold tracking-[0.1em] uppercase border border-[#737373] text-[#FAF9F6] px-6 py-2.5 hover:border-[#FAF9F6] transition-colors"
              >
                내 신청내역
              </button>
            )}
            {canWrite && (
              <button
                onClick={() => setCreateOpen(true)}
                className="text-xs font-bold tracking-[0.1em] uppercase bg-[#FAF9F6] text-[#171717] px-6 py-2.5 hover:bg-white transition-colors"
              >
                + 새 훈련 등록
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Table */}
      <main className="max-w-[1200px] mx-auto px-6 pt-14 md:pt-20 pb-32">
        <div className="h-px w-full bg-[#171717]" />
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
          <span className="text-[11px] font-mono text-[#A3A3A3] uppercase tracking-widest">훈련 목록</span>
          <span className="text-[11px] font-mono text-[#A3A3A3] uppercase tracking-widest">총 {totalElem}건</span>
        </div>
        <div className="hidden md:grid grid-cols-[60px_1fr_auto_auto] gap-4 px-4 py-3 border-b border-[#E5E5E5] text-[11px] font-mono text-[#A3A3A3] uppercase tracking-widest">
          <div>No.</div>
          <div>Title</div>
          <div className="text-right w-44">Period</div>
          <div className="text-right w-24">Status</div>
        </div>

        {isLoading && (
          <div className="py-32 text-center font-mono text-sm text-[#737373] tracking-wider">불러오는 중...</div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="py-32 text-center text-sm text-[#737373]">등록된 훈련이 없습니다.</div>
        )}

        {!isLoading && items.map((t, idx) => (
          <div
            key={t.id}
            onClick={() => navigate(`/training/${t.id}`)}
            className="flex flex-col gap-1.5 md:grid md:grid-cols-[60px_1fr_auto_auto] md:gap-4 px-4 py-4 md:py-5 border-b border-[#E5E5E5] hover:bg-[#F4F2EA] transition-colors md:items-center cursor-pointer group"
          >
            <div className="hidden md:block font-mono text-sm text-[#737373]">
              {totalElem - currentPage * pageSize - idx}
            </div>
            <div className="min-w-0">
              <p className="text-base font-medium text-[#2C2C2C] truncate group-hover:text-[#171717] transition-colors break-keep">
                {t.title}
              </p>
              {t.description && (
                <p className="text-sm text-[#737373] mt-1 truncate break-keep">{t.description}</p>
              )}
              {t.applicationDeadline && (
                <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3] mt-1.5">
                  <Clock size={12} />
                  <span className="font-mono tabular-nums">마감 {fmtDateTime(t.applicationDeadline)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 md:contents">
              <div className="flex items-center gap-1.5 text-sm text-[#737373] md:w-44 md:justify-end md:text-right">
                <CalendarBlank size={14} className="flex-shrink-0" />
                <span className="font-mono tabular-nums">{fmtDate(t.startDate)} – {fmtDate(t.endDate)}</span>
              </div>
              <div className="md:w-24 flex md:justify-end">
                <StatusBadge status={t.status} />
              </div>
            </div>
          </div>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center">
            <nav className="inline-flex border border-[#E5E5E5]">
              <button onClick={() => goPage(currentPage - 1)} disabled={currentPage === 0}
                className="w-11 h-11 flex items-center justify-center border-r border-[#E5E5E5] text-[#737373] hover:bg-[#F4F2EA] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <CaretLeft size={14} weight="bold" />
              </button>
              {getPageRange(currentPage, totalPages).map((p) => (
                <button key={p} onClick={() => goPage(p)}
                  className={`w-11 h-11 flex items-center justify-center border-r border-[#E5E5E5] font-mono text-sm transition-colors ${
                    p === currentPage ? 'bg-[#171717] text-white' : 'text-[#737373] hover:bg-[#F4F2EA] hover:text-[#171717]'
                  }`}>
                  {p + 1}
                </button>
              ))}
              <button onClick={() => goPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}
                className="w-11 h-11 flex items-center justify-center text-[#737373] hover:bg-[#F4F2EA] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <CaretRight size={14} weight="bold" />
              </button>
            </nav>
          </div>
        )}
      </main>

      {createOpen && (
        <TrainingFormModal onClose={() => setCreateOpen(false)} />
      )}
    </div>
  )
}

export default TrainingListPage
