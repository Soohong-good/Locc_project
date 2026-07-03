import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { register, checkEmail, sendVerificationCode, verifyEmailCode } from '@/api/auth'
import useDaumPostcode from '@/hooks/useDaumPostcode'
import { DateInput } from '@/components/ui/DateInput'
import StepIndicator from '@/components/auth/StepIndicator'

const REGISTER_STEPS = ['교인구분', '약관동의', '정보입력']

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
  </svg>
)

const formatPhone = (val) => {
  const d = val.replace(/[^0-9]/g, '')
  if (d.length <= 3) return d
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`
}

// ─── 이용약관 모달 ────────────────────────────────────────────────
const TermsModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div className="p-6 border-b flex items-center justify-between">
        <h2 className="text-2xl font-light">서비스 이용약관</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-6 overflow-y-auto flex-1 text-sm leading-relaxed space-y-4">
        <h3 className="text-lg font-medium">제1조 목적</h3>
        <p>본 이용약관은 "그리스도 사랑교회"(이하 "교회")의 서비스의 이용조건과 운영에 관한 제반 사항 규정을 목적으로 합니다.</p>
        <h3 className="text-lg font-medium">제2조 용어의 정의</h3>
        <p>① 회원 : 사이트의 약관에 동의하고 개인정보를 제공하여 회원등록을 한 자</p>
        <p>② 이용계약 : 사이트 이용과 관련하여 사이트와 회원간에 체결하는 계약</p>
        <p>③ 회원 ID : 회원의 식별과 서비스 이용을 위한 고유한 문자와 숫자의 조합</p>
        <h3 className="text-lg font-medium">제4조 이용계약 체결</h3>
        <p>① 이용계약은 회원으로 등록하여 사이트를 이용하려는 자의 본 약관 내용에 대한 동의와 가입신청에 대하여 교회의 이용승낙으로 성립합니다.</p>
        <h3 className="text-lg font-medium">제8조 회원의 의무</h3>
        <p>회원은 본 약관에서 규정하는 사항과 교회가 정한 제반 규정, 공지사항 및 운영정책 등 사이트가 공지하는 사항 및 관계 법령을 준수하여야 합니다.</p>
        <p className="text-slate-500 text-xs mt-4">이 약관은 2021년 6월 2일부터 시행합니다.</p>
      </div>
      <div className="p-6 border-t">
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-900 text-white hover:bg-slate-800 transition font-medium rounded"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
)

// ─── 이메일 인증 컴포넌트 ──────────────────────────────────────────
const VERIFY_TIMEOUT = 5 * 60 // 5분

const EmailVerifyField = ({ email, setEmail, verified, setVerified, onVerified }) => {
  const [codeSent, setCodeSent]         = useState(false)
  const [code, setCode]                 = useState('')
  const [timeLeft, setTimeLeft]         = useState(0)
  const [sendError, setSendError]       = useState('')
  const [verifyError, setVerifyError]   = useState('')
  const [emailError, setEmailError]     = useState('') // 중복 에러 전용
  const [checking, setChecking]         = useState(false)
  const timerRef = useRef(null)

  // 타이머 시작
  const startTimer = () => {
    setTimeLeft(VERIFY_TIMEOUT)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // 인증 코드 발송 — 중복 확인 후 발송
  const handleSend = async () => {
    setSendError('')
    setEmailError('')
    if (!email) return

    setChecking(true)
    try {
      await checkEmail(email) // 중복이면 400 throw
    } catch (e) {
      setEmailError(e?.response?.data?.message || '이미 사용 중인 이메일입니다.')
      setChecking(false)
      return
    }
    setChecking(false)

    // 중복 없음 → 인증 코드 발송
    sendCode()
  }

  const { mutate: sendCode, isPending: isSending } = useMutation({
    mutationFn: () => sendVerificationCode(email),
    onSuccess: () => {
      setSendError('')
      setCodeSent(true)
      setVerified(false)
      setCode('')
      startTimer()
    },
    onError: (e) => setSendError(e?.response?.data?.message || '코드 발송 중 오류가 발생했습니다.'),
  })

  const { mutate: verifyCode, isPending: isVerifying } = useMutation({
    mutationFn: () => verifyEmailCode({ email, code }),
    onSuccess: () => {
      setVerified(true)
      setVerifyError('')
      clearInterval(timerRef.current)
      onVerified?.() // 부모에게 인증 완료 알림 → fieldErrors.email 초기화
    },
    onError: (e) => setVerifyError(e?.response?.data?.message || '인증 코드가 올바르지 않습니다.'),
  })

  const isPendingAll = checking || isSending

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        이메일 <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setVerified(false)
              setEmailError('')
              setSendError('')
            }}
            required
            placeholder="example@email.com"
            disabled={verified || codeSent}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50 disabled:text-slate-500 ${
              emailError ? 'border-red-400 focus:ring-red-400' : 'border-slate-300'
            }`}
          />
          {/* 중복 오류 툴팁 */}
          {emailError && (
            <div className="absolute left-0 top-full mt-1 z-10 flex items-center gap-1.5 bg-red-50 border border-red-300 text-red-600 text-xs px-3 py-2 rounded-lg shadow-sm whitespace-nowrap">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {emailError}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={!email || isPendingAll || verified}
          className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 transition text-sm whitespace-nowrap"
        >
          {checking ? '확인 중...' : isSending ? '발송 중...' : codeSent ? '재발송' : '인증 코드 발송'}
        </button>
      </div>

      {sendError && <p className="mt-1 text-xs text-red-500">{sendError}</p>}

      {/* 코드 발송 후 이메일 변경 버튼 */}
      {codeSent && !verified && (
        <button
          type="button"
          onClick={() => {
            setCodeSent(false)
            setCode('')
            setSendError('')
            setVerifyError('')
            clearInterval(timerRef.current)
            setTimeLeft(0)
          }}
          className="mt-1 text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
        >
          이메일 변경하기
        </button>
      )}

      {/* 인증 완료 배지 */}
      {verified && (
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">이메일 인증 완료</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setVerified(false)
              setCodeSent(false)
              setEmailError('')
              setSendError('')
              setCode('')
            }}
            className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
          >
            이메일 변경
          </button>
        </div>
      )}

      {/* 코드 입력 영역 */}
      {codeSent && !verified && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-3">이메일로 발송된 6자리 인증 코드를 입력해주세요</p>
          <div className="flex gap-2">
            <input
              type="text" value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6} placeholder="000000"
              className="flex-1 min-w-0 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
            />
            <button
              type="button" onClick={() => verifyCode()}
              disabled={code.length < 6 || isVerifying || timeLeft === 0}
              className="flex-shrink-0 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition whitespace-nowrap"
            >
              {isVerifying ? '확인 중...' : '확인'}
            </button>
          </div>
          {verifyError && <p className="mt-1 text-xs text-red-500">{verifyError}</p>}
          <p className="text-xs text-blue-600 mt-2">
            남은 시간: <span className="font-mono font-medium">{fmt(timeLeft)}</span>
            {timeLeft === 0 && <span className="text-red-500 ml-2">만료됨 — 재발송해주세요</span>}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── 단계별 컨텐츠 ─────────────────────────────────────────────────
const CONSENT_TEXT = {
  terms: {
    title: '[필수] 서비스 이용약관 동의',
    body: '본 이용약관은 "그리스도 사랑교회"(이하 "교회")의 서비스의 이용조건과 운영에 관한 제반 사항 규정을 목적으로 합니다.',
    hasModal: true,
  },
  privacy: {
    title: '[필수] 개인정보 수집 및 이용 동의',
    body: '수집 목적: 회원 가입 및 관리 / 수집 항목: 이메일, 비밀번호, 이름, 성별, 전화번호 / 보유 기간: 회원탈퇴 시까지',
    hasModal: false,
  },
}

// ─── 메인 RegisterPage ────────────────────────────────────────────
const RegisterPage = () => {
  const navigate = useNavigate()

  const [step, setStep]           = useState(0) // 0: 가입방법 | 1: 교인구분 | 2: 동의 | 3: 입력
  const [userType, setUserType]   = useState('') // REGISTERED | UNREGISTERED
  const [consents, setConsents]   = useState({ terms: false, privacy: false })
  const [showTerms, setShowTerms] = useState(false)

  // 공통 폼 필드
  const [email, setEmail]         = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [form, setForm]           = useState({
    password: '', passwordConfirm: '', name: '', gender: '', phoneNumber: '',
    // 미등록교인 전용
    roadAddress: '', detailAddress: '', birth: '', registrationPath: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError]   = useState('')
  const [showPw, setShowPw]           = useState(false)
  const [showPwConfirm, setShowPwConfirm] = useState(false)

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))

  const validateField = (name, value) => {
    switch (name) {
      case 'password':
        if (!value) return '비밀번호를 입력해주세요.'
        if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/.test(value)) return '8자 이상의 영문, 숫자, 특수문자를 각각 1자 이상 포함해야 합니다.'
        return ''
      case 'passwordConfirm':
        if (!value) return '비밀번호 확인을 입력해주세요.'
        if (value !== form.password) return '비밀번호가 일치하지 않습니다.'
        return ''
      case 'name':
        if (!value) return '이름을 입력해주세요.'
        if (value.trim().length < 2) return '이름은 2자 이상이어야 합니다.'
        return ''
      case 'phoneNumber':
        if (value && !/^01[0-9]-\d{3,4}-\d{4}$/.test(value)) return '올바른 전화번호 형식으로 입력해주세요. (예: 010-1234-5678)'
        return ''
      default:
        return ''
    }
  }

  const handleBlur = (name) => (e) => {
    const error = validateField(name, e.target.value)
    setFieldErrors((prev) => ({ ...prev, [name]: error || undefined }))
    // 비밀번호가 바뀌면 passwordConfirm도 재검사
    if (name === 'password' && form.passwordConfirm) {
      const confirmError = e.target.value !== form.passwordConfirm ? '비밀번호가 일치하지 않습니다.' : ''
      setFieldErrors((prev) => ({ ...prev, password: error || undefined, passwordConfirm: confirmError || undefined }))
    }
  }

  const { mutate: submit, isPending } = useMutation({
    mutationFn: register,
    onSuccess: (_, variables) => {
      const appliedAt = new Date().toISOString()
      navigate(`/register/complete?email=${encodeURIComponent(variables.email)}&appliedAt=${encodeURIComponent(appliedAt)}`, { state: { email: variables.email, appliedAt } })
    },
    onError: (e) => {
      const data = e?.response?.data
      if (data?.errors) setFieldErrors(data.errors)
      else setApiError(data?.message || '가입 중 오류가 발생했습니다.')
    },
  })

  // 다음 주소 검색
  const { open: openPostcode } = useDaumPostcode((roadAddress) => {
    setForm((p) => ({ ...p, roadAddress }))
  })

  const handleConsentAll = (checked) =>
    setConsents({ terms: checked, privacy: checked })

  const handleSubmit = (e) => {
    e.preventDefault()
    setFieldErrors({})
    setApiError('')

    if (!emailVerified) { setFieldErrors({ email: '이메일 인증을 완료해주세요.' }); return }
    if (form.password !== form.passwordConfirm) { setFieldErrors({ passwordConfirm: '비밀번호가 일치하지 않습니다.' }); return }

    const payload = {
      email,
      password: form.password,
      name: form.name,
      gender: form.gender || null,
      phoneNumber: form.phoneNumber,
      userType,
      agreedToTerms: consents.terms,
      agreedToPrivacy: consents.privacy,
    }
    if (userType === 'UNREGISTERED') {
      payload.roadAddress      = form.roadAddress || null
      payload.detailAddress    = form.detailAddress || null
      payload.birth            = form.birth || null
      payload.registrationPath = form.registrationPath
    }

    submit(payload)
  }

  // ── 0단계: 가입 방법 선택 ────────────────────
  if (step === 0) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 py-24 sm:py-32">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">회원가입</h1>
            <p className="text-slate-600 font-light">가입 방법을 선택해주세요</p>
          </div>
          <div className="bg-white p-5 sm:p-8 shadow-sm">
            {/* 이메일 가입 */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-3.5 px-4 border-2 border-slate-900 text-slate-900 font-medium hover:bg-slate-900 hover:text-white transition text-sm"
            >
              이메일로 가입하기
            </button>

            {/* 구분선 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs text-slate-400">소셜 계정으로 가입</span>
              </div>
            </div>

            {/* 소셜 가입 */}
            <div className="space-y-2.5">
              <a
                href="/oauth2/authorization/kakao"
                className="flex items-center justify-center w-full py-3.5 px-4 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FEE500', color: '#191919' }}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.78 1.83 5.23 4.58 6.81-.2.73-.75 2.81-.86 3.26-.14.57.21.56.44.41.18-.13 2.96-2.02 3.43-2.34.47.07.95.11 1.44.11 5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
                </svg>
                카카오로 계속하기
              </a>
              <a
                href="/oauth2/authorization/naver"
                className="flex items-center justify-center w-full py-3.5 px-4 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#03C75A', color: '#FFFFFF' }}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
                </svg>
                네이버로 계속하기
              </a>
            </div>

            <div className="text-center mt-8">
              <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900">
                이미 계정이 있으신가요? 로그인
              </Link>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
            가입 신청 후 관리자 승인이 필요하며, 영업일 기준 1~2일이 소요됩니다.
          </p>
          <div className="text-center mt-8">
            <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">← 홈으로 돌아가기</Link>
          </div>
        </div>
      </section>
    )
  }

  // ── 1단계: 교인 구분 ──────────────────────────
  if (step === 1) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 py-24 sm:py-32">
        <div className="max-w-2xl w-full">
          <StepIndicator current={1} steps={REGISTER_STEPS} />
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">회원가입</h1>
            <p className="text-slate-600 font-light">교인 구분을 선택해주세요</p>
          </div>
          <div className="bg-white p-5 sm:p-8 md:p-10 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { type: 'REGISTERED', title: '등록교인', desc: '그리스도 사랑교회에 등록된 교인' },
                { type: 'UNREGISTERED', title: '미등록교인', desc: '방문자 및 새가족' },
              ].map(({ type, title, desc}) => (
                <button
                  key={type} type="button"
                  onClick={() => { setUserType(type); setStep(2) }}
                  className="p-8 border-2 border-slate-300 rounded-lg hover:border-slate-900 transition text-center"
                >
                  <div className="text-2xl mb-3 font-light">{title}</div>
                  <div className="text-sm text-slate-500 mb-4">{desc}</div>
                </button>
              ))}
            </div>
            <div className="text-center mt-8">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="text-sm text-slate-400 hover:text-slate-600"
              >
                ← 이전으로
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── 2단계: 동의 ───────────────────────────────
  if (step === 2) {
    const allChecked = consents.terms && consents.privacy
    const typeLabel  = userType === 'REGISTERED' ? '등록교인' : '미등록교인'

    return (
      <>
        {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
        <section className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 py-24 sm:py-32">
          <div className="max-w-2xl w-full">
            <StepIndicator current={2} steps={REGISTER_STEPS} />
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">개인정보 수집·이용 동의</h1>
              <p className="text-slate-600 font-light">{typeLabel} 가입</p>
            </div>
            <div className="bg-white p-5 sm:p-8 md:p-10 shadow-sm">
              <div className="space-y-6">
                {/* 전체 동의 */}
                <div className="pb-4 border-b">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox" checked={allChecked}
                      onChange={(e) => handleConsentAll(e.target.checked)}
                      className="w-5 h-5 border-2 border-slate-300"
                    />
                    <span className="text-lg font-medium">전체 동의</span>
                  </label>
                </div>

                {/* 약관 항목 */}
                {Object.entries(CONSENT_TEXT).map(([key, { title, body, hasModal }]) => (
                  <label key={key} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox" checked={consents[key]}
                      onChange={(e) => setConsents((p) => ({ ...p, [key]: e.target.checked }))}
                      className="mt-1 w-5 h-5 border-2 border-slate-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{title}</span>
                        {hasModal && (
                          <button
                            type="button" onClick={() => setShowTerms(true)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
                          >
                            전체보기
                          </button>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-4 rounded max-h-32 overflow-y-auto leading-relaxed">
                        {body}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3 border-2 border-slate-300 text-slate-700 hover:border-slate-900 transition font-medium"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => { if (allChecked) setStep(3) }}
                  disabled={!allChecked}
                  className="flex-1 py-3 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 transition font-medium"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  // ── 3단계: 정보 입력 ──────────────────────────
  const typeLabel = userType === 'REGISTERED' ? '등록교인' : '미등록교인'

  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 py-24 sm:py-32">
      <div className="max-w-2xl w-full">
        <StepIndicator current={3} steps={REGISTER_STEPS} />
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">정보 입력</h1>
          <p className="text-slate-600 font-light">{typeLabel} 가입</p>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded px-4 py-3">
            <p className="text-sm text-blue-800">회원정보는 정확하게 입력해주세요.</p>
            <p className="text-sm text-blue-800">(운영자 승인에 따라 가입이 완료됩니다.)</p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-8 md:p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {apiError}
              </div>
            )}

            {/* 이메일 + 인증 */}
            <EmailVerifyField
              suffix={userType}
              email={email} setEmail={setEmail}
              verified={emailVerified} setVerified={setEmailVerified}
              onVerified={() => setFieldErrors((prev) => ({ ...prev, email: undefined }))}
            />
            {fieldErrors.email && <p className="text-xs text-red-500 -mt-4">{fieldErrors.email}</p>}

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  onBlur={handleBlur('password')}
                  required minLength={8} autoComplete="new-password"
                  placeholder="8자 이상 영문, 숫자, 특수문자 포함"
                  className="w-full px-4 py-3 pr-11 border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">8자 이상의 영문, 숫자, 특수문자를 각각 1자 이상 포함해 주세요.</p>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPwConfirm ? 'text' : 'password'} value={form.passwordConfirm} onChange={set('passwordConfirm')}
                  onBlur={handleBlur('passwordConfirm')}
                  required minLength={8} autoComplete="new-password"
                  placeholder="비밀번호를 다시 입력해주세요"
                  className="w-full px-4 py-3 pr-11 border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPwConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {fieldErrors.passwordConfirm && <p className="mt-1 text-xs text-red-500">{fieldErrors.passwordConfirm}</p>}
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={form.name} onChange={set('name')}
                onBlur={handleBlur('name')}
                required placeholder="홍길동"
                className="w-full px-4 py-3 border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                성별 <span className="text-red-500">*</span>
              </label>
              <select
                value={form.gender} onChange={set('gender')} required
                className="w-full px-4 py-3 border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition bg-white"
              >
                <option value="">선택해주세요</option>
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
              </select>
              {fieldErrors.gender && <p className="mt-1 text-xs text-red-500">{fieldErrors.gender}</p>}
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel" value={form.phoneNumber}
                onChange={(e) => setForm((p) => ({ ...p, phoneNumber: formatPhone(e.target.value) }))}
                onBlur={handleBlur('phoneNumber')}
                required placeholder="010-1234-5678" maxLength={13}
                className="w-full px-4 py-3 border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
              />
              {fieldErrors.phoneNumber && <p className="mt-1 text-xs text-red-500">{fieldErrors.phoneNumber}</p>}
            </div>

            {/* 미등록교인 전용 추가 필드 */}
            {userType === 'UNREGISTERED' && (
              <>
                <div className="pt-4 pb-2 border-t">
                  <h3 className="text-lg font-medium text-slate-900">추가 정보</h3>
                  <p className="text-sm text-slate-500 mt-1">가입 경로는 필수로 입력해주세요</p>
                </div>

                {/* 주소 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">주소</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text" value={form.roadAddress} readOnly placeholder="도로명 주소"
                      className="flex-1 px-4 py-3 border border-slate-300 bg-slate-50 outline-none"
                    />
                    <button
                      type="button" onClick={openPostcode}
                      className="px-4 py-3 border-2 border-slate-300 hover:border-slate-900 transition font-medium whitespace-nowrap"
                    >
                      주소 검색
                    </button>
                  </div>
                  <input
                    type="text" value={form.detailAddress} onChange={set('detailAddress')}
                    placeholder="상세주소 (선택)"
                    className="w-full px-4 py-3 border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                  />
                </div>

                {/* 생년월일 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">생년월일</label>
                  <DateInput
                    value={form.birth}
                    onChange={(v) => setForm((p) => ({ ...p, birth: v }))}
                    placeholder="생년월일 선택"
                    maxDate={new Date()}
                    className="w-full px-4 py-3 border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                  />
                </div>

                {/* 가입 경로 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    가입 경로 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.registrationPath} onChange={set('registrationPath')}
                    required maxLength={500} rows={4}
                    placeholder="교회를 알게 된 경로를 자유롭게 작성해주세요 (최대 500자)"
                    className="w-full px-4 py-3 border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition resize-none"
                  />
                  <p className="text-xs text-slate-500 text-right mt-1">
                    {form.registrationPath.length} / 500자
                  </p>
                  {fieldErrors.registrationPath && <p className="mt-1 text-xs text-red-500">{fieldErrors.registrationPath}</p>}
                </div>
              </>
            )}

            <div className="flex gap-4">
              <button
                type="button" onClick={() => setStep(2)}
                className="flex-1 py-3 border-2 border-slate-300 text-slate-700 hover:border-slate-900 transition font-medium"
              >
                이전
              </button>
              <button
                type="submit" disabled={isPending}
                className="flex-1 py-3 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 transition font-medium"
              >
                {isPending ? '처리 중...' : '가입하기'}
              </button>
            </div>
          </form>
        </div>
      </div>

    </section>
  )
}

export default RegisterPage
