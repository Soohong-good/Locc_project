import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
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
    <main className="pt-page px-6 text-center">
      <p className="text-slate-500 mb-4">신청이 마감된 훈련입니다.</p>
      <button onClick={() => navigate(`/training/${id}`)}
        className="px-6 py-3 bg-slate-900 text-white hover:bg-slate-800 transition">
        돌아가기
      </button>
    </main>
  )

  return (
    <main>
      {/* Hero */}
      <section className="pt-page pb-12 bg-slate-900 px-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(`/training/${id}`)}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-light tracking-wide">뒤로가기</span>
          </button>
          <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-4">Apply</p>
          <h1 className="text-4xl md:text-5xl font-light text-white leading-tight tracking-tight mb-3">훈련 신청</h1>
          <p className="text-lg text-slate-400 font-light">{training.title}</p>
        </div>
      </section>

      {/* 신청 폼 */}
      <section className="py-12 bg-white px-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* 훈련 정보 요약 */}
          <div className="bg-blue-50 border border-blue-200 p-6">
            <h2 className="text-lg font-medium text-slate-900 mb-3">신청하실 훈련</h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>훈련명:</strong> {training.title}</p>
              <p><strong>기간:</strong> {fmtDate(training.startDate)} ~ {fmtDate(training.endDate)}</p>
              <p><strong>훈련비:</strong>{' '}
                {training.trainingFee > 0
                  ? `${fmtNumber(training.trainingFee)}원`
                  : <span className="text-green-600 font-medium">무료</span>
                }
              </p>
            </div>
          </div>

          {/* 이름 (자동) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              readOnly
              value={myInfo?.name ?? ''}
              className="w-full px-4 py-3 border border-slate-300 bg-slate-50 text-slate-700"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="010-1234-5678"
              maxLength={13}
              className={`w-full px-4 py-3 border focus:outline-none transition ${
                phoneError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'
              }`}
            />
            {phoneError
              ? <p className="mt-1 text-xs text-red-500">{phoneError}</p>
              : <p className="mt-1 text-xs text-slate-400">숫자만 입력해도 자동으로 형식이 맞춰집니다.</p>
            }
          </div>

          {/* 납부방법 (유료만) */}
          {training.trainingFee > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                납부방법 <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 focus:border-blue-500 focus:outline-none transition bg-white"
              >
                <option value="">선택하세요</option>
                <option value="BANK">계좌이체</option>
                <option value="CASH">현금납부</option>
              </select>
              {paymentMethod === 'BANK' && (
                <div className="mt-3 bg-blue-50 border border-blue-200 px-4 py-3 rounded">
                  <p className="text-xs font-semibold text-blue-700 mb-1">입금 계좌 안내</p>
                  <p className="text-sm text-slate-800 font-medium">농협 301-0273-8865-01</p>
                  <p className="text-xs text-slate-500 mt-0.5">예금주: 그리스도 사랑교회</p>
                </div>
              )}
            </div>
          )}

          {/* 주의사항 */}
          <div className="bg-amber-50 border border-amber-200 p-6">
            <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              신청 전 반드시 확인하세요
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>현금 제출은 사무실로 해주시기 바랍니다.</span>
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
              className="mt-1 w-4 h-4 border-slate-300"
            />
            <label htmlFor="agree" className="text-sm text-slate-700 cursor-pointer">
              위 내용을 모두 확인했으며, 훈련 규정을 준수할 것을 동의합니다. <span className="text-red-500">*</span>
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-6">
            <button
              onClick={() => navigate(`/training/${id}`)}
              className="flex-1 px-6 py-3 border border-slate-300 hover:border-slate-900 transition text-slate-700 hover:text-slate-900"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={applyMutation.isPending}
              className="flex-1 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition font-medium disabled:opacity-60"
            >
              {applyMutation.isPending ? '신청 중...' : '신청하기'}
            </button>
          </div>

        </div>
      </section>
    </main>
  )
}

export default TrainingApplyPage
