import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { completeSocialRegistration } from '@/api/auth'
import { DateInput } from '@/components/ui/DateInput'
import toast from '@/utils/toast'

// 전화번호 자동 하이픈
const formatPhone = (val) => {
  const d = val.replace(/[^0-9]/g, '')
  if (d.length <= 3) return d
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`
}

// ── Step 1: 교인 구분 ──────────────────────────────────────────────────────
const Step1 = ({ onSelect }) => (
  <div>
    <div className="text-center mb-10">
      <h1 className="text-4xl font-light text-slate-900 mb-4">소셜 회원가입</h1>
      <p className="text-slate-600 font-light">교인 구분을 선택해주세요</p>
    </div>
    <div className="bg-white p-8 md:p-10 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => onSelect('REGISTERED')}
          className="p-8 border-2 border-slate-300 hover:border-slate-900 transition text-center"
        >
          <div className="text-2xl mb-3 font-light">등록교인</div>
          <div className="text-sm text-slate-500 mb-4">그리스도 사랑교회에<br />등록된 교인</div>
          <div className="text-xs text-slate-400">• 교인 정보 확인<br />• 모든 교회 서비스 이용</div>
        </button>
        <button
          onClick={() => onSelect('UNREGISTERED')}
          className="p-8 border-2 border-slate-300 hover:border-slate-900 transition text-center"
        >
          <div className="text-2xl mb-3 font-light">미등록교인</div>
          <div className="text-sm text-slate-500 mb-4">방문자 및<br />새가족</div>
          <div className="text-xs text-slate-400">• 간편 가입<br />• 기본 정보만 입력</div>
        </button>
      </div>
      <div className="text-center mt-8">
        <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900">
          이미 계정이 있으신가요? 로그인
        </Link>
      </div>
    </div>
    <div className="text-center mt-8">
      <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">← 홈으로 돌아가기</Link>
    </div>
  </div>
)

// ── Step 2: 약관 동의 ──────────────────────────────────────────────────────
const Step2 = ({ userType, onBack, onNext }) => {
  const [agreeTerms,   setAgreeTerms]   = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [termsModal,   setTermsModal]   = useState(false)
  const allChecked = agreeTerms && agreePrivacy

  const handleToggleAll = (v) => { setAgreeTerms(v); setAgreePrivacy(v) }

  const handleNext = () => {
    if (!agreeTerms || !agreePrivacy) {
      toast.info('필수 약관에 모두 동의해주세요.')
      return
    }
    onNext({ agreedToTerms: true, agreedToPrivacy: true })
  }

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-light text-slate-900 mb-4">개인정보 수집·이용 동의</h1>
        <p className="text-slate-600 font-light">
          {userType === 'REGISTERED' ? '등록교인 가입' : '미등록교인 가입'}
        </p>
      </div>
      <div className="bg-white p-8 md:p-10 shadow-sm">
        <div className="space-y-6">
          {/* 전체 동의 */}
          <div className="pb-4 border-b">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={allChecked}
                onChange={(e) => handleToggleAll(e.target.checked)}
                className="w-5 h-5 border-2 border-slate-300" />
              <span className="text-lg font-medium">전체 동의</span>
            </label>
          </div>

          {/* 이용약관 */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 w-5 h-5 border-2 border-slate-300" />
            <div className="flex-1">
              <div className="flex items-center gap-2 justify-between">
                <span className="font-medium">[필수] 서비스 이용약관 동의</span>
                <button onClick={() => setTermsModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline">전체보기</button>
              </div>
              <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-4 max-h-32 overflow-y-auto leading-relaxed">
                <p className="font-medium mb-2">제1조 목적</p>
                <p className="mb-2">본 이용약관은 "그리스도 사랑교회"의 서비스 이용조건과 운영에 관한 제반 사항 규정을 목적으로 합니다.</p>
                <p className="text-xs text-slate-500">※ 전체 약관은 '전체보기' 버튼을 클릭하여 확인하실 수 있습니다.</p>
              </div>
            </div>
          </label>

          {/* 개인정보 */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              className="mt-1 w-5 h-5 border-2 border-slate-300" />
            <div className="flex-1">
              <span className="font-medium">[필수] 개인정보 수집 및 이용 동의</span>
              <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-4 max-h-32 overflow-y-auto">
                <p className="font-medium mb-2">1. 개인정보 수집목적 및 이용목적</p>
                <p className="mb-2 text-xs">회원 가입 의사 확인, 회원제 서비스 제공, 본인 식별·인증 등</p>
                <p className="font-medium mb-2">2. 수집하는 개인정보 항목</p>
                <p className="mb-2">이름, 성별, 전화번호 등</p>
                <p className="font-medium mb-2">3. 개인정보 보유 및 이용기간</p>
                <p>회원탈퇴 시까지</p>
              </div>
            </div>
          </label>
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={onBack}
            className="flex-1 py-3 border-2 border-slate-300 text-slate-700 hover:border-slate-900 transition font-medium">
            이전
          </button>
          <button onClick={handleNext}
            className="flex-1 py-3 bg-slate-900 text-white hover:bg-slate-800 transition font-medium">
            다음
          </button>
        </div>
      </div>

      {/* 약관 모달 */}
      {termsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-light">서비스 이용약관</h2>
              <button onClick={() => setTermsModal(false)} className="text-slate-400 hover:text-slate-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-sm leading-relaxed">
              <p>본 이용약관은 "그리스도 사랑교회"의 서비스 이용조건과 운영에 관한 제반 사항을 규정합니다.</p>
            </div>
            <div className="p-6 border-t">
              <button onClick={() => setTermsModal(false)}
                className="w-full py-3 bg-slate-900 text-white hover:bg-slate-800 transition font-medium">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Step 3: 정보 입력 ──────────────────────────────────────────────────────
const Step3 = ({ userType, consent, tempToken, onBack }) => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', gender: '', phoneNumber: '', birth: '',
    address: '', detailAddress: '', registrationPath: '',
  })
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const mutation = useMutation({
    mutationFn: (payload) => completeSocialRegistration(tempToken, payload),
    onSuccess: (data) => {
      if (data.success) {
        navigate('/social/pending')
      } else {
        setError(data.message || '오류가 발생했습니다.')
      }
    },
    onError: (err) => {
      setError(err?.response?.data?.message || '회원가입 처리 중 오류가 발생했습니다.')
    },
  })

  const handleSubmit = () => {
    setError('')
    if (!form.name.trim() || !form.gender || !form.phoneNumber.trim()) {
      setError('모든 필수 항목을 입력해주세요.')
      return
    }
    if (!/^010-\d{4}-\d{4}$/.test(form.phoneNumber)) {
      setError('전화번호는 010-0000-0000 형식으로 입력해주세요.')
      return
    }
    if (userType === 'UNREGISTERED' && !form.registrationPath.trim()) {
      setError('교회를 알게 된 경로를 입력해주세요.')
      return
    }

    let fullAddress = null
    if (userType === 'UNREGISTERED' && form.address) {
      fullAddress = form.address
      if (form.detailAddress) fullAddress += ', ' + form.detailAddress
    }

    mutation.mutate({
      name:             form.name.trim(),
      gender:           form.gender,
      phoneNumber:      form.phoneNumber.trim(),
      birth:            userType === 'UNREGISTERED' && form.birth ? form.birth : null,
      address:          fullAddress,
      registrationPath: userType === 'UNREGISTERED' ? form.registrationPath.trim() : null,
      userType,
      agreedToTerms:    consent.agreedToTerms,
      agreedToPrivacy:  consent.agreedToPrivacy,
    })
  }

  // Daum 주소 API
  const handleAddressSearch = () => {
    if (!window.daum?.Postcode) {
      toast.info('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        set('address', data.roadAddress)
      },
    }).open()
  }

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-light text-slate-900 mb-4">추가 정보 입력</h1>
        <p className="text-slate-600 font-light">
          {userType === 'UNREGISTERED' ? '미등록교인 가입 - 추가 정보를 입력해주세요' : '등록교인 가입 - 기본 정보를 입력해주세요'}
        </p>
      </div>

      <div className="bg-white p-8 md:p-10 shadow-sm">
        <div className="space-y-6">
          {/* 에러 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
          )}

          <div className="pb-2 border-b">
            <h3 className="text-lg font-medium text-slate-900">필수 정보</h3>
          </div>

          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="홍길동" maxLength={50}
              className="w-full px-4 py-3 border border-slate-300 focus:border-slate-900 focus:outline-none transition" />
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              성별 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6">
              {['MALE', 'FEMALE'].map((g) => (
                <label key={g} className="flex items-center cursor-pointer">
                  <input type="radio" name="gender" value={g}
                    checked={form.gender === g}
                    onChange={() => set('gender', g)}
                    className="w-4 h-4" />
                  <span className="ml-2 text-slate-700">{g === 'MALE' ? '남성' : '여성'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 전화번호 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <input type="tel" value={form.phoneNumber}
              onChange={(e) => set('phoneNumber', formatPhone(e.target.value))}
              placeholder="010-0000-0000" maxLength={13}
              className="w-full px-4 py-3 border border-slate-300 focus:border-slate-900 focus:outline-none transition" />
            <p className="mt-1 text-xs text-slate-500">010-0000-0000 형식으로 입력해주세요</p>
          </div>

          {/* 미등록교인 추가 필드 */}
          {userType === 'UNREGISTERED' && (
            <>
              <div className="pt-4 pb-2 border-b">
                <h3 className="text-lg font-medium text-slate-900">추가 정보</h3>
                <p className="text-sm text-slate-500 mt-1">가입 경로는 필수로 입력해주세요</p>
              </div>

              {/* 주소 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">주소</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" readOnly value={form.address ? '주소 선택됨' : ''}
                    placeholder="도로명 주소"
                    className="flex-1 px-4 py-3 border border-slate-300 bg-slate-50 text-sm" />
                  <button type="button" onClick={handleAddressSearch}
                    className="px-4 py-3 border-2 border-slate-300 hover:border-slate-900 transition text-sm font-medium">
                    주소 검색
                  </button>
                </div>
                {form.address && (
                  <p className="text-sm text-slate-600 mb-2 px-1">{form.address}</p>
                )}
                <input type="text" value={form.detailAddress}
                  onChange={(e) => set('detailAddress', e.target.value)}
                  placeholder="상세주소 (선택)"
                  className="w-full px-4 py-3 border border-slate-300 focus:border-slate-900 focus:outline-none transition" />
              </div>

              {/* 생년월일 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">생년월일</label>
                <DateInput
                  value={form.birth}
                  onChange={(v) => set('birth', v)}
                  placeholder="생년월일 선택"
                  maxDate={new Date()}
                  className="w-full px-4 py-3 border border-slate-300 focus:border-slate-900 focus:outline-none transition"
                />
              </div>

              {/* 가입 경로 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  교회를 알게 된 경로 <span className="text-red-500">*</span>
                </label>
                <textarea value={form.registrationPath}
                  onChange={(e) => set('registrationPath', e.target.value)}
                  rows={3} maxLength={500} placeholder="예) 지인 소개, 인터넷 검색 등"
                  className="w-full px-4 py-3 border border-slate-300 focus:border-slate-900 focus:outline-none transition resize-none" />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={onBack}
            className="flex-1 py-3 border-2 border-slate-300 text-slate-700 hover:border-slate-900 transition font-medium">
            이전
          </button>
          <button onClick={handleSubmit} disabled={mutation.isPending}
            className="flex-1 py-3 bg-slate-900 text-white hover:bg-slate-800 transition font-medium disabled:opacity-60">
            {mutation.isPending ? '처리 중...' : '회원가입 완료'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────
const SocialRegisterPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tempToken = searchParams.get('tempToken')

  const [step,     setStep]     = useState(1)
  const [userType, setUserType] = useState(null)
  const [consent,  setConsent]  = useState(null)

  // 마운트 시 1회 실행 — tempToken 유효성 확인 및 Daum 주소 API 스크립트 로드
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!tempToken) {
      toast.error('잘못된 접근입니다.')
      navigate('/login')
      return
    }
    if (!document.querySelector('script[src*="postcode.v2"]')) {
      const script = document.createElement('script')
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
      document.head.appendChild(script)
    }
  }, [])

  if (!tempToken) return null

  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-32">
      <div className="max-w-2xl w-full">
        {step === 1 && (
          <Step1
            onSelect={(type) => { setUserType(type); setStep(2) }}
          />
        )}
        {step === 2 && (
          <Step2
            userType={userType}
            onBack={() => setStep(1)}
            onNext={(c) => { setConsent(c); setStep(3) }}
          />
        )}
        {step === 3 && (
          <Step3
            userType={userType}
            consent={consent}
            tempToken={tempToken}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </section>
  )
}

export default SocialRegisterPage
