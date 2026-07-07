import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * 현재 경로(쿼리스트링 제외) 기준으로 <link rel="canonical">을 자동 설정한다.
 * SPA는 페이지마다 canonical 태그가 없으면 검색엔진이 "중복 페이지"로 오인하므로,
 * 앱 최상단에서 한 번만 호출해 모든 라우트에 공통 적용한다.
 */
export default function useCanonical() {
  const { pathname } = useLocation()

  useEffect(() => {
    const href = `${window.location.origin}${pathname}`
    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', href)
  }, [pathname])
}
