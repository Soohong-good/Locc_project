import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, WarningCircle } from '@phosphor-icons/react'
import { getTrainingDetail, applyTraining } from '@/api/training'
import { getMyInfo } from '@/api/mypage'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import toast from '@/utils/toast'

const fmtDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const fmtNumber = (n) => n?.toLocaleString('ko-KR') ?? '0'

const formatPhone = (val) => {
  const digits = val.replace(/[^0-9]/g, '')
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
}

const TrainingApplyPage = () => {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [phone,         setPhone]         = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [agreed,        setAgreed]        = useState(false)
  const [phoneError,    setPhoneError]    = useState('')

  // 훈련 정보
  const { data: training, isLoading: tLoading } = useQuery({
    queryKey: ['training-detail', id],
    queryFn:  () => getTrainingDetail(id),
  })

  // 내 이름 자동 로드
  const { data: myInfo } = useQuery({
    queryKey: ['my-info'],
    queryFn:  getMyInfo,
  })

  const applyMutation = useMutation({
    mutationFn: applyTraining,
    onSuccess: () => {
      toast.success('신청이 완료되었습니다!')
      navigate('/training/my')
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || '신청에 실패했습니다.'
      toast.error(msg)
    },
  })

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
    setPhoneError('')
  }

  const handleSubmit = () => {
    if (!agreed) { toast.info('약관에 동의해주세요.'); return }
    const digits = phone.replace(/[^0-9]/g, '')
    if (!/^01[0-9][0-9]{7,8}$/.test(digits)) {
      setPhoneError('올바른 연락처를 입력해주세요. (예: 010-1234-5678)')
      return
    }
    if (training?.trainingFee > 0 && !paymentMethod) {
      toast.info('납부방법을 선택해주세요.')
      return
    }
    applyMutation.mutate({
      trainingId:    Number(id),
      phone:         formatPhone(phone.replace(/[^0-9]/g, '')),
      paymentMethod: training?.trainingFee > 0 ? paymentMethod : 'CASH',
    })
  }

  if (tLoading) return <LoadingSpinner />

  if (!training?.canApply) return (
    <main className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] min-h-screen pt-20 bg-[#FAF9F6] px-6 text-center">
      <p className="text-[#737373] mb-4 pt-16">신청이 마감된 훈련입니다.</p>
      <button onClick={() => navigate(`/training/${id}`)}
        className="px-6 py-3 bg-[#171717] text-[#FAF9F6] hover:bg-[#2C2C2C] transition text-xs font-bold tracking-[0.1em] uppercase">
        돌아가기
      </button>
    </main>
  )

  return (
    <main className="pt-20 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] flex flex-col min-h-[calc(100vh-5rem)]">

        {/* 헤더 */}
        <div className="p-8 md:p-16 lg:p-24 bg-[#FAF9F6]">
          <div className="mb-12 md:mb-16">
            <button
              onClick={() => navigate(`/training/${id}`)}
              className="inline-flex items-center gap-2 text-[#737373] hover:text-[#171717] transition-colors group"
            >
              <ArrowLeft size={20} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold tracking-[0.1em]">돌아가기</span>
            </button>
          </div>

          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="w-8 h-px bg-[#E5E5E5] hidden md:block" />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono">APPLY</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#171717] leading-[1.1] break-keep mb-3">
              훈련 신청
            </h1>
            <p className="text-lg text-[#737373] font-light break-keep">{training.title}</p>
          </div>
        </div>

        {/* 신청 폼 */}
        <div className="p-8 md:p-16 lg:p-24 border-t border-[#E5E5E5] bg-[#FAF9F6] flex-grow">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* 훈련 정보 요약 */}
            <div className="border border-[#E5E5E5] bg-[#F4F2EA] p-6">
              <h2 className="text-lg font-bold text-[#171717] mb-3">신청하실 훈련</h2>
              <div className="space-y-2 text-sm text-[#2C2C2C]">
                <p className="break-keep"><strong className="text-[#171717]">훈련명:</strong> {training.title}</p>
                <p><strong className="text-[#171717]">기간:</strong> {fmtDate(training.startDate)} ~ {fmtDate(training.endDate)}</p>
                <p><strong className="text-[#171717]">훈련비:</strong>{' '}
                  {training.trainingFee > 0
                    ? `${fmtNumber(training.trainingFee)}원`
                    : <span className="text-[#171717] font-bold">무료</span>
                  }
                </p>
              </div>
            </div>

            {/* 이름 (자동) */}
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                readOnly
                value={myInfo?.name ?? ''}
                className="w-full px-4 py-3 border border-[#E5E5E5] bg-[#F4F2EA] text-[#2C2C2C]"
              />
            </div>

            {/* 연락처 */}
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="010-1234-5678"
                maxLength={13}
                className={`w-full px-4 py-3 border bg-[#FAF9F6] focus:outline-none transition ${
                  phoneError ? 'border-red-400 focus:border-red-500' : 'border-[#E5E5E5] focus:border-[#171717]'
                }`}
              />
              {phoneError
                ? <p className="mt-1 text-xs text-red-500">{phoneError}</p>
                : <p className="mt-1 text-xs text-[#737373]">숫자만 입력해도 자동으로 형식이 맞춰집니다.</p>
              }
            </div>

            {/* 납부방법 (유료만) */}
            {training.trainingFee > 0 && (
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  납부방법 <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#171717] focus:outline-none transition bg-[#FAF9F6]"
                >
                  <option value="">선택하세요</option>
                  <option value="BANK">계좌이체</option>
                  <option value="CASH">현금납부</option>
                </select>
                {paymentMethod === 'BANK' && (
                  <div className="mt-3 border border-[#E5E5E5] bg-[#F4F2EA] px-4 py-3">
                    <p className="text-xs font-bold text-[#171717] mb-1 tracking-[0.05em] uppercase">입금 계좌 안내</p>
                    <p className="text-sm text-[#171717] font-medium">농협 301-0273-8865-01</p>
                    <p className="text-xs text-[#737373] mt-0.5">예금주: 그리스도 사랑교회</p>
                  </div>
                )}
              </div>
            )}

            {/* 주의사항 */}
            <div className="border border-[#E5E5E5] bg-[#F4F2EA] p-6">
              <h3 className="font-bold text-[#171717] mb-3 flex items-center gap-2">
                <WarningCircle size={20} className="text-[#171717]" />
                신청 전 반드시 확인하세요
              </h3>
              <ul className="space-y-2 text-sm text-[#2C2C2C]">
                <li className="flex items-start gap-2">
                  <span className="text-[#171717] mt-0.5">•</span>
                  <span className="break-keep">현금 제출은 사무실로 해주시기 바랍니다.</span>
                </li>
              </ul>
            </div>

            {/* 동의 */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 border-[#E5E5E5]"
              />
              <label htmlFor="agree" className="text-sm text-[#2C2C2C] cursor-pointer break-keep">
                위 내용을 모두 확인했으며, 훈련 규정을 준수할 것을 동의합니다. <span className="text-red-500">*</span>
              </label>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-6">
              <button
                onClick={() => navigate(`/training/${id}`)}
                className="flex-1 border border-[#E5E5E5] bg-[#FAF9F6] px-6 py-3 text-xs font-bold tracking-[0.1em] uppercase text-[#737373] hover:text-[#171717] hover:border-[#171717] transition-all"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={applyMutation.isPending}
                className="flex-1 bg-[#171717] text-[#FAF9F6] px-6 py-3 text-xs font-bold tracking-[0.1em] uppercase hover:bg-[#2C2C2C] transition-colors disabled:opacity-60"
              >
                {applyMutation.isPending ? '신청 중...' : '신청하기'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}

export default TrainingApplyPage
