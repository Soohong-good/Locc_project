/** 페이지네이션 슬라이딩 윈도우 크기 (최대 버튼 개수) */
export const PAGE_WINDOW = 5

/**
 * 현재 페이지를 중심으로 최대 PAGE_WINDOW개의 페이지 번호를 반환한다.
 * 목록 페이지 전반에서 공통으로 사용하는 페이지네이션 버튼 범위 계산.
 */
export function getPageRange(current, total) {
  if (total <= PAGE_WINDOW) return Array.from({ length: total }, (_, i) => i)
  let start = Math.max(0, current - Math.floor(PAGE_WINDOW / 2))
  const end = Math.min(total, start + PAGE_WINDOW)
  start = Math.max(0, end - PAGE_WINDOW)
  return Array.from({ length: PAGE_WINDOW }, (_, i) => start + i)
}
