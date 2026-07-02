import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarBlank, Clock, Coins } from '@phosphor-icons/react'
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
    <div className="absolute inset-0 bg-[#171717]/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white w-full max-w-md shadow-2xl">
      <div className="px-8 py-6 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-medium text-[#171717]">훈련 삭제</h2>
            <p className="text-sm text-[#737373] mt-0.5 font-light">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>
      </div>
      <div className="px-8 py-6">
        <p className="text-[#737373] mb-3 font-light">이 훈련을 삭제하시겠습니까?</p>
        <p className="font-medium text-[#171717] bg-[#F4F2EA] px-4 py-3">{title}</p>
      </div>
      <div className="flex items-center justify-end gap-3 px-8 py-6 bg-[#F4F2EA] border-t border-[#E5E5E5]">
        <button onClick={onClose} className="px-6 py-2.5 text-[#2C2C2C] hover:text-[#171717] font-medium transition">취소</button>
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
    <main className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] min-h-screen pt-20 px-6 bg-[#FAF9F6] text-center">
      <p className="text-[#737373] mb-4 pt-16">훈련 정보를 찾을 수 없습니다.</p>
      <button onClick={() => navigate('/training')}
        className="px-6 py-3 bg-[#171717] text-[#FAF9F6] hover:bg-[#2C2C2C] transition">
        목록으로
      </button>
    </main>
  )

  const isOpen = training.status === 'OPEN'

  return (
    <main className="pt-20 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] flex flex-col min-h-[calc(100vh-5rem)]">

        {/* 헤더 */}
        <div className="p-8 md:p-16 lg:p-24 bg-[#FAF9F6]">
          <div className="mb-12 md:mb-16">
            <button
              onClick={() => navigate('/training')}
              className="inline-flex items-center gap-2 text-[#737373] hover:text-[#171717] transition-colors group"
            >
              <ArrowLeft size={20} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold tracking-[0.1em]">목록으로</span>
            </button>
          </div>

          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex gap-2">
                {isOpen
                  ? <span className="px-3 py-1.5 bg-[#171717] text-[#FAF9F6] text-xs font-bold tracking-[0.2em]">신청가능</span>
                  : <span className="px-3 py-1.5 border border-[#E5E5E5] text-[#737373] text-xs font-bold tracking-[0.2em] bg-[#F4F2EA]">마감</span>
                }
                {training.trainingFee === 0 && (
                  <span className="px-3 py-1.5 border border-[#E5E5E5] text-[#171717] text-xs font-bold tracking-[0.2em] bg-[#FAF9F6]">무료</span>
                )}
              </div>
              <span className="w-8 h-px bg-[#E5E5E5] hidden md:block" />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono">TRAINING</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#171717] leading-[1.1] break-keep">
              {training.title}
            </h1>
          </div>
        </div>

        {/* 훈련 정보 3분할 */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5E5E5] border-y border-[#E5E5E5] bg-[#F4F2EA]">
          <div className="p-8 md:p-12 lg:p-16 bg-[#FAF9F6] hover:bg-[#F4F2EA] transition-colors">
            <div className="flex items-center gap-2 mb-6">
              <CalendarBlank size={20} className="text-[#737373]" />
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-[#737373]">훈련 기간</h3>
            </div>
            <p className="text-[#171717] font-medium text-lg leading-relaxed break-keep">
              {fmtDate(training.startDate)} <br className="hidden md:block" />
              ~ {fmtDate(training.endDate)}
            </p>
          </div>

          <div className="p-8 md:p-12 lg:p-16 bg-[#FAF9F6] hover:bg-[#F4F2EA] transition-colors">
            <div className="flex items-center gap-2 mb-6">
              <Clock size={20} className="text-[#737373]" />
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-[#737373]">신청 마감</h3>
            </div>
            <p className="text-[#171717] font-medium text-lg leading-relaxed break-keep">
              {fmtDateTime(training.applicationDeadline)}
            </p>
          </div>

          <div className="p-8 md:p-12 lg:p-16 bg-[#FAF9F6] hover:bg-[#F4F2EA] transition-colors">
            <div className="flex items-center gap-2 mb-6">
              <Coins size={20} className="text-[#737373]" />
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-[#737373]">훈련비</h3>
            </div>
            {training.trainingFee > 0
              ? <p className="text-[#171717] font-medium text-lg leading-relaxed">{fmtNumber(training.trainingFee)}원</p>
              : <p className="text-[#171717] font-medium text-lg leading-relaxed">무료</p>
            }
          </div>
        </div>

        {/* 훈련 소개 */}
        {training.description && (
          <div className="p-8 md:p-16 lg:p-24 border-b border-[#E5E5E5] bg-[#FAF9F6] flex-grow">
            <div className="max-w-3xl mx-auto md:mx-0">
              <h2 className="text-xl font-bold mb-10 text-[#171717] flex items-center gap-4">
                훈련 소개
                <span className="flex-grow h-px bg-[#E5E5E5] hidden md:block" />
              </h2>
              <div className="text-[#737373] leading-relaxed font-light break-keep text-lg whitespace-pre-wrap">
                {training.description}
              </div>
            </div>
          </div>
        )}

        {/* 신청 버튼 / 마감 메시지 */}
        <div className="p-8 md:p-16 lg:p-24 border-b border-[#E5E5E5] bg-[#FAF9F6] flex justify-center">
          {training.canApply ? (
            loggedIn ? (
              <button
                onClick={() => navigate(`/training/${id}/apply`)}
                className="w-full md:w-auto bg-[#171717] text-[#FAF9F6] px-20 py-6 text-sm font-bold tracking-[0.2em] uppercase hover:bg-[#2C2C2C] transition-colors"
              >
                신청하기
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="w-full md:w-auto bg-[#171717] text-[#FAF9F6] px-20 py-6 text-sm font-bold tracking-[0.2em] uppercase hover:bg-[#2C2C2C] transition-colors"
              >
                로그인 후 신청
              </button>
            )
          ) : (
            <p className="text-[#737373] py-6">신청이 마감되었습니다.</p>
          )}
        </div>

        {/* 관리자 버튼 */}
        {canWrite && (isAdmin || training?.creatorId === userId) && (
          <div className="p-6 md:p-8 bg-[#F4F2EA] flex flex-wrap items-center justify-center gap-3">
            {isAdmin && (
              <>
                <button
                  onClick={() => navigate(`/training/${id}/applications`)}
                  className="border border-[#E5E5E5] bg-[#FAF9F6] px-6 py-2.5 text-xs font-bold tracking-[0.1em] text-[#737373] hover:text-[#171717] hover:border-[#171717] transition-all uppercase"
                >
                  신청자 명단
                </button>
                {isOpen && (
                  <button
                    onClick={() => { if (window.confirm('훈련을 마감하시겠습니까?')) closeMutation.mutate() }}
                    disabled={closeMutation.isPending}
                    className="border border-[#E5E5E5] bg-[#FAF9F6] px-6 py-2.5 text-xs font-bold tracking-[0.1em] text-[#737373] hover:text-[#171717] hover:border-[#171717] transition-all uppercase disabled:opacity-50"
                  >
                    신청 마감
                  </button>
                )}
                <div className="w-px h-4 bg-[#E5E5E5] mx-2 hidden sm:block" />
              </>
            )}
            <button
              onClick={() => setEditOpen(true)}
              className="border border-[#E5E5E5] bg-[#FAF9F6] px-6 py-2.5 text-xs font-bold tracking-[0.1em] text-[#737373] hover:text-[#171717] hover:border-[#171717] transition-all uppercase"
            >
              수정
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="border border-[#E5E5E5] bg-[#FAF9F6] px-6 py-2.5 text-xs font-bold tracking-[0.1em] text-red-500 hover:text-red-600 hover:border-red-500 transition-all uppercase"
            >
              삭제
            </button>
          </div>
        )}

      </div>

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
