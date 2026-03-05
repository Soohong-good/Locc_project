import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants'
import { getMe } from '@/api/auth'

/**
 * OAuth2 로그인 콜백 처리
 *
 * 백엔드 OAuth2SuccessHandler가 아래 URL로 리다이렉트:
 *   http://localhost:3000/oauth2/callback?accessToken=...&refreshToken=...
 *
 * 이 컴포넌트에서:
 * 1. URL 파라미터에서 토큰 추출
 * 2. localStorage 저장
 * 3. /api/auth/me 호출로 사용자 정보 세팅
 * 4. 메인 페이지로 이동
 */
const OAuth2Callback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')
    const error = searchParams.get('error')

    if (error) {
      navigate(`/login?error=${error}`, { replace: true })
      return
    }

    if (!accessToken) {
      navigate('/login?error=oauth2_failed', { replace: true })
      return
    }

    localStorage.setItem(TOKEN_KEY, accessToken)
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)

    // 토큰 저장 후 유저 정보 로드
    getMe()
      .then((user) => {
        setUser(user)
        navigate('/', { replace: true })
      })
      .catch(() => {
        navigate('/login?error=oauth2_failed', { replace: true })
      })
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">로그인 처리 중...</p>
    </div>
  )
}

export default OAuth2Callback
