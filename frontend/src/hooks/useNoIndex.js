import { useEffect } from 'react'

/**
 * condition이 true인 동안 <meta name="robots" content="noindex">를 삽입한다.
 * 삭제된/존재하지 않는 게시물 페이지처럼 SPA 특성상 200 OK를 반환할 수밖에 없는
 * 페이지를 검색엔진 색인에서 제외해 Soft 404 오인을 줄이는 용도.
 */
export default function useNoIndex(condition = true) {
  useEffect(() => {
    if (!condition) return

    let meta = document.querySelector('meta[name="robots"]')
    const created = !meta
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'robots')
      document.head.appendChild(meta)
    }
    const prevContent = meta.getAttribute('content')
    meta.setAttribute('content', 'noindex')

    return () => {
      if (created) {
        meta.remove()
      } else if (prevContent !== null) {
        meta.setAttribute('content', prevContent)
      }
    }
  }, [condition])
}
