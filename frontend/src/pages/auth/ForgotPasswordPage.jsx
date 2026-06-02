import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { requestPasswordReset } from '@/api/auth'

const ForgotPasswordPage = () => {
  const [email, setEmail]     = useState('')
  const [success, setSuccess] = useState(false)

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => requestPasswordReset(email),
    onSuccess: () => setSuccess(true),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) mutate()
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 py-24 sm:py-32">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">비밀번호 찾기</h1>
          <p className="text-slate-600 font-light">가입하신 이메일 주소를 입력해주세요</p>
        </div>

        <div className="bg-white p-5 sm:p-8 md:p-10 shadow-sm">
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded text-sm text-center">
              <p className="font-medium mb-1">이메일이 발송되었습니다</p>
              <p>비밀번호 재설정 링크를 이메일로 보내드렸습니다.<br />이메일을 확인해주세요.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error?.response?.data?.message || '요청 처리 중 오류가 발생했습니다.'}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required placeholder="example@email.com"
                  className="w-full px-4 py-3 border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                />
                <p className="mt-2 text-xs text-slate-500">
                  가입 시 사용하신 이메일 주소를 입력하시면<br />
                  비밀번호 재설정 링크를 보내드립니다.
                </p>
              </div>

              <button
                type="submit" disabled={isPending}
                className="w-full py-3 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 transition font-medium"
              >
                {isPending ? '발송 중...' : '재설정 링크 발송'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900">
              ← 로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ForgotPasswordPage
