import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTrainingDetail, getApplicationsByTraining, cancelApplication, downloadApplicationsExcel } from '@/api/training'
import { SkeletonRow } from '@/components/ui/SkeletonCard'
import toast from '@/utils/toast'
import { ArrowLeft, DownloadSimple, CaretLeft, CaretRight, Warning } from '@phosphor-icons/react'

const PAGE_SIZE = 50
const PAGE_WINDOW = 5

const fmtDateTime = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const paymentLabel = (method) => {
  if (method === 'CASH') return '현금납부'
  if (method === 'BANK') return '계좌이체'
  return '-'
}

const getPageRange = (current, total) => {
  if (total <= PAGE_WINDOW) return Array.from({ length: total }, (_, i) => i)
  let start = Math.max(0, current - Math.floor(PAGE_WINDOW / 2))
  const end = Math.min(total, start + PAGE_WINDOW)
  start = Math.max(0, end - PAGE_WINDOW)
  return Array.from({ length: PAGE_WINDOW }, (_, i) => start + i)
}

// 삭제(취소) 확인 모달
const DeleteModal = ({ name, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-[#171717]/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-[#FAF9F6] w-full max-w-md border border-[#E5E5E5]">
      <div className="px-8 py-6 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <Warning size={24} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-[#171717]">신청 취소</h2>
            <p className="text-sm text-[#737373] mt-0.5 font-light">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>
      </div>
      <div className="px-8 py-6">
        <p className="text-[#2C2C2C] break-keep">
          <span className="font-semibold text-[#171717]">{name}</span>님의 신청을 취소하시겠습니까?
        </p>
      </div>
      <div className="flex items-center justify-end gap-3 px-8 py-6 bg-[#F4F2EA] border-t border-[#E5E5E5]">
        <button onClick={onClose} className="px-6 py-2.5 text-[#2C2C2C] hover:text-[#171717] text-sm font-medium transition">
          돌아가기
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="px-8 py-2.5 bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition disabled:opacity-60">
          {loading ? '취소 중...' : '신청 취소'}
        </button>
      </div>
    </div>
  </div>
)

const TrainingApplicationsPage = () => {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const [page,        setPage]        = useState(0)
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, name }
  const [downloading, setDownloading] = useState(false)

  // 훈련 정보
  const { data: training } = useQuery({
    queryKey: ['training-detail', id],
    queryFn:  () => getTrainingDetail(id),
  })

  // 신청자 목록
  const { data, isLoading } = useQuery({
    queryKey: ['training-applications', id, page],
    queryFn:  () => getApplicationsByTraining(id, page),
  })

  const items       = data?.content      ?? []
  const pageInfo    = data?.pageInfo      ?? {}
  const totalPages  = pageInfo.totalPages ?? 0
  const currentPage = pageInfo.page       ?? 0
  const totalCount  = pageInfo.totalElements ?? 0

  const cancelMutation = useMutation({
    mutationFn: (appId) => cancelApplication(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-applications', id] })
      setDeleteTarget(null)
    },
    onError: () => toast.error('취소에 실패했습니다.'),
  })

  const handleDownload = async () => {
    try {
      setDownloading(true)
      await downloadApplicationsExcel(id)
    } catch {
      toast.error('엑셀 다운로드에 실패했습니다.')
    } finally {
      setDownloading(false)
    }
  }

  const goPage = (p) => {
    if (p < 0 || p >= totalPages) return
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero */}
      <section className="pt-20 bg-[#171717] text-[#FAF9F6] border-b border-[#2C2C2C]">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <button
            onClick={() => navigate(`/training/${id}`)}
            className="inline-flex items-center gap-2 text-[#737373] hover:text-[#FAF9F6] mb-8 transition-colors group"
          >
            <ArrowLeft size={18} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold tracking-[0.1em]">훈련 상세로</span>
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <span className="font-mono text-xs tracking-[0.25em] uppercase text-[#737373] mb-4 block">Applications</span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight break-keep">
                {training?.title ?? '신청자 명단'}
              </h1>
            </div>

            {/* 엑셀 다운로드 */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-shrink-0 inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase bg-[#FAF9F6] text-[#171717] px-6 py-3 hover:bg-white transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              <DownloadSimple size={16} weight="bold" />
              <span>{downloading ? '다운로드 중...' : '엑셀 다운로드'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 목록 */}
      <main className="max-w-[1200px] mx-auto px-6 pt-14 md:pt-20 pb-32">

        {/* 통계 */}
        <div className="mb-8 p-6 bg-[#F4F2EA] border border-[#E5E5E5]">
          <p className="text-sm text-[#737373] mb-1">총 신청자</p>
          <p className="text-2xl font-bold text-[#171717]">{totalCount}명</p>
        </div>

        <div className="h-px w-full bg-[#171717]" />
        <div className="hidden md:grid grid-cols-12 gap-6 px-4 py-3 border-b border-[#E5E5E5] text-[11px] font-mono text-[#A3A3A3] uppercase tracking-widest">
          <div className="col-span-1 text-center">No.</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Phone</div>
          <div className="col-span-2">Payment</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1"></div>
        </div>

        {isLoading && (
          <div className="space-y-0">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="py-32 text-center text-sm text-[#737373]">신청자가 없습니다.</div>
        )}

        {!isLoading && items.length > 0 && (
          <>
            {items.map((app, idx) => (
              <div
                key={app.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 px-4 py-5 border-b border-[#E5E5E5] hover:bg-[#F4F2EA] transition-colors items-center"
              >
                <div className="col-span-1 text-center font-mono text-sm text-[#737373]">
                  {currentPage * PAGE_SIZE + idx + 1}
                </div>
                <div className="col-span-3 font-medium text-[#171717]">
                  {app.userName}
                </div>
                <div className="col-span-3 text-sm text-[#2C2C2C]">
                  {app.phone}
                </div>
                <div className="col-span-2 text-sm text-[#2C2C2C]">
                  {paymentLabel(app.paymentMethod)}
                </div>
                <div className="col-span-2 font-mono text-sm text-[#737373]">
                  {fmtDateTime(app.appliedAt)}
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => setDeleteTarget({ id: app.id, name: app.userName })}
                    className="px-3 py-1.5 border border-[#E5E5E5] text-red-500 hover:border-red-500 transition-colors text-xs font-bold tracking-[0.05em] uppercase"
                  >
                    취소
                  </button>
                </div>
              </div>
            ))}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center">
                <nav className="inline-flex border border-[#E5E5E5]">
                  <button onClick={() => goPage(currentPage - 1)} disabled={currentPage === 0}
                    className="w-10 h-10 flex items-center justify-center border-r border-[#E5E5E5] text-[#737373] hover:bg-[#F4F2EA] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <CaretLeft size={14} weight="bold" />
                  </button>
                  {getPageRange(currentPage, totalPages).map((p) => (
                    <button key={p} onClick={() => goPage(p)}
                      className={`w-10 h-10 flex items-center justify-center border-r border-[#E5E5E5] font-mono text-sm transition-colors ${
                        p === currentPage ? 'bg-[#171717] text-white' : 'text-[#737373] hover:bg-[#F4F2EA] hover:text-[#171717]'
                      }`}>
                      {p + 1}
                    </button>
                  ))}
                  <button onClick={() => goPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}
                    className="w-10 h-10 flex items-center justify-center text-[#737373] hover:bg-[#F4F2EA] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <CaretRight size={14} weight="bold" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

      </main>

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => cancelMutation.mutate(deleteTarget.id)}
          loading={cancelMutation.isPending}
        />
      )}
    </div>
  )
}

export default TrainingApplicationsPage
