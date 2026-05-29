import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApplicationCategories, createApplication } from '@/api/applications'

// ── 차량신청 주의사항 ────────────────────────────────────────────────────
const VEHICLE_CAUTIONS = [
  '차량 사용 시 부득이한 사정이 없는 한 신청서를 7일 이전에 작성하여 사무실에 제출하여 주시기 바랍니다.',
  '운전자는 교통법규 준수를 기본으로 하며 과속, 법규위반 등의 범칙금 발생 시 사안에 따라 본인이 부담하여야 할 경우도 있사오니 주의하여 운행하시기 바랍니다.',
  '목적지 도착 시에는 필히 사무실로 연락하여 주시기 바랍니다.',
  '차량에 이상이 있을 시 담당자에게 미리 연락한 후 조치하시기 바랍니다.',
  '차량 사용 후 반드시 청소 후 반납하시기 바랍니다.',
]

const INITIAL_BASE = {
  categoryId:   '',
  useDate:      '',
  useStartTime: '',
  useEndTime:   '',
  purpose:      '',
  headCount:    '',
}

const INITIAL_VEHICLE = {
  vehicleNumber: '',
  destination:   '',
  driver:        '',
  escort:        '',
  notes:         '',
}

// ── 공통 입력 필드 ───────────────────────────────────────────────────────
const Field = ({ label, required = true, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
)

const TextInput = ({ value, onChange, type = 'text', error, ...props }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      error ? 'border-red-400' : 'border-gray-300'
    }`}
    {...props}
  />
)

// ── 메인 컴포넌트 ────────────────────────────────────────────────────────
const ApplicationFormPage = () => {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const [base,    setBase]    = useState(INITIAL_BASE)
  const [vehicle, setVehicle] = useState(INITIAL_VEHICLE)
  const [errors,  setErrors]  = useState({})

  const { data: categories = [] } = useQuery({
    queryKey: ['application-categories'],
    queryFn:  getApplicationCategories,
  })

  // 선택된 카테고리 이름
  const selectedCategory = categories.find(c => String(c.id) === String(base.categoryId))
  const isVehicle        = selectedCategory?.name === '차량신청'

  const setB = (key, val) => setBase(f    => ({ ...f, [key]: val }))
  const setV = (key, val) => setVehicle(f => ({ ...f, [key]: val }))

  const mutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'my'] })
      navigate('/applications')
    },
  })

  // ── 유효성 검사 ──────────────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!base.categoryId)   errs.categoryId   = '신청 종류를 선택해주세요'
    if (!base.useDate)      errs.useDate      = '날짜를 선택해주세요'
    if (!base.useStartTime) errs.useStartTime = '출발 시간을 입력해주세요'
    if (!base.useEndTime)   errs.useEndTime   = '도착 시간을 입력해주세요'
    if (base.useStartTime && base.useEndTime && base.useStartTime >= base.useEndTime) {
      errs.useEndTime = '도착 시간은 출발 시간 이후여야 합니다'
    }
    if (!base.purpose.trim())       errs.purpose   = '사용 목적을 입력해주세요'
    if (!base.headCount)            errs.headCount = '인원을 입력해주세요'
    if (Number(base.headCount) < 1) errs.headCount = '인원은 1명 이상이어야 합니다'

    if (isVehicle) {
      if (!vehicle.vehicleNumber.trim()) errs.vehicleNumber = '차량 번호를 입력해주세요'
      if (!vehicle.destination.trim())   errs.destination   = '목적지를 입력해주세요'
      if (!vehicle.driver.trim())        errs.driver        = '운전자를 입력해주세요'
    }
    return errs
  }

  // ── 제출 ──────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})

    // 차량신청이면 vehicle 필드를 JSON으로 memo에 저장
    const memo = isVehicle
      ? JSON.stringify({
          __type:        '차량신청',
          vehicleNumber: vehicle.vehicleNumber,
          destination:   vehicle.destination,
          driver:        vehicle.driver,
          escort:        vehicle.escort || null,
          notes:         vehicle.notes  || null,
        })
      : null

    mutation.mutate({
      categoryId:   Number(base.categoryId),
      useDate:      base.useDate,
      useStartTime: base.useStartTime + ':00',
      useEndTime:   base.useEndTime   + ':00',
      purpose:      base.purpose,
      headCount:    Number(base.headCount),
      memo,
    })
  }

  // ── 카테고리 변경 시 초기화 ───────────────────────────────────────────
  const handleCategoryChange = (val) => {
    setB('categoryId', val)
    setVehicle(INITIAL_VEHICLE)
    setErrors({})
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">신청서 작성</h1>
        <p className="text-sm text-gray-500 mt-1">사용 신청서를 작성해주세요.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">

        {/* 신청 종류 */}
        <Field label="신청 종류" error={errors.categoryId}>
          <select
            value={base.categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.categoryId ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            <option value="">선택해주세요</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>

        {/* ── 기본 공통 필드 ── */}
        {base.categoryId && (
          <>
            {/* 사용 날짜 */}
            <Field label={isVehicle ? '사용 날짜 (출발일)' : '사용 날짜'} error={errors.useDate}>
              <TextInput
                type="date"
                value={base.useDate}
                onChange={(e) => setB('useDate', e.target.value)}
                error={errors.useDate}
              />
            </Field>

            {/* 출발/도착 시간 */}
            <div className="grid grid-cols-2 gap-4">
              <Field label={isVehicle ? '출발 시간' : '시작 시간'} error={errors.useStartTime}>
                <TextInput
                  type="time"
                  value={base.useStartTime}
                  onChange={(e) => setB('useStartTime', e.target.value)}
                  error={errors.useStartTime}
                />
              </Field>
              <Field label={isVehicle ? '도착 시간' : '종료 시간'} error={errors.useEndTime}>
                <TextInput
                  type="time"
                  value={base.useEndTime}
                  onChange={(e) => setB('useEndTime', e.target.value)}
                  error={errors.useEndTime}
                />
              </Field>
            </div>

            {/* 사용 목적 */}
            <Field label="사용 목적" error={errors.purpose}>
              <TextInput
                value={base.purpose}
                onChange={(e) => setB('purpose', e.target.value)}
                placeholder={isVehicle ? '예) 청년부 수련회 이동' : '예) 청년부 수련회 예배당 사용'}
                error={errors.purpose}
              />
            </Field>

            {/* 인원 */}
            <Field label="인원 (명)" error={errors.headCount}>
              <TextInput
                type="number"
                value={base.headCount}
                onChange={(e) => setB('headCount', e.target.value)}
                min={1}
                placeholder="0"
                error={errors.headCount}
              />
            </Field>

            {/* ── 차량신청 전용 필드 ── */}
            {isVehicle && (
              <>
                <hr className="border-gray-100" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">차량 정보</p>

                {/* 차량번호 / 목적지 */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="차량 번호" error={errors.vehicleNumber}>
                    <TextInput
                      value={vehicle.vehicleNumber}
                      onChange={(e) => setV('vehicleNumber', e.target.value)}
                      placeholder="예) 12가3456"
                      error={errors.vehicleNumber}
                    />
                  </Field>
                  <Field label="목적지" error={errors.destination}>
                    <TextInput
                      value={vehicle.destination}
                      onChange={(e) => setV('destination', e.target.value)}
                      placeholder="예) 서울역"
                      error={errors.destination}
                    />
                  </Field>
                </div>

                {/* 운전자 / 인솔자 */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="운전자" error={errors.driver}>
                    <TextInput
                      value={vehicle.driver}
                      onChange={(e) => setV('driver', e.target.value)}
                      placeholder="운전자 성명"
                      error={errors.driver}
                    />
                  </Field>
                  <Field label="인솔자" required={false}>
                    <TextInput
                      value={vehicle.escort}
                      onChange={(e) => setV('escort', e.target.value)}
                      placeholder="인솔자 성명 (선택)"
                    />
                  </Field>
                </div>

                {/* 기타 */}
                <Field label="기타" required={false}>
                  <textarea
                    value={vehicle.notes}
                    onChange={(e) => setV('notes', e.target.value)}
                    rows={2}
                    placeholder="기타 전달 사항"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </Field>

                {/* 주의사항 */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-amber-700 mb-2">주의사항</p>
                  <ol className="space-y-1.5 list-decimal list-inside">
                    {VEHICLE_CAUTIONS.map((text, i) => (
                      <li key={i} className="text-xs text-amber-800 leading-relaxed">{text}</li>
                    ))}
                  </ol>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* 에러 */}
      {mutation.error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          신청 중 오류가 발생했습니다. 다시 시도해주세요.
        </p>
      )}

      {/* 버튼 */}
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
