import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'

/**
 * 인증 라우트 가드
 *
 * @param {boolean} adminOnly - true 이면 ADMIN 권한도 추가로 검사
 *
 * isInitialized가 false (앱 초기화 중) → 빈 화면 유지 (깜빡임 방지)
 * 비로그인 → /login 으로 redirect (현재 경로를 state로 전달)
 * 관리자 전용 페이지인데 일반 유저 → / 로 redirect
 */
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, isInitialized } = useAuthStore()
  const location = useLocation()

  if (!isInitialized) return null

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />
  }

  return children
}

export default PrivateRoute
