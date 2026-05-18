import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * 라우트 변경 시 스크롤을 맨 위로 이동
 */
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

export default ScrollToTop
