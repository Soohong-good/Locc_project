import useAuthStore from '@/stores/authStore'

/**
 * 메인 페이지 (임시)
 * React 전환 단계에서 인증 상태 확인용으로 사용
 * 추후 교회 메인 화면으로 교체 예정
 */
const MainPage = () => {
  const { user } = useAuthStore()

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          그리스도사랑교회
        </h1>
        {user ? (
          <div className="mt-4 space-y-1">
            <p className="text-gray-600">
              안녕하세요,{' '}
              <span className="font-medium">{user.name}</span>님
            </p>
            <p className="text-xs text-gray-400">역할: {user.role}</p>
          </div>
        ) : (
          <p className="mt-4 text-gray-500 text-sm">비로그인 상태입니다.</p>
        )}
      </div>
    </div>
  )
}

export default MainPage
