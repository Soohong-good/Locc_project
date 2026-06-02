import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { validateResetToken, resetPassword } from '@/api/auth'
import toast from '@/utils/toast'

const PW_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/

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

const ResetPasswordPage = () => {
  const [searchParams]            = useSearchParams()
  const navigate                  = useNavigate()
  const token                     = searchParams.get('token') ?? ''

  const [tokenValid, setTokenValid] = useState(null) // null=확인중 | true | false
  const [form, setForm]             = useState({ newPassword: '', confirmPassword: '' })
  const [formError, setFormError]   = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showNewPw, setShowNewPw]       = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))

  const handleBlur = (key) => (e) => {
    const value = e.target.value
    let error = ''
    if (key === 'newPassword') {
      if (!value) error = '비밀번호를 입력해주세요.'
      else if (!PW_REGEX.test(value)) error = '8자 이상의 영문, 숫자, 특수문자를 각각 1자 이상 포함해야 합니다.'
    } else if (key === 'confirmPassword') {
      if (!value) error = '비밀번호 확인을 입력해주세요.'
      else if (value !== form.newPassword) error = '비밀번호가 일치하지 않습니다.'
    }
    setFieldErrors((prev) => ({ ...prev, [key]: error || undefined }))
  }

  // 토큰 유효성 사전 검증
  const { mutate: validate } = useMutation({
    mutationFn: () => validateResetToken(token),
    onSuccess: () => setTokenValid(true),
    onError:   () => setTokenValid(false),
  })

  useEffect(() => {
    if (token) validate()
    else       setTokenValid(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const { mutate: doReset, isPending, error: apiError } = useMutation({
    mutationFn: () => resetPassword({ token, newPassword: form.newPassword }),
    onSuccess: () => {
      toast.success('비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.')
      navigate('/login')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')

    if (form.newPassword !== form.confirmPassword) {
      setFormError('비밀번호가 일치하지 않습니다.'); return
    }
    if (!PW_REGEX.test(form.newPassword)) {
      setFormError('8자 이상의 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.'); return
    }
    doReset()
  }

  // 토큰 확인 중
  if (tokenValid === null) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <p className="text-slate-500">링크를 확인하는 중...</p>
      </section>
    )
  }

  // 토큰 무효
  if (!tokenValid) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-32">
        <div className="max-w-md w-full text-center">
          <div className="bg-white p-10 shadow-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-light text-slate-900 mb-4">링크가 만료되었습니다</h1>
            <p className="text-slate-500 text-sm mb-8">
              비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.<br />
              비밀번호 찾기를 다시 시도해주세요.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 transition font-medium"
            >
              비밀번호 찾기
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-32">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">비밀번호 재설정</h1>
          <p className="text-slate-600 font-light">새로운 비밀번호를 입력해주세요</p>
        </div>

        <div className="bg-white p-8 md:p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {(formError || apiError) && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {formError || apiError?.response?.data?.message || '요청 처리 중 오류가 발생했습니다.'}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                새 비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'} value={form.newPassword} onChange={set('newPassword')}
                  onBlur={handleBlur('newPassword')}
                  required minLength={8} autoComplete="new-password"
                  placeholder="8자 이상 영문, 숫자, 특수문자 포함"
                  className="w-full px-4 py-3 pr-11 border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowNewPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showNewPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                8자 이상의 영문, 숫자, 특수문자를 각각 1자 이상 포함해야 합니다.
              </p>
              {fieldErrors.newPassword && <p className="mt-1 text-xs text-red-500">{fieldErrors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  required minLength={8} autoComplete="new-password"
                  placeholder="비밀번호를 다시 입력해주세요"
                  className="w-full px-4 py-3 pr-11 border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowConfirmPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirmPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
            </div>

            <button
              type="submit" disabled={isPending}
              className="w-full py-3 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 transition font-medium"
            >
              {isPending ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default ResetPasswordPage
