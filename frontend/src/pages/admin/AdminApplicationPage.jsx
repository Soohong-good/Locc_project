import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  getAdminApplications,
  getAdminApplicationCategories,
  downloadApplicationsExcel,
} from '@/api/applications'

const STATUS_BADGE = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100  text-green-700',
}

const AdminApplicationPage = () => {
  const navigate = useNavigate()
  const [page,       setPage]       = useState(0)
  const [categoryId, setCategoryId] = useState('')
  const [status,     setStatus]     = useState('')
  const [downloading, setDownloading] = useState(false)

  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'application-categories'],
    queryFn:  getAdminApplicationCategories,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'applications', { page, categoryId, status }],
    queryFn:  () => getAdminApplications({
      page, size: 20,
      categoryId: categoryId || undefined,
      status:     status     || undefined,
    }),
    placeholderData: (prev) => prev,
  })

  const list       = data?.content  ?? []
  const pageInfo   = data?.pageInfo ?? {}
  const totalPages = pageInfo.totalPages ?? 1

  const handleExcel = async () => {
    setDownloading(true)
    try {
      await downloadApplicationsExcel({
        categoryId: categoryId || undefined,
        status:     status     || undefined,
      })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">시설 · 차량 신청 관리</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/applications/categories')}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            카테고리 관리
          </button>
          <button
            onClick={handleExcel}
            disabled={downloading}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
          >
            {downloading ? '다운로드 중...' : '엑셀 다운로드'}
          </button>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-3 mb-5">
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체 상태</option>
          <option value="PENDING">접수 대기</option>
          <option value="COMPLETED">처리 완료</option>
        </select>
      </div>

      {/* 목록 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">불러오는 중...</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">신청 내역이 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
                <th className="px-4 py-3 text-left font-medium">카테고리</th>
                <th className="px-4 py-3 text-left font-medium">신청자</th>
                <th className="px-4 py-3 text-left font-medium">사용 날짜</th>
                <th className="px-4 py-3 text-left font-medium">시간</th>
                <th className="px-4 py-3 text-left font-medium">목적</th>
                <th className="px-4 py-3 text-left font-medium">인원</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">접수일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => navigate(`/admin/applications/${item.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{item.categoryName}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.applicantName}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.useDate}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {item.useStartTime?.slice(0,5)} ~ {item.useEndTime?.slice(0,5)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{item.purpose}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.headCount}명</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {item.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{item.createdAt?.slice(0,10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">이전</button>
          <span className="px-3 py-1.5 text-sm text-gray-600">{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">다음</button>
        </div>
      )}
    </div>
  )
}

export default AdminApplicationPage
