import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMyApplications } from '@/api/applications'
import useAuthStore from '@/stores/authStore'

const STATUS_BADGE = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100  text-green-700',
}

const ApplicationListPage = () => {
  const navigate    = useNavigate()
  const { user }    = useAuthStore()
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['applications', 'my', page],
    queryFn:  () => getMyApplications({ page, size: 20 }),
    placeholderData: (prev) => prev,
  })

  const list     = data?.content      ?? []
  const pageInfo = data?.pageInfo     ?? {}
  const totalPages = pageInfo.totalPages ?? 1

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">로그인 후 이용하실 수 있습니다.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
        >
          로그인
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">시설 · 차량 신청</h1>
          <p className="text-sm text-gray-500 mt-1">나의 신청 내역을 확인하고 새로운 신청을 할 수 있습니다.</p>
        </div>
        <Link
          to="/applications/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          + 신청하기
        </Link>
      </div>

      {/* 목록 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">불러오는 중...</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm mb-3">신청 내역이 없습니다.</p>
            <Link
              to="/applications/new"
              className="text-blue-600 text-sm hover:underline"
            >
              첫 신청을 해보세요 →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
                <th className="px-4 py-3 text-left font-medium">카테고리</th>
                <th className="px-4 py-3 text-left font-medium">목적</th>
                <th className="px-4 py-3 text-left font-medium">사용 날짜</th>
                <th className="px-4 py-3 text-left font-medium">시간</th>
                <th className="px-4 py-3 text-left font-medium">인원</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => navigate(`/applications/${item.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{item.categoryName}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{item.purpose}</td>
                  <td className="px-4 py-3 text-gray-600">{item.useDate}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {item.useStartTime?.slice(0, 5)} ~ {item.useEndTime?.slice(0, 5)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.headCount}명</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {item.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
          >
            이전
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}

export default ApplicationListPage
