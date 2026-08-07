/**
 * 리치 텍스트(에디터 HTML) 공용 유틸
 * 에디터 도입 이전에 저장된 순수 텍스트 본문과 에디터 HTML 본문을 함께 다루기 위한 헬퍼.
 */

/** HTML 태그가 포함된 본문인지 판별 (에디터 도입 이전 순수 텍스트 본문 구분용) */
export const isHtmlContent = (value) => !!value && /<[a-z][\s\S]*>/i.test(value)

/**
 * 에디터에 주입할 HTML로 변환
 * 순수 텍스트는 줄바꿈이 사라지므로 <br>로 치환해서 넘긴다.
 */
export const toEditorHtml = (value) => {
  if (!value) return ''
  if (isHtmlContent(value)) return value
  return `<p>${value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r?\n/g, '<br>')}</p>`
}

/** 목록 미리보기용 — 태그 제거 후 공백 정리한 순수 텍스트 반환 */
export const stripHtml = (value) => {
  if (!value) return ''
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}
