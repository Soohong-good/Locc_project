import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSermons } from '@/api/sermons'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'

const CATEGORIES = [
  { value: '', label: '전체' },
  { value: '주일오전', label: '주일오전' },
  { value: '주일오후', label: '주일오후' },
  { value: '기타예배', label: '기타예배' },
]

const SermonListPage = () => {
  const [page, setPage] = useState(0)
  const [category, setCategory] = useState('')
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['sermons', { page, category, keyword }],
    queryFn: () => getSermons({ page, size: 12, category, keyword }),
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setKeyword(searchInput)
    setPage(0)
  }

  const handleCategory = (val) => {
    setCategory(val)
    setPage(0)
  }

  const sermons = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">설교</h1>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleCategory(value)}
            className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
              category === value
                ? 'bg-blue-600 text-white border-blue-600 font-medium'
                : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="제목, 설교자, 말씀으로 검색"
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
        <ErrorMessage error={error} fallback="설교 목록을 불러올 수 없습니다." />
      ) : sermons.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">
          {keyword ? '검색 결과가 없습니다.' : '등록된 설교가 없습니다.'}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sermons.map((sermon) => (
              <Link
                key={sermon.id}
                to={`/sermons/${sermon.id}`}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* 썸네일 or 플레이스홀더 */}
                <div className="h-36 bg-gray-100 relative overflow-hidden">
                  {sermon.thumbnailUrl ? (
                    <img
                      src={sermon.thumbnailUrl}
                      alt={sermon.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : sermon.videoUrl ? (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-3xl text-white/60">▶</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <span className="text-2xl text-blue-300">🎵</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                      {sermon.category}
                    </span>
                  </div>
                </div>

                {/* 정보 */}
                <div className="px-4 py-3">
                  <p className="text-sm font-semibold text-gray-800 truncate">{sermon.title}</p>
                  {sermon.scripture && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{sermon.scripture}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{sermon.preacher}</span>
                    <span className="text-xs text-gray-400">
                      {sermon.sermonDate ?? new Date(sermon.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

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

export default SermonListPage
