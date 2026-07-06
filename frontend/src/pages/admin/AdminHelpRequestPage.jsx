import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getHelpRequests,
  updateHelpRequestStatus,
  updateAdminMemo,
  deleteHelpRequest,
} from '@/api/helpRequests'
import useAuthStore from '@/stores/authStore'
import {
  ChatCircleDots, Bell, Question, Trash, X,
  CaretLeft, CaretRight,
} from '@phosphor-icons/react'

const STATUS_OPTIONS = [
  { value: null,          label: '전체' },
  { value: 'PENDING',     label: '대기중' },
  { value: 'IN_PROGRESS', label: '처리중' },
  { value: 'COMPLETED',   label: '완료' },
]

const STATUS_STYLE = {
  PENDING:     'bg-[#fea619]/20 text-[#684000]',
  IN_PROGRESS: 'bg-[#e5eeff] text-[#091426]',
  COMPLETED:   'bg-[#dcfce7] text-[#15803d]',
}
const STATUS_LABEL = { PENDING: '대기중', IN_PROGRESS: '처리중', COMPLETED: '완료' }

const Row = ({ label, value }) => (
  <div className="flex gap-3 text-[13px]">
    <span className="w-20 text-[#45474c] shrink-0">{label}</span>
    <span className="text-[#0b1c30] break-all">{value ?? '-'}</span>
  </div>
)

/* ── 상태 셀렉트 ── */
function StatusSelect({ item }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (status) => updateHelpRequestStatus({ id: item.id, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'help-requests'] }),
  })
  return (
    <select value={item.status} onChange={(e) => mutation.mutate(e.target.value)} disabled={mutation.isPending}
      onClick={(e) => e.stopPropagation()}
      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#091426]/20 ${STATUS_STYLE[item.status]}`}>
      <option value="PENDING">대기중</option>
      <option value="IN_PROGRESS">처리중</option>
      <option value="COMPLETED">완료</option>
    </select>
  )
}

/* ── 상세 드로어 ── */
function DetailDrawer({ item, onClose, onUpdated }) {
  const queryClient = useQueryClient()
  const [memo, setMemo] = useState(item.adminMemo ?? '')
  const [memoSaved, setMemoSaved] = useState(false)

  const statusMutation = useMutation({
    mutationFn: (status) => updateHelpRequestStatus({ id: item.id, status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'help-requests'] }); onUpdated() },
  })
  const memoMutation = useMutation({
    mutationFn: () => updateAdminMemo({ id: item.id, adminMemo: memo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'help-requests'] })
      setMemoSaved(true); setTimeout(() => setMemoSaved(false), 2000)
    },
  })

  const nextStatus = { PENDING: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED', COMPLETED: null }[item.status]
  const nextStatusLabel = { IN_PROGRESS: '처리중으로 변경', COMPLETED: '완료 처리' }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#c5c6cd]">
          <h2 className="text-[16px] font-bold text-[#0b1c30]">문의 상세</h2>
          <button onClick={onClose} className="text-[#45474c] hover:text-[#0b1c30] transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 px-6 py-5 space-y-5">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLE[item.status]}`}>
              {STATUS_LABEL[item.status]}
            </span>
            {nextStatus && (
              <button onClick={() => statusMutation.mutate(nextStatus)} disabled={statusMutation.isPending}
                className="px-3 py-1 text-[11px] font-semibold bg-[#091426] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors">
                {statusMutation.isPending ? '변경 중...' : nextStatusLabel[nextStatus]}
              </button>
            )}
          </div>
          <div className="bg-[#f8f9ff] border border-[#e5eeff] rounded-xl p-4 space-y-2">
            <Row label="이름" value={item.name} />
            <Row label="전화번호" value={item.phone} />
            <Row label="이메일" value={item.email} />
            <Row label="접수일시" value={item.createdAt} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#45474c] uppercase tracking-wide mb-2">문의 내용</p>
            <div className="bg-[#f8f9ff] border border-[#e5eeff] rounded-xl p-4 text-[14px] text-[#0b1c30] whitespace-pre-wrap leading-relaxed">
              {item.content}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#45474c] uppercase tracking-wide mb-2">관리자 메모</p>
            <textarea rows={4} value={memo} onChange={(e) => setMemo(e.target.value)}
              placeholder="내부 처리 메모를 입력하세요"
              className="w-full border border-[#c5c6cd] rounded-lg px-3 py-2 text-[13px] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#091426]/20 resize-none" />
            <div className="flex items-center gap-2 mt-2">
              <button onClick={() => memoMutation.mutate()} disabled={memoMutation.isPending}
                className="px-4 py-1.5 bg-[#091426] text-white text-[11px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors">
                {memoMutation.isPending ? '저장 중...' : '메모 저장'}
              </button>
              {memoSaved && <span className="text-[11px] text-[#15803d] font-medium">저장됐습니다</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 메인 ── */
export default function AdminHelpRequestPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [filterStatus, setFilterStatus] = useState(null)
  const [page, setPage] = useState(0)
  const [selectedItem, setSelectedItem] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'help-requests', { filterStatus, page }],
    queryFn: () => getHelpRequests({ page, size: 20, status: filterStatus }),
    placeholderData: (prev) => prev,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteHelpRequest,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'help-requests'] }); setSelectedItem(null) },
  })

  const handleDelete = (id, name) => {
    if (!window.confirm(`"${name}"의 문의를 삭제하시겠습니까?`)) return
    deleteMutation.mutate(id)
  }
  const handleFilterChange = (value) => { setFilterStatus(value); setPage(0) }

  const items      = data?.content ?? []
  const pageInfo   = data?.pageInfo
  const totalPages = pageInfo?.totalPages ?? 0
  const currentPage = pageInfo?.page ?? 0
  const totalElements = pageInfo?.totalElements ?? 0

  const pageNums = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)
    const start = Math.max(0, Math.min(currentPage - 3, totalPages - 7))
    return Array.from({ length: 7 }, (_, i) => start + i)
  })()

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* 상단 헤더 */}
      <header className="sticky top-0 z-40 flex flex-wrap md:flex-nowrap justify-between items-center gap-y-2 md:h-16 py-3 md:py-0 px-4 md:px-6 border-b border-[#c5c6cd] bg-[#f8f9ff]/80 backdrop-blur-md shrink-0">
        <h2 className="text-[16px] md:text-[20px] font-extrabold text-[#0b1c30] whitespace-nowrap">도움문의 관리</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-[#45474c]">
            <button className="hover:text-[#091426] transition-colors"><Bell size={22} /></button>
            <button className="hover:text-[#091426] transition-colors"><Question size={22} /></button>
          </div>
          <div className="flex items-center gap-3 border-l border-[#c5c6cd] pl-6">
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
          <section>
            <nav className="flex items-center gap-2 text-[12px] text-[#45474c] mb-2">
              <span>Admin</span><CaretRight size={12} /><span className="text-[#091426] font-bold">도움문의 관리</span>
            </nav>
            <h2 className="text-[32px] font-semibold text-[#0b1c30] tracking-tight leading-10">도움문의 관리</h2>
            <p className="text-[14px] text-[#45474c] mt-1">복음말씀 페이지 신앙 상담 요청 목록</p>
          </section>

          {/* 통계 카드 */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: '전체', value: totalElements, iconBg: 'bg-[#091426]/5', iconColor: 'text-[#091426]' },
              { label: '대기중', value: items.filter((i) => i.status === 'PENDING').length, iconBg: 'bg-[#fea619]/10', iconColor: 'text-[#855300]' },
              { label: '처리중', value: items.filter((i) => i.status === 'IN_PROGRESS').length, iconBg: 'bg-[#e5eeff]', iconColor: 'text-[#45474c]' },
            ].map((c) => (
              <div key={c.label} className="bg-white border border-[#c5c6cd] p-6 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <span className={`p-2 rounded-lg w-fit ${c.iconBg}`}><ChatCircleDots size={22} className={c.iconColor} /></span>
                <div className="mt-4">
                  <p className="text-[12px] font-medium text-[#45474c] uppercase tracking-tight">{c.label}</p>
                  <h3 className="text-[24px] font-semibold text-[#0b1c30] mt-1 leading-tight">{c.value}건</h3>
                </div>
              </div>
            ))}
          </section>

          {/* 필터 탭 + 목록 */}
          <section className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-[#c5c6cd]">
            <div className="px-6 py-4 border-b border-[#c5c6cd] flex justify-between items-center bg-white">
              <div className="flex gap-2">
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <button key={label} onClick={() => handleFilterChange(value)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                      filterStatus === value ? 'bg-[#091426] text-white' : 'bg-[#eff4ff] text-[#45474c] hover:bg-[#dce9ff]'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              <span className="text-[14px] text-[#45474c]">총 {totalElements}건</span>
            </div>

            {/* 데스크탑: 테이블형 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] text-[#45474c] text-[12px] font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">이름</th>
                    <th className="px-6 py-4">연락처</th>
                    <th className="px-6 py-4">문의 내용</th>
                    <th className="px-6 py-4">접수일시</th>
                    <th className="px-6 py-4">상태</th>
                    <th className="px-6 py-4 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c6cd]/50">
                  {isLoading
                    ? [...Array(5)].map((_, i) => (
                        <tr key={i}>{[80, 100, 200, 120, 80, 60].map((w, j) => (
                          <td key={j} className="px-6 py-4"><div className="h-4 bg-[#e5eeff] rounded animate-pulse" style={{ width: w }} /></td>
                        ))}</tr>
                      ))
                    : items.length === 0
                    ? <tr><td colSpan={6} className="px-6 py-16 text-center text-[14px] text-[#45474c]">문의 내역이 없습니다.</td></tr>
                    : items.map((item) => (
                      <tr key={item.id} className="hover:bg-[#eff4ff]/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedItem(item)}>
                        <td className="px-6 py-3 text-[14px] font-medium text-[#0b1c30] whitespace-nowrap">{item.name}</td>
                        <td className="px-6 py-3 text-[14px] text-[#45474c] whitespace-nowrap">{item.phone}</td>
                        <td className="px-6 py-3 text-[13px] text-[#45474c] max-w-xs">
                          <span className="line-clamp-1">{item.content}</span>
                        </td>
                        <td className="px-6 py-3 text-[13px] text-[#45474c] whitespace-nowrap">{item.createdAt}</td>
                        <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                          <StatusSelect item={item} />
                        </td>
                        <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleDelete(item.id, item.name)} disabled={deleteMutation.isPending}
                            className="p-2 text-[#45474c] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-all disabled:opacity-40">
                            <Trash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>

            {/* 모바일: 카드형 */}
            <div className="md:hidden divide-y divide-[#c5c6cd]/50">
              {isLoading
                ? [...Array(4)].map((_, i) => (
                    <div key={i} className="px-4 py-4"><div className="h-4 bg-[#e5eeff] rounded animate-pulse w-2/3" /></div>
                  ))
                : items.length === 0
                ? <div className="px-6 py-16 text-center text-[14px] text-[#45474c]">문의 내역이 없습니다.</div>
                : items.map((item) => (
                  <div key={item.id} className="px-4 py-4 space-y-2 cursor-pointer" onClick={() => setSelectedItem(item)}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-medium text-[#0b1c30]">{item.name} <span className="text-[#45474c] font-normal">· {item.phone}</span></p>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.name) }} disabled={deleteMutation.isPending}
                        className="shrink-0 p-2 text-[#45474c] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-all disabled:opacity-40">
                        <Trash size={18} />
                      </button>
                    </div>
                    <p className="text-[13px] text-[#45474c] line-clamp-2">{item.content}</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] text-[#45474c]">{item.createdAt}</p>
                      <div onClick={(e) => e.stopPropagation()}>
                        <StatusSelect item={item} />
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-white border-t border-[#c5c6cd] flex justify-between items-center">
                <p className="text-[12px] text-[#45474c]">총 {totalElements}건</p>
                <div className="flex gap-1 items-center">
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={pageInfo?.first}
                    className="p-2 rounded-lg border border-[#c5c6cd] hover:bg-[#e5eeff] disabled:opacity-40 transition-colors">
                    <CaretLeft size={16} />
                  </button>
                  {pageNums.map((n) => (
                    n === currentPage
                      ? <button key={n} className="w-9 h-9 rounded-lg bg-[#091426] text-white text-[12px] font-bold">{n + 1}</button>
                      : <button key={n} onClick={() => setPage(n)}
                          className="w-9 h-9 rounded-lg border border-[#c5c6cd] text-[12px] text-[#45474c] hover:bg-[#e5eeff] transition-colors">
                          {n + 1}
                        </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={pageInfo?.last}
                    className="p-2 rounded-lg border border-[#c5c6cd] hover:bg-[#e5eeff] disabled:opacity-40 transition-colors">
                    <CaretRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>

        </main>
      </div>

      {/* 하단 푸터 */}
      <footer className="h-12 shrink-0 flex items-center justify-between px-6 border-t border-[#c5c6cd] bg-white text-[11px] text-[#45474c] font-medium">
        <div>© 2026 그리스도사랑교회 관리자 시스템</div>
      </footer>

      {selectedItem && (
        <DetailDrawer item={selectedItem} onClose={() => setSelectedItem(null)} onUpdated={() => setSelectedItem(null)} />
      )}
    </div>
  )
}
