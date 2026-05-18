import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSundayMorningData,
  getSundayAfternoonData,
  getWeekdayData,
  getTrainingMessageData,
  deleteSermon,
} from '@/api/sermons'
import ErrorMessage from '@/components/common/ErrorMessage'
import { SkeletonRow } from '@/components/ui/SkeletonCard'

// ── 탭 정의 ──────────────────────────────────────────────────────────────
const TABS = [
  { key: 'sm1',      label: '주일오전 1부' },
  { key: 'sm2',      label: '주일오전 2부' },
  { key: 'sa',       label: '주일오후' },
  { key: 'wed',      label: '수요예배' },
  { key: 'fri',      label: '금요기도회' },
  { key: 'training', label: '훈련용메시지' },
]

// ── 탭별 API 호출 함수 ───────────────────────────────────────────────────
const fetchByTab = (tabKey, page, keyword) => {
  switch (tabKey) {
    case 'sm1':      return getSundayMorningData({ serviceNumber: 1, page, size: 15, keyword })
    case 'sm2':      return getSundayMorningData({ serviceNumber: 2, page, size: 15, keyword })
    case 'sa':       return getSundayAfternoonData({ page, size: 15, keyword })
    case 'wed':      return getWeekdayData({ type: 'wednesday', page, size: 15, keyword })
    case 'fri':      return getWeekdayData({ type: 'friday',    page, size: 15, keyword })
    case 'training': return getTrainingMessageData({ page, size: 15, keyword })
    default:         return Promise.resolve({ sermons: [], totalPages: 0 })
  }
}

// ── 설교 목록 테이블 ─────────────────────────────────────────────────────
const SermonTable = ({ sermons, onDelete, isPending }) => {
  if (sermons.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-16">등록된 설교가 없습니다.</p>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col />
          <col className="w-28" />
          <col className="w-24" />
          <col className="w-24" />
        </colgroup>
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">제목</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">설교자</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">설교일</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sermons.map((sermon) => (
            <tr key={sermon.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/worship/sermon/${sermon.id}`}
                    className="text-gray-800 font-medium hover:text-blue-600 hover:underline truncate max-w-xs block"
                  >
                    {sermon.title}
                  </Link>
                  {sermon.videoUrl && (
                    <span className="text-xs text-red-400 shrink-0">▶</span>
                  )}
                </div>
                {sermon.scripture && (
                  <p className="text-xs text-gray-400 mt-0.5">{sermon.scripture}</p>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                {sermon.preacher ?? '-'}
              </td>
              <td className="px-4 py-3 text-gray-400 hidden md:table-cell whitespace-nowrap">
                {sermon.sermonDate ?? '-'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/sermons/${sermon.id}/edit`}
                    className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => onDelete(sermon.id, sermon.title)}
                    disabled={isPending}
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
  )
}

// ── 탭별 콘텐츠 ──────────────────────────────────────────────────────────
const TabContent = ({ tabKey, onDelete, isPending }) => {
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'sermons', tabKey, { page, keyword }],
    queryFn: () => fetchByTab(tabKey, page, keyword || undefined),
    staleTime: 30 * 1000,
  })

  const sermons    = data?.sermons    ?? []
  const totalPages = data?.totalPages ?? 0

  const handleSearch = (e) => {
    e.preventDefault()
    setKeyword(searchInput)
    setPage(0)
  }

  const handleReset = () => {
    setKeyword('')
    setSearchInput('')
    setPage(0)
  }

  return (
    <div>
      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="제목으로 검색"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm px-4 py-2 rounded-lg"
        >
          검색
        </button>
        {keyword && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-gray-400 hover:text-gray-700 px-2"
          >
            초기화
          </button>
        )}
      </form>

      {/* 목록 */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : error ? (
        <ErrorMessage error={error} fallback="설교 목록을 불러올 수 없습니다." />
      ) : (
        <SermonTable sermons={sermons} onDelete={onDelete} isPending={isPending} />
      )}

      {/* 페이지네이션 */}
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
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────
const AdminSermonPage = () => {
  const [activeTab, setActiveTab] = useState('sm1')
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: deleteSermon,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'sermons'] }),
  })

  const handleDelete = (id, title) => {
    if (!confirm(`"${title}" 설교를 삭제하시겠습니까?`)) return
    deleteMutation.mutate(id)
  }

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">설교 관리</h1>
        <Link
          to="/admin/sermons/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + 새 설교
        </Link>
      </div>

      {deleteMutation.error && (
        <div className="mb-4">
          <ErrorMessage error={deleteMutation.error} />
        </div>
      )}

      {/* 카테고리 탭 */}
      <div className="flex border-b border-gray-200 mb-5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 — key로 강제 리마운트하여 page/keyword 초기화 */}
      <TabContent
        key={activeTab}
        tabKey={activeTab}
        onDelete={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

export default AdminSermonPage
