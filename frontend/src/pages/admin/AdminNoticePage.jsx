import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotices, deleteNotice, toggleNoticePin } from '@/api/notices'
import toast from '@/utils/toast'
import useAuthStore from '@/stores/authStore'
import {
  Megaphone, PlusCircle, MagnifyingGlass, Bell, Question,
  NotePencil, Trash, CaretLeft, CaretRight,
  PushPin, Paperclip, X,
} from '@phosphor-icons/react'

const fmt = (v) => (v ? v.slice(0, 10) : '-')

function PageBtn({ label, onClick, active, disabled }) {
  if (active) return <button className="w-9 h-9 rounded-lg bg-[#091426] text-white text-[12px] font-bold">{label}</button>
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-9 h-9 rounded-lg border border-[#c5c6cd] text-[12px] font-bold text-[#45474c] hover:bg-[#e5eeff] disabled:opacity-40 transition-colors">
      {label}
    </button>
  )
}

export default function AdminNoticePage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [page, setPage]             = useState(0)
  const [keyword, setKeyword]       = useState('')
  const [searchInput, setSearchInput] = useState('')

  const queryKey = ['admin', 'notices', page, keyword]

  const { data, isLoading } = useQuery({
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (e) => toast.error(e?.response?.data?.message ?? '고정 변경에 실패했습니다.'),
  })

  const handleSearch = (e) => { e.preventDefault(); setKeyword(searchInput); setPage(0) }
  const handleDelete = (id, title) => {
    if (!confirm(`"${title}" 공지사항을 삭제하시겠습니까?`)) return
    deleteMutation.mutate(id)
  }

  const notices    = data?.content ?? []
  const pageInfo   = data?.pageInfo ?? {}
  const totalPages = pageInfo.totalPages ?? 0
  const totalElements = pageInfo.totalElements ?? 0
  const currentPage = pageInfo.page ?? 0

  const pageNums = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)
    const start = Math.max(0, Math.min(currentPage - 3, totalPages - 7))
    return Array.from({ length: 7 }, (_, i) => start + i)
  })()

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* 상단 헤더 */}
      <header className="sticky top-0 z-40 flex flex-wrap md:flex-nowrap justify-between items-center gap-y-2 md:h-16 py-3 md:py-0 px-4 md:px-6 border-b border-[#c5c6cd] bg-[#f8f9ff]/80 backdrop-blur-md shrink-0">
        <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
          <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#45474c] pointer-events-none" />
          <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="공지사항 검색..."
            className="w-full pl-10 pr-4 py-2 bg-[#eff4ff] border border-[#c5c6cd] rounded-full text-[14px] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#091426]/20 transition-all" />
        </form>
        <div className="flex items-center gap-6 ml-4 shrink-0">
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
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-[12px] text-[#45474c] mb-2">
                <span>Admin</span><CaretRight size={12} /><span className="text-[#091426] font-bold">공지사항 관리</span>
              </nav>
              <h2 className="text-[32px] font-semibold text-[#0b1c30] tracking-tight leading-10">공지사항 관리</h2>
              <p className="text-[14px] text-[#45474c] mt-1">교회 공지사항을 등록하고 관리합니다.</p>
            </div>
            <div className="flex items-center gap-3">
              {keyword && (
                <button onClick={() => { setKeyword(''); setSearchInput(''); setPage(0) }}
                  className="flex items-center gap-1 px-3 py-2 text-[13px] text-[#45474c] hover:text-[#0b1c30]">
                  <X size={14} />초기화
                </button>
              )}
              <Link to="/admin/notices/new"
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#091426] text-white text-[12px] font-semibold hover:opacity-90 transition-all shadow-sm">
                <PlusCircle size={16} /> 새 공지사항
              </Link>
            </div>
          </section>

          {/* 통계 카드 */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { Icon: Megaphone, iconBg: 'bg-[#091426]/5', iconColor: 'text-[#091426]', label: '전체 공지사항', value: `${totalElements}건` },
              { Icon: PushPin, iconBg: 'bg-[#fea619]/10', iconColor: 'text-[#855300]', label: '고정 공지사항', value: `${notices.filter((n) => n.isPinned).length}건` },
              { Icon: Megaphone, iconBg: 'bg-[#e5eeff]', iconColor: 'text-[#45474c]', label: '현재 페이지', value: `${notices.length}건` },
            ].map((c) => (
              <div key={c.label} className="bg-white border border-[#c5c6cd] p-6 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <span className={`p-2 rounded-lg w-fit ${c.iconBg}`}><c.Icon size={22} className={c.iconColor} /></span>
                <div className="mt-4">
                  <p className="text-[12px] font-medium text-[#45474c] uppercase tracking-tight">{c.label}</p>
                  <h3 className="text-[24px] font-semibold text-[#0b1c30] mt-1 leading-tight">{c.value}</h3>
                </div>
              </div>
            ))}
          </section>

          {/* 목록 테이블 */}
          <section className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-[#c5c6cd]">
            <div className="px-6 py-4 border-b border-[#c5c6cd] flex justify-between items-center bg-white">
              <h4 className="text-[18px] font-semibold text-[#0b1c30]">공지사항 목록</h4>
              <span className="text-[14px] text-[#45474c]">
                총 {totalElements}건
                {keyword && <span className="ml-1 text-[#091426] font-medium">· 검색: "{keyword}"</span>}
              </span>
            </div>
            {/* 데스크탑: 테이블형 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] text-[#45474c] text-[12px] font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">제목</th>
                    <th className="px-6 py-4">작성자</th>
                    <th className="px-6 py-4">등록일</th>
                    <th className="px-6 py-4 text-center">핀고정</th>
                    <th className="px-6 py-4 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c6cd]/50">
                  {isLoading
                    ? [...Array(6)].map((_, i) => (
                        <tr key={i}>{[300, 80, 80, 60, 80].map((w, j) => (
                          <td key={j} className="px-6 py-4"><div className="h-4 bg-[#e5eeff] rounded animate-pulse" style={{ width: w }} /></td>
                        ))}</tr>
                      ))
                    : notices.length === 0
                    ? (
                      <tr><td colSpan={5} className="px-6 py-16 text-center text-[14px] text-[#45474c]">
                        {keyword ? `"${keyword}"에 해당하는 공지사항이 없습니다.` : '등록된 공지사항이 없습니다.'}
                      </td></tr>
                    )
                    : notices.map((notice) => (
                      <tr key={notice.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {notice.isPinned && <PushPin size={14} className="text-[#855300] shrink-0" weight="fill" />}
                            <Link to={`/notices/${notice.id}`}
                              className="text-[14px] font-medium text-[#0b1c30] hover:text-[#091426] hover:underline truncate max-w-xs block">
                              {notice.title}
                            </Link>
                            {notice.isNew && (
                              <span className="shrink-0 text-[10px] bg-[#e5eeff] text-[#091426] px-1.5 py-0.5 rounded font-bold">NEW</span>
                            )}
                            {notice.hasAttachments && (
                              <Paperclip size={13} className="text-[#45474c] shrink-0" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[14px] text-[#45474c] whitespace-nowrap">{notice.authorName ?? '-'}</td>
                        <td className="px-6 py-4 text-[14px] text-[#45474c] whitespace-nowrap">{fmt(notice.createdAt)}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => pinMutation.mutate(notice.id)} disabled={pinMutation.isPending}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors disabled:opacity-40 ${
                              notice.isPinned
                                ? 'bg-[#fea619]/20 text-[#684000] hover:bg-[#fea619]/30'
                                : 'bg-[#e5eeff] text-[#45474c] hover:bg-[#dce9ff]'
                            }`}>
                            {notice.isPinned ? '고정중' : '고정'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Link to={`/admin/notices/${notice.id}/edit`}
                              className="p-2 text-[#45474c] hover:text-[#091426] hover:bg-[#eff4ff] rounded-lg transition-all inline-flex">
                              <NotePencil size={18} />
                            </Link>
                            <button onClick={() => handleDelete(notice.id, notice.title)} disabled={deleteMutation.isPending}
                              className="p-2 text-[#45474c] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-all disabled:opacity-40">
                              <Trash size={18} />
                            </button>
                          </div>
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
                : notices.length === 0
                ? (
                  <div className="px-6 py-16 text-center text-[14px] text-[#45474c]">
                    {keyword ? `"${keyword}"에 해당하는 공지사항이 없습니다.` : '등록된 공지사항이 없습니다.'}
                  </div>
                )
                : notices.map((notice) => (
                  <div key={notice.id} className="px-4 py-4 space-y-2">
                    <div className="flex items-center gap-2">
                      {notice.isPinned && <PushPin size={14} className="text-[#855300] shrink-0" weight="fill" />}
                      <Link to={`/notices/${notice.id}`}
                        className="text-[14px] font-medium text-[#0b1c30] hover:underline truncate min-w-0">
                        {notice.title}
                      </Link>
                      {notice.isNew && (
                        <span className="shrink-0 text-[10px] bg-[#e5eeff] text-[#091426] px-1.5 py-0.5 rounded font-bold">NEW</span>
                      )}
                      {notice.hasAttachments && (
                        <Paperclip size={13} className="text-[#45474c] shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] text-[#45474c] truncate">{notice.authorName ?? '-'} · {fmt(notice.createdAt)}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => pinMutation.mutate(notice.id)} disabled={pinMutation.isPending}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors disabled:opacity-40 ${
                            notice.isPinned
                              ? 'bg-[#fea619]/20 text-[#684000] hover:bg-[#fea619]/30'
                              : 'bg-[#e5eeff] text-[#45474c] hover:bg-[#dce9ff]'
                          }`}>
                          {notice.isPinned ? '고정중' : '고정'}
                        </button>
                        <Link to={`/admin/notices/${notice.id}/edit`}
                          className="p-2 text-[#45474c] hover:text-[#091426] hover:bg-[#eff4ff] rounded-lg transition-all inline-flex">
                          <NotePencil size={18} />
                        </Link>
                        <button onClick={() => handleDelete(notice.id, notice.title)} disabled={deleteMutation.isPending}
                          className="p-2 text-[#45474c] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-all disabled:opacity-40">
                          <Trash size={18} />
                        </button>
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
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}
                    className="p-2 rounded-lg border border-[#c5c6cd] hover:bg-[#e5eeff] disabled:opacity-40 transition-colors">
                    <CaretLeft size={16} />
                  </button>
                  {pageNums.map((n) => (
                    <PageBtn key={n} label={n + 1} onClick={() => setPage(n)} active={n === currentPage} />
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
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
    </div>
  )
}
