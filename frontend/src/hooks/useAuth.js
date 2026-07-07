import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { login as loginApi, logout as logoutApi, getMe, linkSocialAccount } from '@/api/auth'
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
 *   3. (linkToken이 있는 경우) 소셜 계정 연결 완료 처리 → 마이페이지로 이동해 연결 확인
 *   4. 이전 페이지 또는 / 로 이동
 */
export const useLogin = () => {
  const { setUser, setSessionExpiresAt } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  return useMutation({
    mutationFn: loginApi,
    onSuccess: async (data) => {
      // TOTP 관련 — JWT 쿠키 미발급, 페이지 이동 없음
      if (data?.totpRequired || data?.totpSetupRequired) return

      setSessionExpiresAt(data?.refreshExpiresIn)

      // 토큰은 이미 HttpOnly 쿠키로 설정됨 — localStorage 저장 없음
      try {
        const user = await getMe()
        setUser(user)
      } catch {
        setUser({ name: data.username, role: data.role })
      }

      // 소셜 로그인 이메일 충돌 → 안내 페이지에서 넘어온 경우, 로그인 성공 직후 연결 완료
      const linkToken = new URLSearchParams(location.search).get('linkToken')
      if (linkToken) {
        try {
          await linkSocialAccount(linkToken)
          navigate('/mypage', { replace: true })
          return
        } catch {
          // 연결 실패해도 로그인 자체는 성공했으므로 기본 이동으로 계속 진행
        }
      }

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
