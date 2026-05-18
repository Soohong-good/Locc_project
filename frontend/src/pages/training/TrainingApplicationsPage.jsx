import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTrainingDetail, getApplicationsByTraining, cancelApplication, downloadApplicationsExcel } from '@/api/training'
import { SkeletonRow } from '@/components/ui/SkeletonCard'
import toast from '@/utils/toast'

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

// 삭제 확인 모달
const DeleteModal = ({ name, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white w-full max-w-sm shadow-2xl">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-medium text-slate-900">신청 취소</h2>
            <p className="text-xs text-slate-500 mt-0.5">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4">
        <p className="text-slate-600 text-sm">
          <span className="font-semibold text-slate-900">{name}</span>님의 신청을 취소하시겠습니까?
        </p>
      </div>
      <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
        <button onClick={onClose} className="px-5 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition">
          돌아가기
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition disabled:opacity-60">
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

  return (
    <main>
      {/* Hero */}
      <section className="pt-page pb-12 bg-slate-900 px-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(`/training/${id}`)}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-light tracking-wide">훈련 상세로</span>
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-4">Applications</p>
              <h1 className="text-4xl md:text-5xl font-light text-white leading-tight tracking-tight mb-3">
                {training?.title ?? '신청자 명단'}
              </h1>
              <p className="text-slate-400 font-light">신청자 명단</p>
            </div>

            {/* 엑셀 다운로드 */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{downloading ? '다운로드 중...' : '엑셀 다운로드'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 목록 */}
      <section className="py-12 bg-white px-6">
        <div className="max-w-6xl mx-auto">

          {/* 통계 카드 */}
          <div className="mb-8 p-6 bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">총 신청자</p>
            <p className="text-2xl font-medium text-slate-900">{totalCount}명</p>
          </div>

          {isLoading && (
            <div className="space-y-0 border-t border-slate-200">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          )}

          {!isLoading && items.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500">신청자가 없습니다.</p>
            </div>
          )}

          {!isLoading && items.length > 0 && (
            <>
              {/* 헤더 */}
              <div className="hidden md:grid grid-cols-12 gap-6 py-4 px-6 border-b border-slate-300 text-sm font-medium text-slate-700">
                <div className="col-span-1 text-center">번호</div>
                <div className="col-span-3">이름</div>
                <div className="col-span-3">연락처</div>
                <div className="col-span-2">납부방법</div>
                <div className="col-span-2">신청일</div>
                <div className="col-span-1"></div>
              </div>

              {/* 행 */}
              {items.map((app, idx) => (
                <div
                  key={app.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 py-5 px-6 border-b border-slate-100 hover:bg-slate-50 transition items-center"
                >
                  <div className="col-span-1 text-center text-sm text-slate-500">
                    {currentPage * 50 + idx + 1}
                  </div>
                  <div className="col-span-3 font-medium text-slate-900">
                    {app.userName}
                  </div>
                  <div className="col-span-3 text-sm text-slate-600">
                    {app.phone}
                  </div>
                  <div className="col-span-2 text-sm text-slate-600">
                    {paymentLabel(app.paymentMethod)}
                  </div>
                  <div className="col-span-2 text-sm text-slate-500">
                    {fmtDateTime(app.appliedAt)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => setDeleteTarget({ id: app.id, name: app.userName })}
                      className="px-3 py-1.5 border border-red-300 text-red-600 hover:border-red-500 hover:bg-red-50 transition text-xs"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ))}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {currentPage > 0 && (
                    <button onClick={() => setPage(currentPage - 1)}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 transition text-sm">
                      이전
                    </button>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => setPage(i)}
                      className={`px-4 py-2 border border-slate-300 transition text-sm ${
                        i === currentPage ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                      }`}>
                      {i + 1}
                    </button>
                  ))}
                  {currentPage < totalPages - 1 && (
                    <button onClick={() => setPage(currentPage + 1)}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 transition text-sm">
                      다음
                    </button>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </section>

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => cancelMutation.mutate(deleteTarget.id)}
          loading={cancelMutation.isPending}
        />
      )}
    </main>
  )
}

export default TrainingApplicationsPage
