import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApplicationCategories, createApplication } from '@/api/applications'

const INITIAL_FORM = {
  categoryId:   '',
  useDate:      '',
  useStartTime: '',
  useEndTime:   '',
  purpose:      '',
  headCount:    '',
  memo:         '',
}

const ApplicationFormPage = () => {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const [form,   setForm]   = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})

  const { data: categories = [] } = useQuery({
    queryKey: ['application-categories'],
    queryFn:  getApplicationCategories,
  })

  const mutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'my'] })
      navigate('/applications')
    },
  })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const validate = () => {
    const errs = {}
    if (!form.categoryId)   errs.categoryId   = '신청 종류를 선택해주세요'
    if (!form.useDate)      errs.useDate      = '사용 날짜를 선택해주세요'
    if (!form.useStartTime) errs.useStartTime = '시작 시간을 입력해주세요'
    if (!form.useEndTime)   errs.useEndTime   = '종료 시간을 입력해주세요'
    if (form.useStartTime && form.useEndTime && form.useStartTime >= form.useEndTime) {
      errs.useEndTime = '종료 시간은 시작 시간 이후여야 합니다'
    }
    if (!form.purpose.trim())       errs.purpose   = '사용 목적을 입력해주세요'
    if (!form.headCount)            errs.headCount = '인원을 입력해주세요'
    if (Number(form.headCount) < 1) errs.headCount = '인원은 1명 이상이어야 합니다'
    return errs
  }

  const handleSubmit = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    mutation.mutate({
      categoryId:   Number(form.categoryId),
      useDate:      form.useDate,
      useStartTime: form.useStartTime + ':00',
      useEndTime:   form.useEndTime   + ':00',
      purpose:      form.purpose,
      headCount:    Number(form.headCount),
      memo:         form.memo || null,
    })
  }

  const field = (label, key, type = 'text', props = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {!props.optional && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[key] ? 'border-red-400' : 'border-gray-300'
        }`}
        {...props}
      />
      {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">신청서 작성</h1>
        <p className="text-sm text-gray-500 mt-1">시설 또는 차량 사용 신청서를 작성해주세요.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">

        {/* 신청 종류 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            신청 종류 <span className="text-red-500">*</span>
          </label>
          <select
            value={form.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.categoryId ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            <option value="">선택해주세요</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
        </div>

        {/* 사용 날짜 */}
        {field('사용 날짜', 'useDate', 'date')}

        {/* 시간 */}
        <div className="grid grid-cols-2 gap-4">
          {field('시작 시간', 'useStartTime', 'time')}
          {field('종료 시간', 'useEndTime',   'time')}
        </div>

        {/* 사용 목적 */}
        {field('사용 목적', 'purpose', 'text', { placeholder: '예) 청년부 수련회 차량 이동' })}

        {/* 인원 */}
        {field('인원 (명)', 'headCount', 'number', { min: 1, placeholder: '0' })}

        {/* 기타 요청사항 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            기타 요청사항 <span className="text-xs text-gray-400 font-normal">(선택)</span>
          </label>
          <textarea
            value={form.memo}
            onChange={(e) => set('memo', e.target.value)}
            rows={3}
            placeholder="기타 전달 사항이 있으면 입력해주세요."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      {mutation.error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          신청 중 오류가 발생했습니다. 다시 시도해주세요.
        </p>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {mutation.isPending ? '제출 중...' : '신청하기'}
        </button>
        <button
          onClick={() => navigate('/applications')}
          className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
        >
          취소
        </button>
      </div>
    </div>
  )
}

export default ApplicationFormPage
