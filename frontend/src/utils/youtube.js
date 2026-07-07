/**
 * YouTube URL(watch/youtu.be/embed/shorts, 쿼리 파라미터 순서 무관)에서 영상 ID를 추출한다.
 * 여러 페이지에 제각각 구현돼 있던 정규식/URL 파싱 로직을 하나로 통일한 버전.
 */
export function extractYouTubeId(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be' || u.hostname === 'www.youtu.be') {
      return u.pathname.slice(1).split('/')[0] || null
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return v
      const match = u.pathname.match(/\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/)
      if (match) return match[1]
    }
    return null
  } catch {
    return null
  }
}
