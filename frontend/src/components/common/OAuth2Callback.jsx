import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import { getMe } from '@/api/auth'

/**
 * OAuth2 로그인 콜백 처리
 *
 * 토큰 방식: HttpOnly 쿠키
 * - 백엔드 OAuth2SuccessHandler가 Set-Cookie로 토큰을 이미 발급한 상태로 리다이렉트
 * - URL 파라미터에 토큰 없음 → 추출/저장 불필요
 *
 * 처리 흐름:
 * 1. error 파라미터 있으면 /login?error=... 이동
 * 2. error 없으면 /api/auth/me 호출로 사용자 정보 확인 (쿠키 자동 전송)
 * 3. 성공 시 메인 페이지로 이동
 */
const OAuth2Callback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  useEffect(() => {
    const error = searchParams.get('error')

    if (error) {
      // error 파라미터 화이트리스트 — 허용된 값만 전달 (Reflected XSS 방지)
      const allowedErrors = ['rejected', 'oauth2_error', 'oauth2_failed', 'access_denied', 'email_conflict']
      const safeError = allowedErrors.includes(error) ? error : 'oauth2_error'

      // 이메일 충돌은 전용 안내 페이지로
      if (safeError === 'email_conflict') {
        navigate('/social/email-conflict', { replace: true })
        return
      }

      navigate(`/login?error=${safeError}`, { replace: true })
      return
    }

    // 쿠키는 이미 백엔드가 발급 — 바로 유저 정보 조회
    getMe()
      .then((user) => {
        setUser(user)
        navigate('/', { replace: true })
      })
      .catch(() => {
        navigate('/login?error=oauth2_failed', { replace: true })
      })
  }, [searchParams, navigate, setUser])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">로그인 처리 중...</p>
    </div>
  )
}

export default OAuth2Callback
