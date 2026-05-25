import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/api/auth'
import useAuthStore from '@/stores/authStore'

/**
 * 앱 최초 마운트 시 인증 상태 복원 컴포넌트
 *
 * 토큰 방식: HttpOnly 쿠키
 * - localStorage 토큰 존재 여부를 확인하지 않는다
 * - 쿠키가 있으면 브라우저가 자동으로 서버에 전송 (withCredentials: true)
 * - 서버가 쿠키를 검증하여 200 또는 401 반환
 *
 * 동작:
 * 1. /api/auth/me 항상 호출
 *    - 200: user 상태 세팅
 *    - 401: 비로그인 상태로 초기화 (client.js 인터셉터가 refresh 시도 후 최종 실패)
 * 2. isInitialized = true → 라우트 가드 활성화
 *
 * 이 컴포넌트는 children을 렌더링하지 않는다.
 * App.jsx에서 <AuthInitializer /> 를 Router 내부에 위치시킨다.
 */
const AuthInitializer = () => {
  const { setUser, setInitialized, clearAuth } = useAuthStore()

  const { data, isError, isSuccess, isFetched } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: true,              // 쿠키 인증 — 항상 호출, 서버가 유효성 판단
    retry: false,               // 401이면 재시도 없이 바로 실패 처리
    staleTime: 5 * 60 * 1000,  // 5분 동안 캐시 유지
  })

  useEffect(() => {
    if (isSuccess) {
      // data가 null이면 비로그인 상태 (서버가 200 + null 반환)
      if (data) setUser(data)
      else clearAuth()
      setInitialized()
    }
    if (isError) {
      clearAuth()
      setInitialized()
    }
  }, [isSuccess, isError, isFetched, data, setUser, setInitialized, clearAuth])

  return null
}

export default AuthInitializer
