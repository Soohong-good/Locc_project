import { Navigate } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'

/**
 * 비인증 라우트 가드 (PrivateRoute 의 반대)
 *
 * 이미 로그인한 사용자가 로그인/회원가입 등 인증 페이지에
 * 직접 URL로 접근하는 것을 차단하고 홈(/)으로 리다이렉트한다.
 *
 * isInitialized 가 false 인 동안은 판단을 보류(null 반환)하여
 * 초기화 완료 후 올바른 방향으로 리다이렉트되도록 한다.
 */
const GuestRoute = ({ children }) => {
  const { user, isInitialized } = useAuthStore()

  if (!isInitialized) return null

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

export default GuestRoute
