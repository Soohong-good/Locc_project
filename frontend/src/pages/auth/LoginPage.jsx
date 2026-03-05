import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/apiError'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { mutate: login, isPending, error } = useLogin()
  const location = useLocation()
  const queryError = new URLSearchParams(location.search).get('error')

  const handleSubmit = (e) => {
    e.preventDefault()
    login({ email, password })
  }

  const oauthErrorMsg = {
    rejected: '반려된 계정입니다. 관리자에게 문의하세요.',
    oauth2_error: '소셜 로그인 중 오류가 발생했습니다.',
    oauth2_failed: '소셜 로그인에 실패했습니다.',
  }[queryError]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
          로그인
        </h1>

        {/* OAuth 에러 메시지 */}
        {oauthErrorMsg && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
            {oauthErrorMsg}
          </p>
        )}

        {/* API 에러 메시지 */}
        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
            {getErrorMessage(error, '이메일 또는 비밀번호를 확인해주세요.')}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            {isPending ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 소셜 로그인 */}
        <div className="mt-6">
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-3 text-xs text-gray-400">또는</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>
          <div className="mt-4 space-y-2">
            <a
              href="/oauth2/authorization/kakao"
              className="flex items-center justify-center w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              카카오로 로그인
            </a>
            <a
              href="/oauth2/authorization/naver"
              className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              네이버로 로그인
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          계정이 없으신가요?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
