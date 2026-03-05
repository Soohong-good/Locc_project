import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { login as loginApi, logout as logoutApi, getMe } from '@/api/auth'
import useAuthStore from '@/stores/authStore'
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants'

/**
 * 로그인 뮤테이션
 *
 * 백엔드 UserAuthResponse 구조:
 *   { accessToken, refreshToken, tokenType, expiresIn, username, role, message }
 *
 * 로그인 성공 흐름:
 *   1. 토큰 localStorage 저장
 *   2. /api/auth/me 호출로 전체 유저 정보 세팅 (UserDetailResponse)
 *   3. 이전 페이지 또는 / 로 이동
 */
export const useLogin = () => {
  const { setUser } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  return useMutation({
    mutationFn: loginApi,
    onSuccess: async (data) => {
      localStorage.setItem(TOKEN_KEY, data.accessToken)
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
      }

      // 토큰 저장 후 전체 유저 정보 조회
      try {
        const user = await getMe()
        setUser(user)
      } catch {
        // getMe 실패해도 username/role 기반 최소 정보로 유지
        setUser({ name: data.username, role: data.role })
      }

      // 이전 페이지가 있으면 복귀, 없으면 홈으로
      const from = location.state?.from?.pathname ?? '/'
      navigate(from, { replace: true })
    },
  })
}

/**
 * 로그아웃 뮤테이션
 * 성공/실패 모두 클라이언트 토큰 삭제 후 로그인 페이지로 이동
 */
export const useLogout = () => {
  const { clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      clearAuth()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}
