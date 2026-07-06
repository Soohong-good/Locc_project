import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  getAdminApplications,
  getAdminApplicationCategories,
  downloadApplicationsExcel,
} from '@/api/applications'
import useAuthStore from '@/stores/authStore'
import {
  ClipboardText, Bell, Question, CaretLeft, CaretRight, DownloadSimple,
} from '@phosphor-icons/react'

const STATUS_META = {
  PENDING:   { label: '접수 대기', cls: 'bg-[#fea619]/20 text-[#684000]' },
  COMPLETED: { label: '처리 완료', cls: 'bg-[#e5eeff] text-[#091426]' },
}

export default function AdminApplicationPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [page, setPage]             = useState(0)
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus]         = useState('')
  const [downloading, setDownloading] = useState(false)

  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'application-categories'],
    queryFn: getAdminApplicationCategories,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'applications', { page, categoryId, status }],
    queryFn: () => getAdminApplications({
      page, size: 20,
      categoryId: categoryId || undefined,
      status:     status     || undefined,
    }),
    placeholderData: (prev) => prev,
  })

  const list       = data?.content  ?? []
  const pageInfo   = data?.pageInfo ?? {}
  const totalPages = pageInfo.totalPages   ?? 1
  const totalElements = pageInfo.totalElements ?? 0
  const currentPage   = pageInfo.page ?? 0

  const pageNums = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)
    const start = Math.max(0, Math.min(currentPage - 3, totalPages - 7))
    return Array.from({ length: 7 }, (_, i) => start + i)
  })()

  const handleExcel = async () => {
    setDownloading(true)
    try { await downloadApplicationsExcel({ categoryId: categoryId || undefined, status: status || undefined }) }
    finally { setDownloading(false) }
  }

  const pendingCount = list.filter((i) => i.status === 'PENDING').length

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* 상단 헤더 */}
      <header className="sticky top-0 z-40 flex flex-wrap md:flex-nowrap justify-between items-center gap-y-2 md:h-16 py-3 md:py-0 px-4 md:px-6 border-b border-[#c5c6cd] bg-[#f8f9ff]/80 backdrop-blur-md shrink-0">
        <h2 className="text-[16px] md:text-[20px] font-extrabold text-[#0b1c30] whitespace-nowrap">신청 관리</h2>
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
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-[12px] text-[#45474c] mb-2">
                <span>Admin</span><CaretRight size={12} /><span className="text-[#091426] font-bold">신청 관리</span>
              </nav>
              <h2 className="text-[32px] font-semibold text-[#0b1c30] tracking-tight leading-10">시설·차량 신청 관리</h2>
              <p className="text-[14px] text-[#45474c] mt-1">시설 및 차량 신청 내역을 조회하고 처리합니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin/applications/categories')}
                className="px-4 py-2.5 text-[12px] border border-[#c5c6cd] text-[#0b1c30] font-semibold rounded-lg hover:bg-[#e5eeff] transition whitespace-nowrap">
                카테고리 관리
              </button>
              <button onClick={handleExcel} disabled={downloading}
                className="flex items-center gap-2 px-4 py-2.5 text-[12px] bg-[#091426] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition whitespace-nowrap shadow-sm">
                <DownloadSimple size={16} />
                {downloading ? '다운로드 중...' : '엑셀 다운로드'}
              </button>
            </div>
          </section>

          {/* 통계 카드 */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: '전체 신청', value: `${totalElements}건`, iconBg: 'bg-[#091426]/5', iconColor: 'text-[#091426]' },
              { label: '접수 대기', value: `${pendingCount}건`, iconBg: 'bg-[#fea619]/10', iconColor: 'text-[#855300]' },
              { label: '처리 완료', value: `${list.filter((i) => i.status === 'COMPLETED').length}건`, iconBg: 'bg-[#e5eeff]', iconColor: 'text-[#45474c]' },
            ].map((c) => (
              <div key={c.label} className="bg-white border border-[#c5c6cd] p-6 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <span className={`p-2 rounded-lg w-fit ${c.iconBg}`}><ClipboardText size={22} className={c.iconColor} /></span>
                <div className="mt-4">
                  <p className="text-[12px] font-medium text-[#45474c] uppercase tracking-tight">{c.label}</p>
                  <h3 className="text-[24px] font-semibold text-[#0b1c30] mt-1 leading-tight">{c.value}</h3>
                </div>
              </div>
            ))}
          </section>

          {/* 필터 + 목록 */}
          <section className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-[#c5c6cd]">
            <div className="px-6 py-4 border-b border-[#c5c6cd] flex justify-between items-center bg-white flex-wrap gap-3">
              <h4 className="text-[18px] font-semibold text-[#0b1c30]">신청 목록</h4>
              <div className="flex gap-3">
                <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(0) }}
                  className="px-3 py-2 border border-[#c5c6cd] rounded-lg text-[13px] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#091426]/20 bg-white">
                  <option value="">전체 카테고리</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0) }}
                  className="px-3 py-2 border border-[#c5c6cd] rounded-lg text-[13px] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#091426]/20 bg-white">
                  <option value="">전체 상태</option>
                  <option value="PENDING">접수 대기</option>
                  <option value="COMPLETED">처리 완료</option>
                </select>
              </div>
            </div>

            {/* 데스크탑: 테이블형 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] text-[#45474c] text-[12px] font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">카테고리</th>
                    <th className="px-6 py-4">신청자</th>
                    <th className="px-6 py-4">사용 날짜</th>
                    <th className="px-6 py-4">시간</th>
                    <th className="px-6 py-4">목적</th>
                    <th className="px-6 py-4">인원</th>
                    <th className="px-6 py-4">상태</th>
                    <th className="px-6 py-4">접수일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c6cd]/50">
                  {isLoading
                    ? [...Array(5)].map((_, i) => (
                        <tr key={i}>{[100, 80, 80, 80, 160, 50, 70, 80].map((w, j) => (
                          <td key={j} className="px-6 py-4"><div className="h-4 bg-[#e5eeff] rounded animate-pulse" style={{ width: w }} /></td>
                        ))}</tr>
                      ))
                    : list.length === 0
                    ? <tr><td colSpan={8} className="px-6 py-16 text-center text-[14px] text-[#45474c]">신청 내역이 없습니다.</td></tr>
                    : list.map((item) => {
                        const meta = STATUS_META[item.status]
                        return (
                          <tr key={item.id} onClick={() => navigate(`/admin/applications/${item.id}`)}
                            className="hover:bg-[#eff4ff]/50 transition-colors cursor-pointer">
                            <td className="px-6 py-3 text-[14px] font-medium text-[#0b1c30] whitespace-nowrap">{item.categoryName}</td>
                            <td className="px-6 py-3 text-[14px] text-[#45474c] whitespace-nowrap">{item.applicantName}</td>
                            <td className="px-6 py-3 text-[14px] text-[#45474c] whitespace-nowrap">{item.useDate}</td>
                            <td className="px-6 py-3 text-[13px] text-[#45474c] whitespace-nowrap">
                              {item.useStartTime?.slice(0, 5)} ~ {item.useEndTime?.slice(0, 5)}
                            </td>
                            <td className="px-6 py-3 text-[13px] text-[#45474c] max-w-[160px] truncate">{item.purpose}</td>
                            <td className="px-6 py-3 text-[14px] text-[#45474c] whitespace-nowrap">{item.headCount}명</td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${meta?.cls ?? 'bg-[#e5eeff] text-[#45474c]'}`}>
                                {item.statusLabel ?? meta?.label}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-[12px] text-[#45474c] whitespace-nowrap">{item.createdAt?.slice(0, 10)}</td>
                          </tr>
                        )
                      })
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
                : list.length === 0
                ? <div className="px-6 py-16 text-center text-[14px] text-[#45474c]">신청 내역이 없습니다.</div>
                : list.map((item) => {
                    const meta = STATUS_META[item.status]
                    return (
                      <div key={item.id} onClick={() => navigate(`/admin/applications/${item.id}`)}
                        className="px-4 py-4 space-y-1.5 cursor-pointer">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[14px] font-medium text-[#0b1c30] truncate">{item.categoryName}</p>
                          <span className={`shrink-0 inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${meta?.cls ?? 'bg-[#e5eeff] text-[#45474c]'}`}>
                            {item.statusLabel ?? meta?.label}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#45474c] truncate">{item.applicantName} · {item.headCount}명</p>
                        <p className="text-[13px] text-[#45474c] truncate">
                          {item.useDate} · {item.useStartTime?.slice(0, 5)} ~ {item.useEndTime?.slice(0, 5)}
                        </p>
                        <p className="text-[13px] text-[#45474c] truncate">{item.purpose}</p>
                        <p className="text-[12px] text-[#75777d]">접수 {item.createdAt?.slice(0, 10)}</p>
                      </div>
                    )
                  })
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
                    n === currentPage
                      ? <button key={n} className="w-9 h-9 rounded-lg bg-[#091426] text-white text-[12px] font-bold">{n + 1}</button>
                      : <button key={n} onClick={() => setPage(n)}
                          className="w-9 h-9 rounded-lg border border-[#c5c6cd] text-[12px] text-[#45474c] hover:bg-[#e5eeff] transition-colors">
                          {n + 1}
                        </button>
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
