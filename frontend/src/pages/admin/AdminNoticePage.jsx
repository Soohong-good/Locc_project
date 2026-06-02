import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotices, deleteNotice, toggleNoticePin } from '@/api/notices'
import { SkeletonRow } from '@/components/ui/SkeletonCard'
import ErrorMessage from '@/components/common/ErrorMessage'
import toast from '@/utils/toast'

const AdminNoticePage = () => {
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const queryClient = useQueryClient()

  const queryKey = ['admin', 'notices', page, keyword]

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getNotices({ page, size: 15, keyword }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (e) => toast.error(e?.response?.data?.message ?? '삭제에 실패했습니다.'),
  })

  const pinMutation = useMutation({
    mutationFn: toggleNoticePin,
    onSuccess: () => window.location.reload(),
    onError: (e) => toast.error(e?.response?.data?.message ?? '고정 변경에 실패했습니다.'),
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setKeyword(searchInput)
    setPage(0)
  }

  const handleDelete = (id, title) => {
    if (!confirm(`"${title}" 공지사항을 삭제하시겠습니까?`)) return
    deleteMutation.mutate(id)
  }

  const notices = data?.content ?? []
  const totalPages = data?.pageInfo?.totalPages ?? 0

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">공지사항 관리</h1>
        <Link
          to="/admin/notices/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + 새 공지사항
        </Link>
      </div>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="제목으로 검색"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm px-4 py-2 rounded-lg transition-colors"
        >
          검색
        </button>
        {keyword && (
          <button
            type="button"
            onClick={() => { setKeyword(''); setSearchInput(''); setPage(0) }}
            className="text-sm text-gray-400 hover:text-gray-700 px-2"
          >
            초기화
          </button>
        )}
      </form>

      {/* 테이블 */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden p-4 space-y-2">
          {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : error ? (
        <ErrorMessage error={error} fallback="공지사항 목록을 불러올 수 없습니다." />
      ) : notices.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">공지사항이 없습니다.</p>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col />
                <col style={{ width: '80px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '80px' }} />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">제목</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">작성자</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">등록일</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">핀고정</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-gray-50 transition-colors">
                    {/* 제목 */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/notices/${notice.id}`}
                          className="text-gray-800 hover:text-blue-600 hover:underline font-medium truncate"
                        >
                          {notice.title}
                        </Link>
                        {notice.isNew && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium shrink-0">NEW</span>
                        )}
                        {notice.hasAttachments && (
                          <span className="text-gray-400 text-xs shrink-0">📎</span>
                        )}
                      </div>
                    </td>
                    {/* 작성자 */}
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {notice.authorName}
                    </td>
                    {/* 등록일 */}
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {notice.createdAt ? notice.createdAt.slice(0, 10) : '-'}
                    </td>
                    {/* 핀고정 */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => pinMutation.mutate(notice.id)}
                        disabled={pinMutation.isPending}
                        className={`text-xs font-medium px-2 py-1 rounded transition-colors disabled:opacity-40 ${
                          notice.isPinned
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                        }`}
                      >
                        {notice.isPinned ? '고정중' : '고정'}
                      </button>
                    </td>
                    {/* 관리 */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/notices/${notice.id}/edit`}
                          className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          수정
                        </Link>
                        <button
                          onClick={() => handleDelete(notice.id, notice.title)}
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
          </div>

          {/* 페이징 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mt-5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                    i === page
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminNoticePage
