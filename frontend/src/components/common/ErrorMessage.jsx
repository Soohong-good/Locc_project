import { getErrorMessage } from '@/lib/apiError'

/**
 * API 에러 메시지 표시 컴포넌트
 *
 * 사용 예시:
 *   <ErrorMessage error={error} />
 *   <ErrorMessage error={error} fallback="목록을 불러올 수 없습니다." />
 *   <ErrorMessage message="직접 메시지 전달" />
 */
const ErrorMessage = ({ error, message, fallback }) => {
  const text = message ?? getErrorMessage(error, fallback ?? '오류가 발생했습니다.')

  return (
    <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
      <p className="text-sm text-red-600">{text}</p>
    </div>
  )
}

export default ErrorMessage
