import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTraining, updateTraining } from '@/api/training'
import { getErrorMessage } from '@/lib/apiError'
import { DateInput, DateTimeInput } from '@/components/ui/DateInput'
import toast from '@/utils/toast'

/**
 * 훈련 등록/수정 모달
 * Props:
 *   - detail: 수정 시 기존 훈련 데이터 (없으면 등록 모드)
 *   - onClose: 모달 닫기 콜백
 */
const TrainingFormModal = ({ detail, onClose }) => {
  const isEdit      = Boolean(detail)
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    title:               '',
    description:         '',
    startDate:           '',
    endDate:             '',
    applicationDeadline: '',
    trainingFee:         0,
    maxParticipants:     1,
  })

  useEffect(() => {
    if (!detail) return
    setForm({
      title:               detail.title               ?? '',
      description:         detail.description         ?? '',
      startDate:           detail.startDate            ?? '',
      endDate:             detail.endDate              ?? '',
      applicationDeadline: detail.applicationDeadline
        ? detail.applicationDeadline.slice(0, 16)
        : '',
      trainingFee:         detail.trainingFee          ?? 0,
      maxParticipants:     detail.maxParticipants      ?? 1,
    })
  }, [detail])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? updateTraining(detail.id, payload) : createTraining(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-list'] })
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['training-detail', String(detail.id)] })
      onClose()
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim())               return toast.error('제목을 입력해주세요.')
    if (!form.startDate)                  return toast.error('시작일을 입력해주세요.')
    if (!form.endDate)                    return toast.error('종료일을 입력해주세요.')
    if (!form.applicationDeadline)        return toast.error('신청 마감일을 입력해주세요.')
    if (Number(form.trainingFee) < 0)     return toast.error('훈련비는 0원 이상이어야 합니다.')
    if (Number(form.maxParticipants) < 1) return toast.error('정원은 1명 이상이어야 합니다.')

    saveMutation.mutate({
      title:               form.title.trim(),
      description:         form.description,
      startDate:           form.startDate,
      endDate:             form.endDate,
      applicationDeadline: form.applicationDeadline,
      trainingFee:         Number(form.trainingFee),
      maxParticipants:     Number(form.maxParticipants),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 패널 */}
      <div className="relative bg-white w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-lg font-medium text-slate-900">
            {isEdit ? '훈련 수정' : '새 훈련 등록'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 폼 바디 — 스크롤 가능 */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 px-8 py-6 space-y-5">

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={200}
                required
                placeholder="훈련 제목을 입력하세요"
                className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">설명</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="훈련 설명을 입력하세요"
                className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
              />
            </div>

            {/* 시작일 / 종료일 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  시작일 <span className="text-red-500">*</span>
                </label>
                <DateInput
                  value={form.startDate}
                  onChange={(v) => setForm((p) => ({ ...p, startDate: v }))}
                  placeholder="시작일 선택"
                  className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  종료일 <span className="text-red-500">*</span>
                </label>
                <DateInput
                  value={form.endDate}
                  onChange={(v) => setForm((p) => ({ ...p, endDate: v }))}
                  placeholder="종료일 선택"
                  className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
            </div>

            {/* 신청 마감일시 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                신청 마감일시 <span className="text-red-500">*</span>
              </label>
              <DateTimeInput
                value={form.applicationDeadline}
                onChange={(v) => setForm((p) => ({ ...p, applicationDeadline: v }))}
                placeholder="마감 날짜/시간 선택"
                className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            {/* 훈련비 / 정원 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  훈련비 (원) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="trainingFee"
                  value={form.trainingFee}
                  onChange={handleChange}
                  min={0}
                  required
                  className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  정원 (명) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={form.maxParticipants}
                  onChange={handleChange}
                  min={1}
                  required
                  className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
            </div>

            {/* 에러 */}
            {saveMutation.error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-3">
                {getErrorMessage(saveMutation.error, '저장 중 오류가 발생했습니다.')}
              </p>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium transition text-sm"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-8 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-medium transition text-sm disabled:opacity-60"
            >
              {saveMutation.isPending ? '저장 중...' : isEdit ? '수정 완료' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TrainingFormModal
