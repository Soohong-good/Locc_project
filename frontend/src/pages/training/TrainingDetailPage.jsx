import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTrainingDetail, deleteTraining, closeTraining } from '@/api/training'
import useAuthStore from '@/stores/authStore'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import TrainingFormModal from './TrainingFormModal'
import toast from '@/utils/toast'

const fmtDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, '0')}월 ${String(d.getDate()).padStart(2, '0')}일`
}

const fmtDateTime = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, '0')}월 ${String(d.getDate()).padStart(2, '0')}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const fmtNumber = (n) => n?.toLocaleString('ko-KR') ?? '0'

// 삭제 확인 모달
const DeleteModal = ({ title, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white w-full max-w-md shadow-2xl">
      <div className="px-8 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-medium text-slate-900">훈련 삭제</h2>
            <p className="text-sm text-slate-500 mt-0.5 font-light">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>
      </div>
      <div className="px-8 py-6">
        <p className="text-slate-600 mb-3 font-light">이 훈련을 삭제하시겠습니까?</p>
        <p className="font-medium text-slate-900 bg-slate-50 px-4 py-3">{title}</p>
      </div>
      <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
        <button onClick={onClose} className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium transition">취소</button>
        <button onClick={onConfirm} disabled={loading}
          className="px-8 py-2.5 bg-red-600 text-white hover:bg-red-700 font-medium transition disabled:opacity-60">
          {loading ? '삭제 중...' : '삭제하기'}
        </button>
      </div>
    </div>
  </div>
)

const TrainingDetailPage = () => {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const queryClient = useQueryClient()
  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn, getUserId, user } = useAuthStore()
  const canWrite = isAdminOrOperatorFn()
  const isAdmin  = isAdminFn()
  const userId   = getUserId()
  const loggedIn = !!user

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen,   setEditOpen]   = useState(false)

  const { data: training, isLoading, isError } = useQuery({
    queryKey: ['training-detail', id],
    queryFn:  () => getTrainingDetail(id),
    retry: false,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTraining(id),
    onSuccess: () => {
      navigate('/training')
    },
    onError: () => toast.error('삭제에 실패했습니다.'),
  })

  const closeMutation = useMutation({
    mutationFn: () => closeTraining(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training-detail', id] }),
    onError: () => toast.error('마감 처리에 실패했습니다.'),
  })

  if (isLoading) return <LoadingSpinner />

  if (isError || !training) return (
    <main className="pt-page px-6 text-center">
      <p className="text-slate-500 mb-4">훈련 정보를 찾을 수 없습니다.</p>
      <button onClick={() => navigate('/training')}
        className="px-6 py-3 bg-slate-900 text-white hover:bg-slate-800 transition">
        목록으로
      </button>
    </main>
  )

  const isOpen = training.status === 'OPEN'

  return (
    <main>
      {/* Hero */}
      <section className="pt-page pb-12 bg-slate-900 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/training')}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-light tracking-wide">목록으로</span>
          </button>

          {/* 상태 배지 */}
          <div className="flex items-center gap-3 mb-4">
            {isOpen
              ? <span className="px-4 py-1.5 bg-green-900/50 text-green-400 text-sm font-medium border border-green-800">신청가능</span>
              : <span className="px-4 py-1.5 bg-slate-800 text-slate-400 text-sm font-medium border border-slate-700">마감</span>
            }
            {training.trainingFee === 0 && (
              <span className="px-4 py-1.5 bg-blue-900/50 text-blue-400 text-sm font-medium border border-blue-800">무료</span>
            )}
          </div>

          <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-4">Training</p>
          <h1 className="text-3xl md:text-4xl font-light text-white leading-tight tracking-tight">{training.title}</h1>
        </div>
      </section>

      {/* 본문 */}
      <section className="py-12 bg-white px-6">
        <div className="max-w-4xl mx-auto">

          {/* 훈련 정보 */}
          <div className="bg-slate-50 border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-medium text-slate-900 mb-4">훈련 정보</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {/* 기간 */}
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-slate-600 mb-1">훈련 기간</p>
                  <p className="text-slate-900 font-medium">
                    {fmtDate(training.startDate)} ~ {fmtDate(training.endDate)}
                  </p>
                </div>
              </div>
              {/* 신청 마감 */}
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-slate-600 mb-1">신청 마감</p>
                  <p className="text-slate-900 font-medium">{fmtDateTime(training.applicationDeadline)}</p>
                </div>
              </div>
              {/* 훈련비 */}
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-slate-600 mb-1">훈련비</p>
                  {training.trainingFee > 0
                    ? <p className="text-slate-900 font-medium">{fmtNumber(training.trainingFee)}원</p>
                    : <p className="text-green-600 font-medium">무료</p>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* 훈련 설명 */}
          {training.description && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-slate-900 mb-4">훈련 소개</h2>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {training.description}
              </div>
            </div>
          )}

          {/* 신청 버튼 */}
          {training.canApply && (
            <div className="flex gap-3 justify-center py-8 border-t border-slate-200">
              {loggedIn
                ? (
                  <button
                    onClick={() => navigate(`/training/${id}/apply`)}
                    className="px-8 py-3 bg-blue-600 text-white hover:bg-blue-700 transition font-medium text-lg"
                  >
                    신청하기
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-3 bg-blue-600 text-white hover:bg-blue-700 transition font-medium text-lg"
                  >
                    로그인 후 신청
                  </button>
                )
              }
            </div>
          )}

          {/* 마감 메시지 */}
          {!training.canApply && (
            <div className="text-center py-8 border-t border-slate-200">
              <p className="text-slate-600">신청이 마감되었습니다.</p>
            </div>
          )}

          {/* 관리자 버튼 */}
          {canWrite && (isAdmin || training?.creatorId === userId) && (
            <div className="flex gap-3 justify-center pt-6 border-t border-slate-200">
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate(`/training/${id}/applications`)}
                    className="px-6 py-2 bg-slate-900 text-white hover:bg-slate-800 transition"
                  >
                    신청자 명단
                  </button>
                  {isOpen && (
                    <button
                      onClick={() => { if (window.confirm('훈련을 마감하시겠습니까?')) closeMutation.mutate() }}
                      disabled={closeMutation.isPending}
                      className="px-6 py-2 border border-amber-400 text-amber-600 hover:border-amber-600 transition disabled:opacity-50"
                    >
                      신청 마감
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => setEditOpen(true)}
                className="px-6 py-2 border border-slate-300 hover:border-slate-900 transition text-slate-700 hover:text-slate-900"
              >
                수정
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="px-6 py-2 border border-red-300 hover:border-red-500 transition text-red-600 hover:text-red-700"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </section>

      {editOpen && (
        <TrainingFormModal
          detail={training}
          onClose={() => setEditOpen(false)}
        />
      )}

      {deleteOpen && (
        <DeleteModal
          title={training.title}
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => deleteMutation.mutate()}
          loading={deleteMutation.isPending}
        />
      )}
    </main>
  )
}

export default TrainingDetailPage
