import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/api/auth'
import useAuthStore from '@/stores/authStore'
import { TOKEN_KEY } from '@/lib/constants'

/**
 * 앱 최초 마운트 시 토큰 유효성 검증 컴포넌트
 *
 * 동작:
 * 1. localStorage에 토큰이 없으면 즉시 초기화 완료(비로그인 상태)
 * 2. 토큰이 있으면 /api/auth/me 호출
 *    - 성공: user 상태 세팅
 *    - 실패(401): 토큰 만료 → clearAuth (client.js 인터셉터가 갱신 시도 후 실패 시 처리)
 * 3. isInitialized = true 로 설정 → 라우트 가드 활성화
 *
 * 이 컴포넌트는 children을 렌더링하지 않는다.
 * App.jsx에서 <AuthInitializer /> 를 Router 내부에 위치시킨다.
 */
const AuthInitializer = () => {
  const { setUser, setInitialized, clearAuth } = useAuthStore()
  const hasToken = !!localStorage.getItem(TOKEN_KEY)

  const { data, isError, isSuccess, isFetched } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: hasToken,          // 토큰 없으면 호출 안 함
    retry: false,               // 401이면 재시도 없이 바로 실패 처리
    staleTime: 5 * 60 * 1000,  // 5분 동안 캐시 유지
  })

  useEffect(() => {
    if (!hasToken) {
      setInitialized()
      return
    }
    if (isSuccess) {
      setUser(data)
      setInitialized()
    }
    if (isError) {
      clearAuth()
      setInitialized()
    }
  }, [isSuccess, isError, isFetched, hasToken])

  return null
}

export default AuthInitializer
