import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { login as loginApi, logout as logoutApi, getMe } from '@/api/auth'
import useAuthStore from '@/stores/authStore'

/**
 * 로그인 뮤테이션
 *
 * 토큰 저장 방식: HttpOnly 쿠키 (서버가 Set-Cookie로 처리)
 * 클라이언트에서는 토큰을 직접 저장하지 않는다.
 *
 * 로그인 성공 흐름:
 *   1. 서버가 accessToken / refreshToken 을 HttpOnly 쿠키로 발급
 *   2. /api/auth/me 호출로 전체 유저 정보 세팅 (쿠키 자동 전송)
 *   3. 이전 페이지 또는 / 로 이동
 */
export const useLogin = () => {
  const { setUser } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  return useMutation({
    mutationFn: loginApi,
    onSuccess: async (data) => {
      // 토큰은 이미 HttpOnly 쿠키로 설정됨 — localStorage 저장 없음

      // 쿠키 기반으로 유저 정보 조회
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
 * 서버가 쿠키 만료 처리 → 클라이언트는 상태만 초기화
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
