import { Component } from 'react'
import { Link } from 'react-router-dom'

/**
 * 페이지 레벨 에러 바운더리
 *
 * React의 함수형 컴포넌트에서는 componentDidCatch를 사용할 수 없어
 * 클래스형으로 구현한다.
 *
 * 사용 예시:
 *   <ErrorBoundary>
 *     <SomePage />
 *   </ErrorBoundary>
 *
 * 렌더링 에러(JS 오류)를 잡는다.
 * 네트워크/API 에러는 TanStack Query의 onError 또는 ErrorMessage 컴포넌트로 처리한다.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md px-4">
            <p className="text-5xl font-bold text-gray-200 mb-4">오류</p>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              페이지를 불러오는 중 오류가 발생했습니다
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {this.state.error?.message ?? '알 수 없는 오류입니다.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                다시 시도
              </button>
              <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
