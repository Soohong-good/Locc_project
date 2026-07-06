import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllPopups, deletePopup, togglePopupActive } from '@/api/popups'
import useAuthStore from '@/stores/authStore'
import {
  AppWindow, PlusCircle, Bell, Question,
  NotePencil, Trash, CaretRight,
} from '@phosphor-icons/react'
import AdminPopupFormPage from './AdminPopupFormPage'

const TARGET_LABEL = { ALL: '전체', MEMBER_ONLY: '회원', GUEST_ONLY: '비회원' }

const fmtDate = (v) => {
  if (!v) return '-'
  return new Date(v).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export default function AdminPopupPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [filterActive, setFilterActive] = useState(null)
  const [formModal, setFormModal] = useState(null) // null | 'new' | popupId

  const { data: popups = [], isLoading } = useQuery({
    queryKey: ['admin', 'popups', filterActive],
    queryFn: () => getAllPopups(filterActive),
  })

  const toggleMutation = useMutation({
    mutationFn: togglePopupActive,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'popups'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deletePopup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'popups'] }),
  })

  const handleDelete = (id, title) => {
    if (!window.confirm(`"${title}" 팝업을 삭제하시겠습니까?`)) return
    deleteMutation.mutate(id)
  }

  const activeCount   = popups.filter((p) => p.isActive).length
  const inactiveCount = popups.filter((p) => !p.isActive).length

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* 상단 헤더 */}
      <header className="sticky top-0 z-40 flex flex-wrap md:flex-nowrap justify-between items-center gap-y-2 md:h-16 py-3 md:py-0 px-4 md:px-6 border-b border-[#c5c6cd] bg-[#f8f9ff]/80 backdrop-blur-md shrink-0">
        <h2 className="text-[16px] md:text-[20px] font-extrabold text-[#0b1c30] whitespace-nowrap">팝업 관리</h2>
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
                <span>Admin</span><CaretRight size={12} /><span className="text-[#091426] font-bold">팝업 관리</span>
              </nav>
              <h2 className="text-[32px] font-semibold text-[#0b1c30] tracking-tight leading-10">팝업 관리</h2>
              <p className="text-[14px] text-[#45474c] mt-1">메인 팝업 노출 설정을 관리합니다.</p>
            </div>
            <button onClick={() => setFormModal('new')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#091426] text-white text-[12px] font-semibold hover:opacity-90 transition-all shadow-sm">
              <PlusCircle size={16} /> 팝업 등록
            </button>
          </section>

          {/* 통계 카드 */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: '전체 팝업', value: `${popups.length}건`, iconBg: 'bg-[#091426]/5', iconColor: 'text-[#091426]' },
              { label: '활성 팝업', value: `${activeCount}건`, iconBg: 'bg-[#fea619]/10', iconColor: 'text-[#855300]' },
              { label: '비활성 팝업', value: `${inactiveCount}건`, iconBg: 'bg-[#e5eeff]', iconColor: 'text-[#45474c]' },
            ].map((c) => (
              <div key={c.label} className="bg-white border border-[#c5c6cd] p-6 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <span className={`p-2 rounded-lg w-fit ${c.iconBg}`}><AppWindow size={22} className={c.iconColor} /></span>
                <div className="mt-4">
                  <p className="text-[12px] font-medium text-[#45474c] uppercase tracking-tight">{c.label}</p>
                  <h3 className="text-[24px] font-semibold text-[#0b1c30] mt-1 leading-tight">{c.value}</h3>
                </div>
              </div>
            ))}
          </section>

          {/* 필터 + 목록 */}
          <section className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-[#c5c6cd]">
            <div className="px-6 py-4 border-b border-[#c5c6cd] flex justify-between items-center bg-white">
              <h4 className="text-[18px] font-semibold text-[#0b1c30]">팝업 목록</h4>
              <div className="flex gap-2">
                {[{ label: '전체', value: null }, { label: '활성', value: true }, { label: '비활성', value: false }].map(({ label, value }) => (
                  <button key={label} onClick={() => setFilterActive(value)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                      filterActive === value
                        ? 'bg-[#091426] text-white'
                        : 'bg-[#eff4ff] text-[#45474c] hover:bg-[#dce9ff]'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {/* 데스크탑: 테이블형 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] text-[#45474c] text-[12px] font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">제목</th>
                    <th className="px-6 py-4">대상</th>
                    <th className="px-6 py-4">노출 기간</th>
                    <th className="px-6 py-4 text-center">우선순위</th>
                    <th className="px-6 py-4 text-center">상태</th>
                    <th className="px-6 py-4 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c6cd]/50">
                  {isLoading
                    ? [...Array(4)].map((_, i) => (
                        <tr key={i}>{[200, 60, 160, 40, 60, 80].map((w, j) => (
                          <td key={j} className="px-6 py-4"><div className="h-4 bg-[#e5eeff] rounded animate-pulse" style={{ width: w }} /></td>
                        ))}</tr>
                      ))
                    : popups.length === 0
                    ? <tr><td colSpan={6} className="px-6 py-16 text-center text-[14px] text-[#45474c]">등록된 팝업이 없습니다.</td></tr>
                    : popups.map((popup) => (
                      <tr key={popup.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                        <td className="px-6 py-4 text-[14px] font-medium text-[#0b1c30]">{popup.title}</td>
                        <td className="px-6 py-4 text-[14px] text-[#45474c] whitespace-nowrap">
                          {TARGET_LABEL[popup.targetType] ?? popup.targetType}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-[#45474c] whitespace-nowrap">
                          {fmtDate(popup.displayStartDate)} ~ {fmtDate(popup.displayEndDate)}
                        </td>
                        <td className="px-6 py-4 text-center text-[14px] text-[#45474c] font-mono">{popup.priority}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => toggleMutation.mutate(popup.id)} disabled={toggleMutation.isPending}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors disabled:opacity-40 ${
                              popup.isActive
                                ? 'bg-[#e5eeff] text-[#091426] hover:bg-[#dce9ff]'
                                : 'bg-[#e5eeff]/40 text-[#75777d] hover:bg-[#e5eeff]'
                            }`}>
                            {popup.isActive ? '활성' : '비활성'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => setFormModal(popup.id)}
                              className="p-2 text-[#45474c] hover:text-[#091426] hover:bg-[#eff4ff] rounded-lg transition-all inline-flex">
                              <NotePencil size={18} />
                            </button>
                            <button onClick={() => handleDelete(popup.id, popup.title)} disabled={deleteMutation.isPending}
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
                ? [...Array(3)].map((_, i) => (
                    <div key={i} className="px-4 py-4"><div className="h-4 bg-[#e5eeff] rounded animate-pulse w-2/3" /></div>
                  ))
                : popups.length === 0
                ? <div className="px-6 py-16 text-center text-[14px] text-[#45474c]">등록된 팝업이 없습니다.</div>
                : popups.map((popup) => (
                  <div key={popup.id} className="px-4 py-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-medium text-[#0b1c30] truncate">{popup.title}</p>
                      <button onClick={() => toggleMutation.mutate(popup.id)} disabled={toggleMutation.isPending}
                        className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors disabled:opacity-40 ${
                          popup.isActive
                            ? 'bg-[#e5eeff] text-[#091426] hover:bg-[#dce9ff]'
                            : 'bg-[#e5eeff]/40 text-[#75777d] hover:bg-[#e5eeff]'
                        }`}>
                        {popup.isActive ? '활성' : '비활성'}
                      </button>
                    </div>
                    <p className="text-[12px] text-[#45474c] truncate">
                      {TARGET_LABEL[popup.targetType] ?? popup.targetType} · 우선순위 {popup.priority} · {fmtDate(popup.displayStartDate)} ~ {fmtDate(popup.displayEndDate)}
                    </p>
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setFormModal(popup.id)}
                        className="p-2 text-[#45474c] hover:text-[#091426] hover:bg-[#eff4ff] rounded-lg transition-all inline-flex">
                        <NotePencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(popup.id, popup.title)} disabled={deleteMutation.isPending}
                        className="p-2 text-[#45474c] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-all disabled:opacity-40">
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </section>

        </main>
      </div>

      {/* 하단 푸터 */}
      <footer className="h-12 shrink-0 flex items-center justify-between px-6 border-t border-[#c5c6cd] bg-white text-[11px] text-[#45474c] font-medium">
        <div>© 2026 그리스도사랑교회 관리자 시스템</div>
      </footer>

      {formModal && (
        <AdminPopupFormPage
          popupId={formModal === 'new' ? null : formModal}
          onClose={() => setFormModal(null)}
        />
      )}
    </div>
  )
}
