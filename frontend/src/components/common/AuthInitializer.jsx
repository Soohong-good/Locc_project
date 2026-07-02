import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/api/auth'
import { getMyPermissions } from '@/api/users'
import useAuthStore from '@/stores/authStore'

/**
 * 앱 최초 마운트 시 인증 상태 복원 컴포넌트
 */
const AuthInitializer = () => {
  const { setUser, setInitialized, clearAuth, setPermissions } = useAuthStore()
  const user = useAuthStore((state) => state.user)

  const { data, isError, isSuccess, isFetched } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: true,
    retry: false,
    staleTime: 5 * 60 * 1000,
    // 관리자 access/refresh 토큰이 짧아(5분/30분) 탭을 방치했다 돌아오면 세션이 끊겨있는 경우가 흔함.
    // 전역 refetchOnWindowFocus는 꺼져있으므로(main.jsx), 인증 확인만 예외적으로 탭 복귀 시 재검증한다.
    refetchOnWindowFocus: 'always',
  })

  const { data: permissionsData, isFetched: isPermissionsFetched } = useQuery({
    queryKey: ['auth', 'me', 'permissions'],
    queryFn: getMyPermissions,
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  // 1단계: 사용자 정보 로드
  //   - 비로그인/오류 → 즉시 initialized
  //   - 로그인 → setUser만, initialized는 권한 로드 후로 미룸
  useEffect(() => {
    if (!isFetched) return
    if (isSuccess) {
      if (data) {
        setUser(data)
      } else {
        clearAuth()
        setInitialized()
      }
    }
    if (isError) {
      clearAuth()
      setInitialized()
    }
  }, [isSuccess, isError, isFetched, data, setUser, setInitialized, clearAuth])

  // 2단계: 권한 로드 완료 → 권한 저장 + initialized
  //   - 성공/실패 모두 isFetched=true → 스피너 해제
  useEffect(() => {
    if (!isPermissionsFetched) return
    setPermissions(permissionsData ?? [])
    setInitialized()
  }, [isPermissionsFetched, permissionsData, setPermissions, setInitialized])

  return null
}

export default AuthInitializer
