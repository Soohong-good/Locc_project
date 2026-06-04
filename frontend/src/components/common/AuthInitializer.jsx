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

  const { data, isError, isSuccess, isFetched } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: true,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const { data: permissionsData } = useQuery({
    queryKey: ['auth', 'me', 'permissions'],
    queryFn: getMyPermissions,
    enabled: !!data,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (isSuccess) {
      if (data) setUser(data)
      else clearAuth()
      setInitialized()
    }
    if (isError) {
      clearAuth()
      setInitialized()
    }
  }, [isSuccess, isError, isFetched, data, setUser, setInitialized, clearAuth])

  useEffect(() => {
    if (permissionsData) setPermissions(permissionsData)
  }, [permissionsData, setPermissions])

  return null
}

export default AuthInitializer
