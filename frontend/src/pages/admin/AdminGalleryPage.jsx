import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGalleryImageList, deleteGalleryImage } from '@/api/departments'
import useAuthStore from '@/stores/authStore'
import {
  Images, Bell, Question, Trash, Eye,
  CaretLeft, CaretRight, Image as ImageIcon,
} from '@phosphor-icons/react'

const DEPT_TABS = [
  { code: 'nursery',      label: '태영아부' },
  { code: 'preschool',    label: '유아유치부' },
  { code: 'children',     label: '초등부' },
  { code: 'youth',        label: '중고등부' },
  { code: 'young-adults', label: '청년부' },
  { code: 'newcomers',    label: '새가족부' },
  { code: 'multiethnic',  label: '다민족부' },
]

const fmtDate = (val) => {
  if (!val) return '-'
  const d = new Date(val)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* ── 썸네일 ── */
function GalleryThumb({ filename }) {
  const src = filename ? `/uploads/gallery/${filename}` : null
  return src
    ? <div className="w-14 h-14 rounded-lg border border-[#c5c6cd] bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${src})` }} />
    : <div className="w-14 h-14 rounded-lg border border-[#c5c6cd] bg-[#e5eeff] flex items-center justify-center shrink-0">
        <ImageIcon size={20} className="text-[#75777d]" />
      </div>
}

/* ── 탭 콘텐츠 ── */
function GalleryTabContent({ deptCode }) {
  const [page, setPage] = useState(0)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'gallery', deptCode, page],
    queryFn: () => getGalleryImageList(deptCode, page),
    staleTime: 30_000,
  })

  const deleteMutation = useMutation({
    mutationFn: ({ imageId }) => deleteGalleryImage(deptCode, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'gallery', deptCode] }),
  })

  const handleDelete = (imageId, title) => {
    if (!confirm(`"${title}" 갤러리를 삭제하시겠습니까?`)) return
    deleteMutation.mutate({ imageId })
  }

  const items       = data?.content ?? []
  const pageInfo    = data?.pageInfo ?? {}
  const totalPages  = pageInfo.totalPages ?? 0
  const currentPage = pageInfo.page ?? 0
  const totalElements = pageInfo.totalElements ?? 0

  const pageNums = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)
    const start = Math.max(0, Math.min(currentPage - 3, totalPages - 7))
    return Array.from({ length: 7 }, (_, i) => start + i)
  })()

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#eff4ff] text-[#45474c] text-[12px] font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">이미지</th>
              <th className="px-6 py-4">제목</th>
              <th className="px-6 py-4 hidden sm:table-cell">장수</th>
              <th className="px-6 py-4 hidden md:table-cell">업로더</th>
              <th className="px-6 py-4 hidden md:table-cell">등록일</th>
              <th className="px-6 py-4 hidden md:table-cell text-right">조회</th>
              <th className="px-6 py-4 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c5c6cd]/50">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i}>{[72, 240, 50, 80, 80, 50, 80].map((w, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-[#e5eeff] rounded animate-pulse" style={{ width: w }} /></td>
                  ))}</tr>
                ))
              : items.length === 0
              ? <tr><td colSpan={7} className="px-6 py-16 text-center text-[14px] text-[#45474c]">등록된 갤러리가 없습니다.</td></tr>
              : items.map((item) => (
                <tr key={item.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                  <td className="px-6 py-2">
                    <Link to={`/department/gallery/${item.id}`}>
                      <GalleryThumb filename={item.thumbnailFilename ?? item.storedFilename} />
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <Link to={`/department/gallery/${item.id}`}
                      className="text-[14px] font-medium text-[#0b1c30] hover:text-[#091426] hover:underline block max-w-[240px] truncate">
                      {item.title ?? '(제목 없음)'}
                    </Link>
                    {item.description && <span className="text-[12px] text-[#45474c] block max-w-[240px] truncate">{item.description}</span>}
                  </td>
                  <td className="px-6 py-3 text-[14px] text-[#45474c] hidden sm:table-cell whitespace-nowrap">
                    {item.imageCount ?? 1}장
                  </td>
                  <td className="px-6 py-3 text-[14px] text-[#45474c] hidden md:table-cell whitespace-nowrap">
                    {item.uploaderName ?? '-'}
                  </td>
                  <td className="px-6 py-3 text-[14px] text-[#45474c] hidden md:table-cell whitespace-nowrap">
                    {fmtDate(item.createdAt)}
                  </td>
                  <td className="px-6 py-3 text-[14px] text-[#45474c] hidden md:table-cell text-right font-mono whitespace-nowrap">
                    {item.viewCount ?? 0}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Link to={`/department/gallery/${item.id}`}
                        className="p-2 text-[#45474c] hover:text-[#091426] hover:bg-[#eff4ff] rounded-lg transition-all inline-flex">
                        <Eye size={18} />
                      </Link>
                      <button onClick={() => handleDelete(item.id, item.title ?? '(제목 없음)')} disabled={deleteMutation.isPending}
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
    </div>
  )
}

/* ── 메인 ── */
export default function AdminGalleryPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('nursery')

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* 상단 헤더 */}
      <header className="sticky top-0 z-40 flex justify-between items-center h-16 px-6 border-b border-[#c5c6cd] bg-[#f8f9ff]/80 backdrop-blur-md shrink-0">
        <h2 className="text-[20px] font-extrabold text-[#0b1c30]">갤러리 관리</h2>
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
              <span>Admin</span><CaretRight size={12} /><span className="text-[#091426] font-bold">갤러리 관리</span>
            </nav>
            <h2 className="text-[32px] font-semibold text-[#0b1c30] tracking-tight leading-10">갤러리 관리</h2>
            <p className="text-[14px] text-[#45474c] mt-1">부서별 갤러리 이미지를 관리합니다.</p>
          </section>

          {/* 목록 */}
          <section className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-[#c5c6cd]">
            {/* 부서 탭 */}
            <div className="flex border-b border-[#c5c6cd] overflow-x-auto bg-white">
              {DEPT_TABS.map((tab) => (
                <button key={tab.code} onClick={() => setActiveTab(tab.code)}
                  className={`shrink-0 px-5 py-3 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.code
                      ? 'border-[#091426] text-[#091426] font-semibold'
                      : 'border-transparent text-[#45474c] hover:text-[#0b1c30] hover:border-[#c5c6cd]'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <GalleryTabContent key={activeTab} deptCode={activeTab} />
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
