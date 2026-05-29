import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApplicationCategories, createApplication } from '@/api/applications'
import useAuthStore from '@/stores/authStore'

// ── 차량신청 주의사항 ─────────────────────────────────────────────────────
const VEHICLE_CAUTIONS = [
  '차량 사용 시 부득이한 사정이 없는 한 신청서를 7일 이전에 작성하여 사무실에 제출하여 주시기 바랍니다.',
  '운전자는 교통법규 준수를 기본으로 하며 과속, 법규위반 등의 범칙금 발생 시 사안에 따라 본인이 부담하여야 할 경우도 있사오니 주의하여 운행하시기 바랍니다.',
  '목적지 도착 시에는 필히 사무실로 연락하여 주시기 바랍니다.',
  '차량에 이상이 있을 시 담당자에게 미리 연락한 후 조치하시기 바랍니다.',
  '차량 사용 후 반드시 청소 후 반납하시기 바랍니다.',
]

const cell = 'border border-gray-400 px-3 py-2 text-sm'
const labelCell = `${cell} bg-gray-50 font-medium text-gray-700 whitespace-nowrap w-24`

// ── 차량 사용 신청서 (이미지 레이아웃) ───────────────────────────────────
const VehicleForm = ({ form, setForm, errors, user }) => {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const inp = 'w-full outline-none bg-transparent text-sm'
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })

  return (
    <div className="bg-white border border-gray-300 shadow-sm max-w-2xl mx-auto font-sans">

      {/* 제목 */}
      <div className="text-center py-6 border-b border-gray-300 relative">
        <h2 className="text-2xl font-bold tracking-widest">차량 사용 신청서</h2>
        {/* 차량부장 도장 박스 */}
        <div className="absolute right-6 top-4 text-center">
          <div className="border border-gray-400 text-xs px-2 py-0.5 text-gray-600">※ 반드시 싸인을 할 것</div>
          <div className="border border-gray-400 mt-1 w-20 h-12 flex items-center justify-center text-xs text-gray-500">차량부장</div>
        </div>
      </div>

      {/* 본문 테이블 */}
      <table className="w-full border-collapse">
        <tbody>

          {/* 사용일시 */}
          <tr>
            <td className={`${labelCell} align-top`} rowSpan={1}>사용일시</td>
            <td className={`${cell} align-top`} colSpan={3}>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-gray-500 text-xs w-8">출발:</span>
                  <input type="date" value={form.useDate}
                    onChange={e => set('useDate', e.target.value)}
                    className={`${inp} w-36 ${errors.useDate ? 'text-red-400' : ''}`} />
                  <input type="time" value={form.useStartTime}
                    onChange={e => set('useStartTime', e.target.value)}
                    className={`${inp} w-28 ${errors.useStartTime ? 'text-red-400' : ''}`} />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-gray-500 text-xs w-8">도착:</span>
                  <input type="date" value={form.arrivalDate}
                    onChange={e => set('arrivalDate', e.target.value)}
                    className={`${inp} w-36 ${errors.arrivalDate ? 'text-red-400' : ''}`} />
                  <input type="time" value={form.useEndTime}
                    onChange={e => set('useEndTime', e.target.value)}
                    className={`${inp} w-28 ${errors.useEndTime ? 'text-red-400' : ''}`} />
                </div>
              </div>
              {(errors.useDate || errors.useStartTime || errors.useEndTime) && (
                <p className="text-red-500 text-xs mt-1">출발·도착 일시를 입력해주세요</p>
              )}
            </td>
          </tr>

          {/* 사용목적 / 차량번호 */}
          <tr>
            <td className={labelCell}>사용목적</td>
            <td className={cell}>
              <input value={form.purpose} onChange={e => set('purpose', e.target.value)}
                className={`${inp} ${errors.purpose ? 'placeholder-red-300' : ''}`}
                placeholder={errors.purpose ? '필수 입력' : ''} />
            </td>
            <td className={labelCell}>차량번호</td>
            <td className={cell}>
              <input value={form.vehicleNumber} onChange={e => set('vehicleNumber', e.target.value)}
                className={`${inp} ${errors.vehicleNumber ? 'placeholder-red-300' : ''}`}
                placeholder={errors.vehicleNumber ? '필수 입력' : ''} />
            </td>
          </tr>

          {/* 목적지 / 운전자 */}
          <tr>
            <td className={labelCell}>목 적 지</td>
            <td className={cell}>
              <input value={form.destination} onChange={e => set('destination', e.target.value)}
                className={`${inp} ${errors.destination ? 'placeholder-red-300' : ''}`}
                placeholder={errors.destination ? '필수 입력' : ''} />
            </td>
            <td className={labelCell}>운 전 자</td>
            <td className={cell}>
              <input value={form.driver} onChange={e => set('driver', e.target.value)}
                className={`${inp} ${errors.driver ? 'placeholder-red-300' : ''}`}
                placeholder={errors.driver ? '필수 입력' : ''} />
            </td>
          </tr>

          {/* 인원 / 인솔자 */}
          <tr>
            <td className={labelCell}>인 &nbsp; 원</td>
            <td className={cell}>
              <div className="flex items-center gap-1">
                <input type="number" min={1} value={form.headCount}
                  onChange={e => set('headCount', e.target.value)}
                  className={`${inp} w-16 ${errors.headCount ? 'text-red-400' : ''}`}
                  placeholder="0" />
                <span className="text-gray-600 text-sm">명</span>
              </div>
            </td>
            <td className={labelCell}>인 솔 자</td>
            <td className={cell}>
              <input value={form.escort} onChange={e => set('escort', e.target.value)}
                className={inp} placeholder="(선택)" />
            </td>
          </tr>

          {/* 기타 */}
          <tr>
            <td className={labelCell}>기 &nbsp;&nbsp; 타</td>
            <td className={cell} colSpan={3}>
              <input value={form.notes} onChange={e => set('notes', e.target.value)}
                className={inp} placeholder="" />
            </td>
          </tr>

          {/* 주의사항 */}
          <tr>
            <td className={`${labelCell} align-top`}>주의사항</td>
            <td className={`${cell} text-xs text-gray-600 leading-relaxed`} colSpan={3}>
              <ol className="list-decimal list-inside space-y-1">
                {VEHICLE_CAUTIONS.map((t, i) => <li key={i}>{t}</li>)}
              </ol>
            </td>
          </tr>

        </tbody>
      </table>

      {/* 하단 서명란 */}
      <div className="text-center py-6 space-y-2 border-t border-gray-300 text-sm">
        <p>신청일시 &nbsp; {today}</p>
        <p>신청자 &nbsp;&nbsp;&nbsp;&nbsp; {user?.name ?? ''}</p>
        <p className="text-lg font-bold tracking-widest mt-3">그리스도사랑교회</p>
      </div>

    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────
const ApplicationFormPage = () => {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const { user }    = useAuthStore()

  const [categoryId, setCategoryId] = useState('')
  const [errors,     setErrors]     = useState({})

  // 차량신청 전용 폼 state
  const [vehicleForm, setVehicleForm] = useState({
    useDate:       '',
    arrivalDate:   '',
    useStartTime:  '',
    useEndTime:    '',
    purpose:       '',
    vehicleNumber: '',
    destination:   '',
    driver:        '',
    headCount:     '',
    escort:        '',
    notes:         '',
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['application-categories'],
    queryFn:  getApplicationCategories,
  })

  const selectedCategory = categories.find(c => String(c.id) === String(categoryId))
  const isVehicle        = selectedCategory?.name === '차량신청'

  const mutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'my'] })
      navigate('/applications')
    },
  })

  // ── 유효성 검사 ──────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!categoryId) { errs.categoryId = '신청 종류를 선택해주세요'; return errs }

    if (isVehicle) {
      const f = vehicleForm
      if (!f.useDate)       errs.useDate       = '필수'
      if (!f.useStartTime)  errs.useStartTime  = '필수'
      if (!f.useEndTime)    errs.useEndTime    = '필수'
      if (!f.purpose.trim()) errs.purpose      = '필수'
      if (!f.vehicleNumber.trim()) errs.vehicleNumber = '필수'
      if (!f.destination.trim())   errs.destination   = '필수'
      if (!f.driver.trim())        errs.driver        = '필수'
      if (!f.headCount || Number(f.headCount) < 1) errs.headCount = '필수'
    }
    return errs
  }

  const handleSubmit = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})

    const f = vehicleForm
    const memo = JSON.stringify({
      __type:        '차량신청',
      arrivalDate:   f.arrivalDate  || null,
      vehicleNumber: f.vehicleNumber,
      destination:   f.destination,
      driver:        f.driver,
      escort:        f.escort       || null,
      notes:         f.notes        || null,
    })

    mutation.mutate({
      categoryId:   Number(categoryId),
      useDate:      f.useDate,
      useStartTime: f.useStartTime + ':00',
      useEndTime:   f.useEndTime   + ':00',
      purpose:      f.purpose,
      headCount:    Number(f.headCount),
      memo,
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">신청서 작성</h1>
      </div>

      {/* 신청 종류 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          신청 종류 <span className="text-red-500">*</span>
        </label>
        <select
          value={categoryId}
          onChange={e => { setCategoryId(e.target.value); setErrors({}) }}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.categoryId ? 'border-red-400' : 'border-gray-300'
          }`}
        >
          <option value="">선택해주세요</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
      </div>

      {/* 차량신청 폼 (이미지 양식) */}
      {isVehicle && (
        <VehicleForm
          form={vehicleForm}
          setForm={setVehicleForm}
          errors={errors}
          user={user}
        />
      )}

      {/* 에러 메시지 */}
      {Object.keys(errors).filter(k => k !== 'categoryId').length > 0 && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          필수 항목을 모두 입력해주세요.
        </p>
      )}
      {mutation.error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          신청 중 오류가 발생했습니다. 다시 시도해주세요.
        </p>
      )}

      {/* 버튼 */}
      {categoryId && (
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
      )}
    </div>
  )
}

export default ApplicationFormPage
