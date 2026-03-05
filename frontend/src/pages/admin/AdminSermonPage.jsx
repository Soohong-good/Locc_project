import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSermons, deleteSermon } from '@/api/sermons'
import ErrorMessage from '@/components/common/ErrorMessage'
import LoadingSpinner from '@/components/common/LoadingSpinner'

/**
 * 관리자 설교 목록 페이지
 * - 목록 조회, 삭제
 * - 생성/수정은 기존 Thymeleaf 관리자 페이지로 이동
 */
const AdminSermonPage = () => {
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'sermons', { page, keyword }],
    queryFn: () => getSermons({ page, size: 15, keyword }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSermon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'sermons'] }),
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setKeyword(searchInput)
    setPage(0)
  }

  const handleDelete = (id, title) => {
    if (!confirm(`"${title}" 설교를 삭제하시겠습니까?`)) return
    deleteMutation.mutate(id)
  }

  const sermons = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const categoryLabel = (cat) => ({
    '주일오전': '주일오전',
    '주일오후': '주일오후',
    '기타예배': '기타예배',
  })[cat] ?? cat

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">설교 관리</h1>
        <a
          href="/admin/sermons/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + 새 설교
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
        <button type="submit" className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm px-4 py-2 rounded-lg">
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

      {deleteMutation.error && (
        <div className="mb-4">
          <ErrorMessage error={deleteMutation.error} />
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner fullScreen={false} />
      ) : error ? (
        <ErrorMessage error={error} fallback="설교 목록을 불러올 수 없습니다." />
      ) : sermons.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">설교가 없습니다.</p>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">제목</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-20 hidden sm:table-cell">카테고리</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24 hidden md:table-cell">설교자</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24 hidden md:table-cell">설교일</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-28">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sermons.map((sermon) => (
                  <tr key={sermon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/admin/sermons/${sermon.id}`}
                          className="text-gray-800 hover:text-blue-600 hover:underline font-medium truncate max-w-xs"
                        >
                          {sermon.title}
                        </a>
                        {sermon.isNew && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium shrink-0">
                            NEW
                          </span>
                        )}
                        {sermon.videoUrl && <span className="text-xs text-red-400 shrink-0">▶</span>}
                      </div>
                      {sermon.scripture && (
                        <p className="text-xs text-gray-400 mt-0.5">{sermon.scripture}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {categoryLabel(sermon.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{sermon.preacher}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {sermon.sermonDate ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/admin/sermons/${sermon.id}/edit`}
                          className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          수정
                        </a>
                        <button
                          onClick={() => handleDelete(sermon.id, sermon.title)}
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

          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mt-5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                    i === page ? 'bg-blue-600 text-white font-medium' : 'text-gray-600 hover:bg-gray-100'
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

export default AdminSermonPage
