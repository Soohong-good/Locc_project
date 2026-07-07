/** 숫자만 남긴 뒤 000-0000-0000 형태로 하이픈을 넣어 표시한다 (입력 중 실시간 포맷용). */
export function formatPhone(val) {
  const digits = (val ?? '').replace(/[^0-9]/g, '')
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
}
