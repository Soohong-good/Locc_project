import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSundayMorningGroupedData,
  getSundayAfternoonData,
  getWeekdayData,
  getTrainingMessageData,
  deleteSermon,
  syncYouTubeAll,
} from '@/api/sermons'
import ErrorMessage from '@/components/common/ErrorMessage'
import { SkeletonRow } from '@/components/ui/SkeletonCard'

// ── 탭 정의 ──────────────────────────────────────────────────────────────
// 주일오전은 사용자단(날짜 그룹)과 동일하게 1부/2부 통합 단일 탭
const TABS = [
  { key: 'sm',       label: '주일오전' },
  { key: 'sa',       label: '주일오후' },
  { key: 'wed',      label: '수요예배' },
  { key: 'fri',      label: '금요기도회' },
  { key: 'training', label: '훈련용메시지' },
]

// ── 탭별 API 호출 함수 ───────────────────────────────────────────────────
const fetchByTab = (tabKey, page, keyword) => {
  switch (tabKey) {
    case 'sm':       return getSundayMorningGroupedData({ page, size: 15, keyword })
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

// ── 주일오전 날짜 그룹 테이블 ────────────────────────────────────────────
const SundayMorningGroupTable = ({ groups, onDeleteGroup, isPending }) => {
  if (groups.length === 0) {
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
          <col className="w-24 hidden md:table-column" />
          <col className="w-28" />
          <col className="w-36" />
        </colgroup>
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">제목</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">설교자</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">설교일</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">영상</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {groups.map((group) => {
            const title    = group.representativeTitle ?? group.part1?.title ?? group.part2?.title
            const preacher = group.representativePreacher ?? group.part1?.preacher ?? group.part2?.preacher
            const hasBoth  = !!(group.part1 && group.part2)
            return (
              <tr key={group.sermonDate} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    to={`/worship/sermon/sunday-morning/${group.sermonDate}`}
                    className="text-gray-800 font-medium hover:text-blue-600 hover:underline truncate max-w-xs block"
                  >
                    {title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                  {preacher ?? '-'}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell whitespace-nowrap">
                  {group.sermonDate}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-xs mr-1.5 ${group.part1?.videoUrl ? 'text-red-400' : 'text-gray-300'}`}>
                    1부{group.part1?.videoUrl ? ' ▶' : ' -'}
                  </span>
                  <span className={`text-xs ${group.part2?.videoUrl ? 'text-red-400' : 'text-gray-300'}`}>
                    2부{group.part2?.videoUrl ? ' ▶' : ' -'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Link
                      to={`/admin/sermons/sunday-morning/${group.sermonDate}/edit`}
                      className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => onDeleteGroup(group)}
                      disabled={isPending}
                      className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── 탭별 콘텐츠 ──────────────────────────────────────────────────────────
const TabContent = ({ tabKey, onDelete, onDeleteGroup, isPending }) => {
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'sermons', tabKey, { page, keyword }],
    queryFn: () => fetchByTab(tabKey, page, keyword || undefined),
    staleTime: 30 * 1000,
  })

  const isGrouped  = tabKey === 'sm'
  const sermons    = data?.sermons    ?? []
  const groups     = data?.groups     ?? []
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
      ) : isGrouped ? (
        <SundayMorningGroupTable groups={groups} onDeleteGroup={onDeleteGroup} isPending={isPending} />
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
  const [activeTab, setActiveTab] = useState('sm')
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: deleteSermon,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'sermons'] }),
  })

  const [syncResult, setSyncResult] = useState(null)
  const syncMutation = useMutation({
    mutationFn: syncYouTubeAll,
    onSuccess: (data) => {
      setSyncResult(data)
      queryClient.invalidateQueries({ queryKey: ['admin', 'sermons'] })
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
    },
  })

  // 주일오전 날짜 그룹 삭제: 해당 날짜의 1부·2부 행을 함께 삭제
  const deleteGroupMutation = useMutation({
    mutationFn: async (group) => {
      if (group.part1) await deleteSermon(group.part1.id)
      if (group.part2) await deleteSermon(group.part2.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sermons'] })
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
    },
  })

  const handleDelete = (id, title) => {
    if (!confirm(`"${title}" 설교를 삭제하시겠습니까?`)) return
    deleteMutation.mutate(id)
  }

  const handleDeleteGroup = (group) => {
    const title = group.representativeTitle ?? group.part1?.title ?? group.part2?.title
    if (!confirm(`${group.sermonDate} "${title}" 설교(1·2부)를 모두 삭제하시겠습니까?`)) return
    deleteGroupMutation.mutate(group)
  }

  return (
    <div className="p-4 sm:p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">설교 관리</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSyncResult(null); syncMutation.mutate() }}
            disabled={syncMutation.isPending}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {syncMutation.isPending ? '동기화 중...' : 'YouTube 동기화'}
          </button>
          <Link
            to={activeTab === 'sm' ? '/admin/sermons/sunday-morning/new' : '/admin/sermons/new'}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + 새 설교
          </Link>
        </div>
      </div>

      {syncResult && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          동기화 완료 —{' '}
          {Object.entries(syncResult)
            .map(([key, count]) => `${key}: ${count}건`)
            .join(', ')}
        </div>
      )}
      {syncMutation.error && (
        <div className="mb-4">
          <ErrorMessage error={syncMutation.error} fallback="YouTube 동기화 중 오류가 발생했습니다." />
        </div>
      )}
      {(deleteMutation.error || deleteGroupMutation.error) && (
        <div className="mb-4">
          <ErrorMessage error={deleteMutation.error || deleteGroupMutation.error} />
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
        onDeleteGroup={handleDeleteGroup}
        isPending={deleteMutation.isPending || deleteGroupMutation.isPending}
      />
    </div>
  )
}

export default AdminSermonPage
