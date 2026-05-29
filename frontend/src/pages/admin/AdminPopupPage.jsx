import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getAllPopups, deletePopup, togglePopupActive } from '@/api/popups'

const TARGET_LABEL = { ALL: '전체', MEMBER_ONLY: '회원', GUEST_ONLY: '비회원' }

const AdminPopupPage = () => {
  const queryClient = useQueryClient()
  const [filterActive, setFilterActive] = useState(null)

  const { data: popups = [], isLoading } = useQuery({
    queryKey: ['admin', 'popups', filterActive],
    queryFn: () => getAllPopups(filterActive),
  })

  const toggleMutation = useMutation({
    mutationFn: togglePopupActive,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'popups'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deletePopup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'popups'] }),
  })

  const handleDelete = (id, title) => {
    if (!window.confirm(`"${title}" 팝업을 삭제하시겠습니까?`)) return
    deleteMutation.mutate(id)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">팝업 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">메인 팝업 노출 설정</p>
        </div>
        <Link
          to="/admin/popups/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 팝업 등록
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { label: '전체', value: null },
          { label: '활성', value: true },
          { label: '비활성', value: false },
        ].map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setFilterActive(value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filterActive === value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-sm">불러오는 중...</div>
        ) : popups.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">등록된 팝업이 없습니다</div>
        ) : (
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-36" />
            <col className="w-20" />
            <col />
            <col className="w-20" />
            <col className="w-24" />
            <col className="w-24" />
          </colgroup>
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">제목</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">대상</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">노출 기간</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">우선순위</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">상태</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
              {popups.map((popup) => (
                <tr key={popup.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{popup.title}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {TARGET_LABEL[popup.targetType] ?? popup.targetType}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(popup.displayStartDate)} ~ {formatDate(popup.displayEndDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-center">{popup.priority}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleMutation.mutate(popup.id)}
                      disabled={toggleMutation.isPending}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        popup.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {popup.isActive ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/popups/${popup.id}/edit`}
                        className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(popup.id, popup.title)}
                        disabled={deleteMutation.isPending}
                        className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
        )}
      </div>
    </div>
  )
}

export default AdminPopupPage
