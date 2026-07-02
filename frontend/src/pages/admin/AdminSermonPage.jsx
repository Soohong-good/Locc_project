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
import {
  Microphone, ArrowClockwise, MagnifyingGlass, Bell, Question,
  CaretRight, CaretLeft, NotePencil, Trash, YoutubeLogo, PlusCircle,
  X,
} from '@phosphor-icons/react'
import useAuthStore from '@/stores/authStore'
import useSermonGroupDelete from '@/hooks/useSermonGroupDelete'

const TABS = [
  { key: 'sm',       label: '주일오전' },
  { key: 'sa',       label: '주일오후' },
  { key: 'wed',      label: '수요예배' },
  { key: 'fri',      label: '금요기도회' },
  { key: 'training', label: '훈련용메시지' },
]

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

/* ── 일반 설교 테이블 ── */
function SermonTable({ sermons, onDelete, isPending }) {
  if (sermons.length === 0)
    return <p className="text-center text-[14px] text-[#45474c] py-16">등록된 설교가 없습니다.</p>
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-[#eff4ff] text-[#45474c] text-[12px] font-semibold uppercase tracking-wider">
          <th className="px-6 py-4">제목</th>
          <th className="px-6 py-4 hidden md:table-cell">설교자</th>
          <th className="px-6 py-4 hidden md:table-cell">설교일</th>
          <th className="px-6 py-4">영상</th>
          <th className="px-6 py-4 text-right">관리</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#c5c6cd]/50">
        {sermons.map((s) => (
          <tr key={s.id} className="hover:bg-[#eff4ff]/50 transition-colors">
            <td className="px-6 py-4">
              <Link to={`/worship/sermon/${s.id}`}
                className="text-[14px] font-medium text-[#0b1c30] hover:text-[#091426] hover:underline block max-w-xs truncate">
                {s.title}
              </Link>
              {s.scripture && <p className="text-[12px] text-[#45474c] mt-0.5 truncate max-w-xs">{s.scripture}</p>}
            </td>
            <td className="px-6 py-4 text-[14px] text-[#45474c] hidden md:table-cell whitespace-nowrap">{s.preacher ?? '-'}</td>
            <td className="px-6 py-4 text-[14px] text-[#45474c] hidden md:table-cell whitespace-nowrap">{s.sermonDate ?? '-'}</td>
            <td className="px-6 py-4">
              {s.videoUrl
                ? <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ba1a1a]"><YoutubeLogo size={14} />YouTube</span>
                : <span className="text-[11px] text-[#c5c6cd]">없음</span>}
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex justify-end gap-1">
                <Link to={`/admin/sermons/${s.id}/edit`}
                  className="p-2 text-[#45474c] hover:text-[#091426] hover:bg-[#eff4ff] rounded-lg transition-all inline-flex">
                  <NotePencil size={18} />
                </Link>
                <button onClick={() => onDelete(s.id, s.title)} disabled={isPending}
                  className="p-2 text-[#45474c] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-all disabled:opacity-40">
                  <Trash size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* ── 주일오전 그룹 테이블 ── */
function SundayMorningGroupTable({ groups, onDeleteGroup, isPending }) {
  if (groups.length === 0)
    return <p className="text-center text-[14px] text-[#45474c] py-16">등록된 설교가 없습니다.</p>
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-[#eff4ff] text-[#45474c] text-[12px] font-semibold uppercase tracking-wider">
          <th className="px-6 py-4">제목</th>
          <th className="px-6 py-4 hidden md:table-cell">설교자</th>
          <th className="px-6 py-4 hidden md:table-cell">설교일</th>
          <th className="px-6 py-4">영상</th>
          <th className="px-6 py-4 text-right">관리</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#c5c6cd]/50">
        {groups.map((group) => {
          const title    = group.representativeTitle ?? group.part1?.title ?? group.part2?.title
          const preacher = group.representativePreacher ?? group.part1?.preacher ?? group.part2?.preacher
          return (
            <tr key={group.sermonDate} className="hover:bg-[#eff4ff]/50 transition-colors">
              <td className="px-6 py-4">
                <Link to={`/worship/sermon/sunday-morning/${group.sermonDate}`}
                  className="text-[14px] font-medium text-[#0b1c30] hover:text-[#091426] hover:underline block max-w-xs truncate">
                  {title}
                </Link>
              </td>
              <td className="px-6 py-4 text-[14px] text-[#45474c] hidden md:table-cell whitespace-nowrap">{preacher ?? '-'}</td>
              <td className="px-6 py-4 text-[14px] text-[#45474c] hidden md:table-cell whitespace-nowrap">{group.sermonDate}</td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  {[group.part1, group.part2].map((p, idx) => (
                    <span key={idx} className={`text-[11px] font-bold ${p?.videoUrl ? 'text-[#ba1a1a]' : 'text-[#c5c6cd]'}`}>
                      {idx + 1}부{p?.videoUrl ? '▶' : '-'}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1">
                  <Link to={`/admin/sermons/sunday-morning/${group.sermonDate}/edit`}
                    className="p-2 text-[#45474c] hover:text-[#091426] hover:bg-[#eff4ff] rounded-lg transition-all inline-flex">
                    <NotePencil size={18} />
                  </Link>
                  <button onClick={() => onDeleteGroup(group)} disabled={isPending}
                    className="p-2 text-[#45474c] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-all disabled:opacity-40">
                    <Trash size={18} />
                  </button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/* ── 탭 콘텐츠 ── */
function TabContent({ tabKey, onDelete, onDeleteGroup, isPending }) {
  const [page, setPage]             = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword]       = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'sermons', tabKey, { page, keyword }],
    queryFn: () => fetchByTab(tabKey, page, keyword || undefined),
    staleTime: 30_000,
  })

  const isGrouped  = tabKey === 'sm'
  const sermons    = data?.sermons    ?? []
  const groups     = data?.groups     ?? []
  const totalPages = data?.totalPages ?? 0

  const pageNums = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)
    const start = Math.max(0, Math.min(page - 3, totalPages - 7))
    return Array.from({ length: 7 }, (_, i) => start + i)
  })()

  const handleSearch = (e) => { e.preventDefault(); setKeyword(searchInput); setPage(0) }
  const handleReset  = () => { setKeyword(''); setSearchInput(''); setPage(0) }

  return (
    <div>
      {/* 탭 내 검색 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#45474c] pointer-events-none" />
          <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="제목으로 검색"
            className="w-full pl-9 pr-3 py-2 border border-[#c5c6cd] rounded-lg text-[13px] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#091426]/20 transition-all" />
        </div>
        <button type="submit"
          className="px-4 py-2 border border-[#c5c6cd] bg-white text-[#0b1c30] text-[13px] font-medium rounded-lg hover:bg-[#eff4ff] transition-colors">
          검색
        </button>
        {keyword && (
          <button type="button" onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 text-[13px] text-[#45474c] hover:text-[#0b1c30]">
            <X size={14} />초기화
          </button>
        )}
      </form>

      {/* 목록 */}
      {isLoading
        ? <div className="space-y-3">{[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-4 px-6 py-4 animate-pulse">
              <div className="h-4 bg-[#e5eeff] rounded flex-1" />
              <div className="h-4 bg-[#e5eeff] rounded w-24" />
              <div className="h-4 bg-[#e5eeff] rounded w-20" />
            </div>
          ))}</div>
        : isGrouped
        ? <SundayMorningGroupTable groups={groups} onDeleteGroup={onDeleteGroup} isPending={isPending} />
        : <SermonTable sermons={sermons} onDelete={onDelete} isPending={isPending} />
      }

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-white border-t border-[#c5c6cd] flex justify-between items-center">
          <p className="text-[12px] text-[#45474c]">총 {totalPages}페이지</p>
          <div className="flex gap-1 items-center">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="p-2 rounded-lg border border-[#c5c6cd] hover:bg-[#e5eeff] disabled:opacity-40 transition-colors">
              <CaretLeft size={16} />
            </button>
            {pageNums.map((n) => (
              n === page
                ? <button key={n} className="w-9 h-9 rounded-lg bg-[#091426] text-white text-[12px] font-bold">{n + 1}</button>
                : <button key={n} onClick={() => setPage(n)}
                    className="w-9 h-9 rounded-lg border border-[#c5c6cd] text-[12px] text-[#45474c] hover:bg-[#e5eeff] transition-colors">
                    {n + 1}
                  </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="p-2 rounded-lg border border-[#c5c6cd] hover:bg-[#e5eeff] disabled:opacity-40 transition-colors">
              <CaretRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 메인 ── */
export default function AdminSermonPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('sm')
  const [syncResult, setSyncResult] = useState(null)

  const deleteMutation = useMutation({
    mutationFn: deleteSermon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'sermons'] }),
  })

  const syncMutation = useMutation({
    mutationFn: syncYouTubeAll,
    onSuccess: (data) => {
      setSyncResult(data)
      queryClient.invalidateQueries({ queryKey: ['admin', 'sermons'] })
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
    },
  })

  const deleteGroupMutation = useSermonGroupDelete([['admin', 'sermons'], ['sermons']])

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
    <div className="flex flex-col h-full overflow-hidden">

      {/* 상단 헤더 */}
      <header className="sticky top-0 z-40 flex justify-between items-center h-16 px-6 border-b border-[#c5c6cd] bg-[#f8f9ff]/80 backdrop-blur-md shrink-0">
        <h2 className="text-[20px] font-extrabold text-[#0b1c30]">설교 관리</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[#45474c]">
            <button className="hover:text-[#091426] transition-colors"><Bell size={22} /></button>
            <button className="hover:text-[#091426] transition-colors"><Question size={22} /></button>
          </div>
          <div className="flex items-center gap-3 border-l border-[#c5c6cd] pl-3">
            <div className="text-right">
              <p className="text-[12px] font-bold text-[#0b1c30]">{user?.name ?? '관리자'}</p>
              <p className="text-[10px] text-[#45474c] uppercase tracking-wider">Admin</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center text-white text-[12px] font-bold border border-[#d8e3fb]">
              {(user?.name ?? 'A')[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#cbd5e1] [&::-webkit-scrollbar-thumb]:rounded-full">
        <main className="p-8 space-y-8 max-w-[1440px] mx-auto w-full">

          {/* 페이지 헤더 */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-[12px] text-[#45474c] mb-2">
                <span>Admin</span><CaretRight size={12} /><span className="text-[#091426] font-bold">설교 관리</span>
              </nav>
              <h2 className="text-[32px] font-semibold text-[#0b1c30] tracking-tight leading-10">설교 관리</h2>
              <p className="text-[14px] text-[#45474c] mt-1">카테고리별 설교를 등록하고 관리합니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { setSyncResult(null); syncMutation.mutate() }} disabled={syncMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#c5c6cd] bg-white text-[#0b1c30] text-[12px] font-semibold rounded-lg hover:bg-[#e5eeff] transition-all disabled:opacity-50">
                <ArrowClockwise size={16} className={syncMutation.isPending ? 'animate-spin' : ''} />
                {syncMutation.isPending ? '동기화 중...' : 'YouTube 동기화'}
              </button>
              <Link
                to={activeTab === 'sm' ? '/admin/sermons/sunday-morning/new' : '/admin/sermons/new'}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#091426] text-white text-[12px] font-semibold hover:opacity-90 transition-all shadow-sm">
                <PlusCircle size={16} /> 새 설교
              </Link>
            </div>
          </section>

          {/* 동기화 결과 */}
          {syncResult && (
            <div className="p-4 bg-[#e5eeff] border border-[#c5c6cd] rounded-xl text-[13px] text-[#091426] flex items-start gap-2">
              <ArrowClockwise size={16} className="mt-0.5 shrink-0" />
              <span>동기화 완료 — {Object.entries(syncResult).map(([k, v]) => `${k}: ${v}건`).join(', ')}</span>
            </div>
          )}

          {/* 통계 카드 */}
          <section className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`p-4 rounded-xl flex flex-col items-start gap-2 border transition-all text-left ${
                  activeTab === tab.key
                    ? 'bg-[#091426] text-white border-[#091426] shadow-md'
                    : 'bg-white text-[#0b1c30] border-[#c5c6cd] hover:shadow-md hover:border-[#091426]'
                }`}>
                <Microphone size={20} className={activeTab === tab.key ? 'text-[#fea619]' : 'text-[#45474c]'} />
                <span className="text-[13px] font-semibold">{tab.label}</span>
              </button>
            ))}
          </section>

          {/* 목록 테이블 */}
          <section className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-[#c5c6cd]">
            <div className="px-6 py-4 border-b border-[#c5c6cd] flex justify-between items-center bg-white">
              <h4 className="text-[18px] font-semibold text-[#0b1c30]">
                {TABS.find((t) => t.key === activeTab)?.label ?? ''} 목록
              </h4>
            </div>
            <div className="px-6 pt-4">
              <TabContent
                key={activeTab}
                tabKey={activeTab}
                onDelete={handleDelete}
                onDeleteGroup={handleDeleteGroup}
                isPending={deleteMutation.isPending || deleteGroupMutation.isPending}
              />
            </div>
          </section>

        </main>
      </div>

      {/* 하단 푸터 */}
      <footer className="h-12 shrink-0 flex items-center justify-between px-6 border-t border-[#c5c6cd] bg-white text-[11px] text-[#45474c] font-medium">
        <div>© 2026 그리스도사랑교회 관리자 시스템</div>
      </footer>
    </div>
  )
}
