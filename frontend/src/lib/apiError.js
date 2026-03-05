/**
 * Axios 에러에서 백엔드 ErrorResponse 메시지 추출
 *
 * 백엔드 응답 구조:
 * {
 *   success: false,
 *   code: "NOT_FOUND",
 *   message: "...",
 *   errors: [{ field, reason }]  // 검증 실패 시
 * }
 */
export const getErrorMessage = (error, fallback = '오류가 발생했습니다.') => {
  return error?.response?.data?.message ?? fallback
}

export const getErrorCode = (error) => {
  return error?.response?.data?.code ?? null
}

/**
 * 검증 오류 목록 추출 → { fieldName: 'message' } 형태로 변환
 * React Hook Form의 setError와 함께 사용
 */
export const getFieldErrors = (error) => {
  const errors = error?.response?.data?.errors ?? []
  return errors.reduce((acc, { field, reason }) => {
    acc[field] = reason
    return acc
  }, {})
}
