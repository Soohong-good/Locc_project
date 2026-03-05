import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotices, deleteNotice, toggleNoticePin } from '@/api/notices'
import { getErrorMessage } from '@/lib/apiError'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'

/**
 * 관리자 공지사항 목록 페이지
 * - 목록 조회, 삭제, 고정 토글
 * - 생성/수정은 기존 Thymeleaf 관리자 페이지로 이동 (추후 React 전환)
 */
const AdminNoticePage = () => {
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'notices', { page, keyword }],
    queryFn: () => getNotices({ page, size: 15, keyword }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'notices'] }),
  })

  const pinMutation = useMutation({
    mutationFn: toggleNoticePin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'notices'] }),
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
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">공지사항 관리</h1>
        <a
          href="/admin/notices/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + 새 공지사항
        </a>
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

      {/* 에러 */}
      {(deleteMutation.error || pinMutation.error) && (
        <div className="mb-4">
          <ErrorMessage error={deleteMutation.error || pinMutation.error} />
        </div>
      )}

      {/* 테이블 */}
      {isLoading ? (
        <LoadingSpinner fullScreen={false} />
      ) : error ? (
        <ErrorMessage error={error} fallback="공지사항 목록을 불러올 수 없습니다." />
      ) : notices.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">공지사항이 없습니다.</p>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-10">고정</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">제목</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24 hidden sm:table-cell">작성자</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-28 hidden md:table-cell">등록일</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-28">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => pinMutation.mutate(notice.id)}
                        disabled={pinMutation.isPending}
                        title={notice.isPinned ? '고정 해제' : '고정'}
                        className={`text-base transition-colors ${
                          notice.isPinned ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      >
                        📌
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/admin/notices/${notice.id}`}
                          className="text-gray-800 hover:text-blue-600 hover:underline font-medium truncate max-w-xs"
                        >
                          {notice.title}
                        </a>
                        {notice.isNew && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium shrink-0">
                            NEW
                          </span>
                        )}
                        {notice.hasAttachments && (
                          <span className="text-gray-400 text-xs shrink-0">📎</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{notice.authorName}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/admin/notices/${notice.id}/edit`}
                          className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          수정
                        </a>
                        <button
                          onClick={() => handleDelete(notice.id, notice.title)}
                          disabled={deleteMutation.isPending}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
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
