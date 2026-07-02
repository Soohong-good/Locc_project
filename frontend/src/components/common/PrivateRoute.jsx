import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import useAuthStore from '@/stores/authStore'
import toast from '@/utils/toast'

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, isInitialized, isAdminOrOperator } = useAuthStore()
  const location = useLocation()
  const alerted = useRef(false)

  if (!isInitialized) return null

  if (!user) {
    if (!alerted.current) {
      alerted.current = true
      toast.info('로그인이 필요한 페이지입니다.')
    }
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && !isAdminOrOperator()) {
    return <Navigate to="/" replace />
  }

  return children
}

export default PrivateRoute
