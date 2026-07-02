import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createApplication } from '@/api/applications'
import useAuthStore from '@/stores/authStore'

// ── 신청 종류 고정 목록 (추가 시 여기에 이름만 넣으면 됨) ──────────────
const FORM_TYPES = [
  '차량신청',
]

// ── 차량신청 주의사항 ─────────────────────────────────────────────────────
const VEHICLE_CAUTIONS = [
  '차량 사용 시 부득이한 사정이 없는 한 신청서를 7일 이전에 작성하여 사무실에 제출하여 주시기 바랍니다.',
  '운전자는 교통법규 준수를 기본으로 하며 과속, 법규위반 등의 범칙금 발생 시 사안에 따라 본인이 부담하여야 할 경우도 있사오니 주의하여 운행하시기 바랍니다.',
  '목적지 도착 시에는 필히 사무실로 연락하여 주시기 바랍니다.',
  '차량에 이상이 있을 시 담당자에게 미리 연락한 후 조치하시기 바랍니다.',
  '차량 사용 후 반드시 청소 후 반납하시기 바랍니다.',
]

// ── 테이블 셀 스타일 ──────────────────────────────────────────────────────
const th = 'border border-gray-400 px-4 py-3.5 bg-gray-50 text-base font-medium text-gray-700 whitespace-nowrap'
const td = 'border border-gray-400 px-4 py-3.5 text-base'
const inp = 'w-full outline-none bg-transparent text-base text-gray-800 placeholder-gray-300'

// ── 차량 사용 신청서 ──────────────────────────────────────────────────────
const VehicleForm = ({ form, setForm, errors, user }) => {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).replace(/\. /g, '. ').replace(/\.$/, '')

  return (
    <div className="bg-white border border-gray-300 shadow-sm w-full font-sans">

      {/* ── 제목 + 도장 ── */}
      <div className="border-b border-gray-300 px-8 py-7">
        <div className="flex items-start justify-between gap-4">
          {/* 왼쪽 여백 (균형용) */}
          <div className="w-36 flex-shrink-0" />

          {/* 제목 */}
          <h2 className="text-3xl font-bold tracking-widest text-center flex-1">
            차량 사용 신청서
          </h2>

          {/* 도장 영역 */}
          <div className="w-36 flex-shrink-0 flex flex-col items-end gap-1.5">
            <span className="text-xs text-gray-500 whitespace-nowrap">※ 반드시 싸인을 할 것</span>
            <div className="border border-gray-400 w-24 h-12 flex items-center justify-center text-sm text-gray-500">
              차량부장
            </div>
          </div>
        </div>
      </div>

      {/* ── 본문 테이블 ── */}
      <table className="w-full border-collapse">
        <tbody>

          {/* 사용일시 */}
          <tr>
            <th className={`${th} align-top w-28`}>사용일시</th>
            <td className={td} colSpan={3}>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 w-6">출발</span>
                  <input type="date" value={form.useDate}
                    onChange={e => set('useDate', e.target.value)}
                    className={`outline-none text-base border-b ${errors.useDate ? 'border-red-300 text-red-400' : 'border-transparent'} bg-transparent`} />
                  <input type="time" value={form.useStartTime}
                    onChange={e => set('useStartTime', e.target.value)}
                    className={`outline-none text-base border-b ${errors.useStartTime ? 'border-red-300 text-red-400' : 'border-transparent'} bg-transparent`} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 w-6">도착</span>
                  <input type="date" value={form.arrivalDate}
                    onChange={e => set('arrivalDate', e.target.value)}
                    className="outline-none text-base border-b border-transparent bg-transparent" />
                  <input type="time" value={form.useEndTime}
                    onChange={e => set('useEndTime', e.target.value)}
                    className={`outline-none text-base border-b ${errors.useEndTime ? 'border-red-300 text-red-400' : 'border-transparent'} bg-transparent`} />
                </div>
              </div>
              {(errors.useDate || errors.useStartTime || errors.useEndTime) && (
                <p className="text-red-400 text-xs mt-1.5">출발 일시를 입력해주세요</p>
              )}
            </td>
          </tr>

          {/* 사용목적 / 차량번호 */}
          <tr>
            <th className={`${th} w-28`}>사용목적</th>
            <td className={`${td} w-[calc(50%-56px)]`}>
              <input value={form.purpose} onChange={e => set('purpose', e.target.value)}
                className={`${inp} ${errors.purpose ? 'placeholder-red-300' : ''}`}
                placeholder={errors.purpose ? '필수 입력' : ''} />
            </td>
            <th className={`${th} w-28`}>차량번호</th>
            <td className={td}>
              <input value={form.vehicleNumber} onChange={e => set('vehicleNumber', e.target.value)}
                className={`${inp} ${errors.vehicleNumber ? 'placeholder-red-300' : ''}`}
                placeholder={errors.vehicleNumber ? '필수 입력' : ''} />
            </td>
          </tr>

          {/* 목적지 / 운전자 */}
          <tr>
            <th className={`${th} w-28`}>목 적 지</th>
            <td className={td}>
              <input value={form.destination} onChange={e => set('destination', e.target.value)}
                className={`${inp} ${errors.destination ? 'placeholder-red-300' : ''}`}
                placeholder={errors.destination ? '필수 입력' : ''} />
            </td>
            <th className={`${th} w-28`}>운 전 자</th>
            <td className={td}>
              <input value={form.driver} onChange={e => set('driver', e.target.value)}
                className={`${inp} ${errors.driver ? 'placeholder-red-300' : ''}`}
                placeholder={errors.driver ? '필수 입력' : ''} />
            </td>
          </tr>

          {/* 인원 / 인솔자 */}
          <tr>
            <th className={`${th} w-28`}>인 &nbsp;&nbsp; 원</th>
            <td className={td}>
              <div className="flex items-center gap-1.5">
                <input type="number" min={1} value={form.headCount}
                  onChange={e => set('headCount', e.target.value)}
                  className={`outline-none bg-transparent text-sm w-14 text-right ${errors.headCount ? 'text-red-400' : 'text-gray-800'}`}
                  placeholder="0" />
                <span className="text-gray-600 text-sm">명</span>
              </div>
            </td>
            <th className={`${th} w-28`}>인 솔 자</th>
            <td className={td}>
              <input value={form.escort} onChange={e => set('escort', e.target.value)}
                className={inp}/>
            </td>
          </tr>

          {/* 기타 */}
          <tr>
            <th className={`${th} w-28`}>기 &nbsp;&nbsp;&nbsp;&nbsp; 타</th>
            <td className={td} colSpan={3}>
              <input value={form.notes} onChange={e => set('notes', e.target.value)}
                className={inp} />
            </td>
          </tr>

          {/* 주의사항 */}
          <tr>
            <th className={`${th} align-top w-28`}>주의사항</th>
            <td className={`${td} text-sm text-gray-600 leading-relaxed`} colSpan={3}>
              <ol className="list-decimal list-inside space-y-2">
                {VEHICLE_CAUTIONS.map((t, i) => <li key={i}>{t}</li>)}
              </ol>
            </td>
          </tr>

        </tbody>
      </table>

      {/* ── 하단 서명란 ── */}
      <div className="border-t border-gray-300 py-8 text-center space-y-2 text-base text-gray-700">
        <p>신청일시 &nbsp;&nbsp; {today}</p>
        <p>신청자 &nbsp;&nbsp;&nbsp;&nbsp; {user?.name ?? ''}</p>
        <p className="text-xl font-bold tracking-widest mt-4">그리스도사랑교회</p>
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────
const ApplicationFormPage = () => {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const { user }    = useAuthStore()

  const [formType, setFormType] = useState('')
  const [errors,   setErrors]   = useState({})

  const isVehicle = formType === '차량신청'

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

  const mutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'my'] })
      navigate('/applications')
    },
  })

  const validate = () => {
    const errs = {}
    if (!formType) { errs.formType = '신청 종류를 선택해주세요'; return errs }

    if (isVehicle) {
      const f = vehicleForm
      if (!f.useDate)             errs.useDate       = '필수'
      if (!f.useStartTime)        errs.useStartTime  = '필수'
      if (!f.useEndTime)          errs.useEndTime    = '필수'
      if (!f.purpose.trim())      errs.purpose       = '필수'
      if (!f.vehicleNumber.trim())errs.vehicleNumber = '필수'
      if (!f.destination.trim())  errs.destination   = '필수'
      if (!f.driver.trim())       errs.driver        = '필수'
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
      arrivalDate:   f.arrivalDate   || null,
      vehicleNumber: f.vehicleNumber,
      destination:   f.destination,
      driver:        f.driver,
      escort:        f.escort        || null,
      notes:         f.notes         || null,
    })

    mutation.mutate({
      formType,
      useDate:      f.useDate,
      useStartTime: f.useStartTime + ':00',
      useEndTime:   f.useEndTime   + ':00',
      purpose:      f.purpose,
      headCount:    Number(f.headCount),
      memo,
    })
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">

      {/* Hero */}
      <section className="pt-20 bg-[#171717] text-[#FAF9F6] border-b border-[#2C2C2C]">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <span className="font-mono text-xs tracking-[0.25em] uppercase text-[#737373] mb-4 block">Applications</span>
          <h1 className="text-5xl font-bold tracking-tight break-keep">신청서 작성</h1>
          <p className="mt-3 text-sm text-[#A3A3A3] break-keep">
            신청 종류를 선택하면 해당 신청서 양식이 표시됩니다.
          </p>
        </div>
      </section>

      {/* 본문 */}
      <main className="max-w-3xl mx-auto px-6 pt-14 md:pt-20 pb-32 space-y-6">

        {/* 신청 종류 선택 */}
        <div className="bg-white border border-[#E5E5E5] p-5">
          <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
            신청 종류 <span className="text-red-500">*</span>
          </label>
          <select
            value={formType}
            onChange={e => { setFormType(e.target.value); setErrors({}) }}
            className={`w-full px-3 py-2.5 border text-sm focus:outline-none focus:border-[#171717] bg-white ${
              errors.formType ? 'border-red-400' : 'border-[#E5E5E5]'
            }`}
          >
            <option value="">선택해주세요</option>
            {FORM_TYPES.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          {errors.formType && (
            <p className="mt-1.5 text-xs text-red-500">{errors.formType}</p>
          )}
        </div>

        {/* 신청서 양식 */}
        {isVehicle && (
          <VehicleForm
            form={vehicleForm}
            setForm={setVehicleForm}
            errors={errors}
            user={user}
          />
        )}

        {/* 필수 오류 안내 */}
        {Object.keys(errors).filter(k => k !== 'formType').length > 0 && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">
            필수 항목을 모두 입력해주세요.
          </p>
        )}
        {mutation.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">
            신청 중 오류가 발생했습니다. 다시 시도해주세요.
          </p>
        )}

        {/* 버튼 */}
        {formType && (
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="text-xs font-bold tracking-[0.1em] uppercase bg-[#171717] text-[#FAF9F6] px-6 py-2.5 hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? '제출 중...' : '신청하기'}
            </button>
            <button
              onClick={() => navigate('/applications')}
              className="text-xs font-bold tracking-[0.1em] uppercase border border-[#E5E5E5] text-[#737373] px-6 py-2.5 hover:border-[#171717] hover:text-[#171717] transition-colors"
            >
              취소
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default ApplicationFormPage
