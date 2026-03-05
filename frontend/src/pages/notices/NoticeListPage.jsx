import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getNotices } from '@/api/notices'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'

const NoticeListPage = () => {
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['notices', { page, keyword }],
    queryFn: () => getNotices({ page, size: 15, keyword }),
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setKeyword(searchInput)
    setPage(0)
  }

  const notices = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">공지사항</h1>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="검색어 입력"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="border border-gray-300 hover:bg-gray-50 text-sm px-4 py-2 rounded-lg">
          검색
        </button>
        {keyword && (
          <button
            type="button"
            onClick={() => { setKeyword(''); setSearchInput(''); setPage(0) }}
            className="text-sm text-gray-400 hover:text-gray-600 px-2"
          >
            ✕
          </button>
        )}
      </form>

      {isLoading ? (
        <LoadingSpinner fullScreen={false} />
      ) : error ? (
        <ErrorMessage error={error} fallback="공지사항을 불러올 수 없습니다." />
      ) : notices.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">
          {keyword ? '검색 결과가 없습니다.' : '공지사항이 없습니다.'}
        </p>
      ) : (
        <>
          <ul className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-200 overflow-hidden">
            {notices.map((notice) => (
              <li key={notice.id}>
                <Link
                  to={`/notices/${notice.id}`}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  {notice.isPinned && <span className="text-yellow-500 text-sm shrink-0">📌</span>}
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                    {notice.title}
                  </span>
                  {notice.isNew && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium shrink-0">
                      NEW
                    </span>
                  )}
                  {notice.hasAttachments && <span className="text-gray-400 text-xs shrink-0">📎</span>}
                  <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">
                    {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('ko-KR') : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mt-6">
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

export default NoticeListPage
