/** 날짜 → "yyyy.mm.dd" (목록/카드 등에서 공통으로 쓰는 기본 표기) */
export function formatDateDot(val) {
  if (!val) return ''
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

/** 날짜 → "yyyy-mm-dd" (formatDateDot과 동일 값, 구분자만 대시) */
export function formatDateDash(val) {
  const dotted = formatDateDot(val)
  return dotted ? dotted.replace(/\./g, '-') : ''
}

/** 날짜 → "yyyy. mm. dd" (점 뒤 공백이 있는 표기) */
export function formatDateDotSpaced(val) {
  if (!val) return ''
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`
}
