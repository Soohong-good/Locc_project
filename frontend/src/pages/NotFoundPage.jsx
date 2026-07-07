import { Link } from 'react-router-dom'
import useNoIndex from '@/hooks/useNoIndex'

const NotFoundPage = () => {
  useNoIndex()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200">404</p>
        <h1 className="mt-4 text-xl font-semibold text-gray-800">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
