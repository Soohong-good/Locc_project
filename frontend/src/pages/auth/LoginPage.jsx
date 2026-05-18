import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import { ERROR_CODE } from '@/lib/constants'

// 에러 코드 → UI 표현 방식 결정 (메시지는 백단에서 수신)
function parseLoginError(error) {
  const err = error?.response?.data
  if (!err) return { msg: '로그인 중 오류가 발생했습니다.', field: null, type: 'error' }

  switch (err.code) {
    case ERROR_CODE.INVALID_CREDENTIALS:
      return { msg: err.message, field: null, type: 'error' }
    case ERROR_CODE.ACCOUNT_NOT_APPROVED:
      return { msg: err.message, field: null, type: err.approvalStatus === 'PENDING' ? 'info' : 'error' }
    case ERROR_CODE.ACCOUNT_DELETED:
    case ERROR_CODE.ACCOUNT_DISABLED:
      return { msg: err.message, field: null, type: 'error' }
    default:
      return { msg: err.message || '로그인 중 오류가 발생했습니다.', field: null, type: 'error' }
  }
}

const LoginPage = () => {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const { mutate: login, isPending, error } = useLogin()
  const location = useLocation()

  const queryError = new URLSearchParams(location.search).get('error')
  const oauthErrorMsg = {
    rejected:      '반려된 계정입니다. 관리자에게 문의하세요.',
    oauth2_error:  '소셜 로그인 중 오류가 발생했습니다.',
    oauth2_failed: '소셜 로그인에 실패했습니다.',
  }[queryError]

  const oauthErrorType = 'error'

  const apiError = error ? parseLoginError(error) : null

  const handleSubmit = (e) => {
    e.preventDefault()
    login({ email, password })
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-32">
      <div className="max-w-md w-full">
        {/* 로고/타이틀 */}
        <div className="text-center mb-10">
          <Link to="/">
            <img src="/logo.png" alt="그리스도 사랑교회" className="h-14 w-auto mx-auto mb-6 opacity-90" />
          </Link>
          <h1 className="text-3xl font-light text-slate-900 mb-2">로그인</h1>
          <p className="text-sm text-slate-500 font-light">그리스도 사랑교회에 오신 것을 환영합니다</p>
        </div>

        <div className="bg-white p-8 md:p-10 border border-slate-200 shadow-sm">
          {/* OAuth 에러 */}
          {oauthErrorMsg && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{oauthErrorMsg}</p>
            </div>
          )}

          {/* 필드와 무관한 일반 에러 (승인 대기, 반려, 비활성 등) */}
          {apiError && !apiError.field && (
            <div className={`mb-5 px-4 py-3 text-sm border ${
              apiError.type === 'info'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {apiError.msg.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 이메일 */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide uppercase">이메일</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email" placeholder="example@email.com"
                className="w-full px-4 py-3 text-sm border bg-slate-50 focus:bg-white focus:outline-none transition-colors border-slate-200 focus:border-slate-900"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide uppercase">비밀번호</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required autoComplete="current-password"
                className="w-full px-4 py-3 text-sm border bg-slate-50 focus:bg-white focus:outline-none transition-colors border-slate-200 focus:border-slate-900"
              />
            </div>

            <Button type="submit" isLoading={isPending} className="w-full justify-center py-3">
              {isPending ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-slate-500 hover:text-slate-900 transition-colors">
              비밀번호 찾기
            </Link>
            <Link to="/register" className="text-slate-900 font-medium hover:text-slate-600 transition-colors">
              회원가입 →
            </Link>
          </div>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-slate-400">소셜 로그인</span>
            </div>
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-2.5">
            <a
              href="/oauth2/authorization/kakao"
              className="flex items-center justify-center w-full py-3 px-4 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FEE500', color: '#191919' }}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.78 1.83 5.23 4.58 6.81-.2.73-.75 2.81-.86 3.26-.14.57.21.56.44.41.18-.13 2.96-2.02 3.43-2.34.47.07.95.11 1.44.11 5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
              </svg>
              카카오로 계속하기
            </a>
            <a
              href="/oauth2/authorization/naver"
              className="flex items-center justify-center w-full py-3 px-4 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#03C75A', color: '#FFFFFF' }}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
              </svg>
              네이버로 계속하기
            </a>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
