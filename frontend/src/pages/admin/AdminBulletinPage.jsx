import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBulletins, createBulletin, updateBulletin, deleteBulletin, uploadBulletinImage } from '@/api/bulletins'
import useAuthStore from '@/stores/authStore'
import useQuillEditor from '@/hooks/useQuillEditor.jsx'
import { toEditorHtml, stripHtml } from '@/utils/richText'
import {
  Newspaper, PlusCircle, MagnifyingGlass, Bell, Question,
  CalendarBlank, Eye, Clock, Funnel,
  NotePencil, Trash, CaretLeft, CaretRight,
  Image as ImageIcon, X, Warning, Paperclip,
} from '@phosphor-icons/react'

const fmt = (val) => {
  if (!val) return '-'
  const d = new Date(val)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const isThisMonth = (val) => {
  if (!val) return false
  const d = new Date(val); const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth()
}

/* 모달 안에서 쓰는 Quill 스타일 — 본문에 이미지·서식을 넣을 수 있게 에디터로 대체 */
const QUILL_STYLE = `
  .ql-tooltip { display: none !important; }
  .ql-container { min-height: 260px; font-size: 14px; border-color: #c5c6cd !important; }
  .ql-editor    { min-height: 260px; background-color: #fff; font-family: inherit; }
  .ql-toolbar   { background-color: #f8f9ff; border-color: #c5c6cd !important; }
  .ql-editor a  { color: #2563eb !important; text-decoration: underline !important; }
  .ql-editor img { max-width: 100%; height: auto; }
`

/* ── 등록 모달 ── */
function WriteModal({ onClose, onSaved }) {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleImageUpload = useCallback((image) => uploadBulletinImage(image), [])
  const { containerRef, getHTML, LinkTooltip } = useQuillEditor({ onImageUpload: handleImageUpload })

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) { setFile(null); return }
    if (f.type !== 'application/pdf') { setError('PDF 파일만 업로드 가능합니다.'); return }
    if (f.size > 10 * 1024 * 1024) { setError('파일 크기는 10MB를 초과할 수 없습니다.'); return }
    setError(''); setFile(f)
  }

  const handleSave = async () => {
    setError('')
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    const content = getHTML()
    const fd = new FormData()
    fd.append('title', title.trim())
    if (content) fd.append('content', content)
    if (file) fd.append('thumbnail', file)
    setSaving(true)
    try { await createBulletin(fd); onSaved() }
    catch (e) { setError(e?.response?.data?.message ?? '주보 등록에 실패했습니다.'); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <style>{QUILL_STYLE}</style>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#c5c6cd]">
          <h2 className="text-[18px] font-semibold text-[#0b1c30]">새 주보 등록</h2>
          <button onClick={onClose} className="p-1.5 text-[#45474c] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg transition-colors"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-[12px] font-semibold text-[#45474c] uppercase tracking-wider mb-1.5">제목 <span className="text-[#ba1a1a]">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="주보 제목을 입력하세요"
              className="w-full border border-[#c5c6cd] rounded-lg px-3 py-2 text-[14px] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#091426]/20 transition-all" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#45474c] uppercase tracking-wider mb-1.5">
              주보 파일 <span className="text-[11px] font-normal text-[#75777d] normal-case ml-1">(PDF만 가능 / 최대 10MB)</span>
            </label>
            <label className="flex items-center gap-3 w-full border border-dashed border-[#c5c6cd] rounded-lg px-4 py-3 cursor-pointer hover:border-[#091426] hover:bg-[#eff4ff] transition-colors">
              <Paperclip size={18} className="text-[#45474c] shrink-0" />
              <span className="text-[14px] text-[#45474c] flex-1 truncate">{file ? file.name : '파일 선택하기'}</span>
              <span className="text-[11px] text-[#75777d] shrink-0">PDF · 10MB</span>
              <input type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
            </label>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#45474c] uppercase tracking-wider mb-1.5">
              내용 <span className="text-[11px] font-normal text-[#75777d] normal-case ml-1">(이미지 삽입·드래그·붙여넣기 가능)</span>
            </label>
            <div ref={containerRef} />
          </div>
        </div>
        {error && (
          <div className="px-6 py-3 bg-[#ffdad6] border-t border-[#ffdad6] flex items-center gap-2">
            <Warning size={16} className="text-[#93000a] shrink-0" />
            <p className="text-[13px] text-[#93000a]">{error}</p>
          </div>
        )}
        <div className="flex justify-end gap-2 px-6 py-4 bg-[#f8f9ff] border-t border-[#c5c6cd]">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-[#45474c] hover:text-[#0b1c30] rounded-lg transition-colors">취소</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-[13px] bg-[#091426] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? '등록 중...' : '등록'}
          </button>
        </div>
      </div>
      <LinkTooltip />
    </div>
  )
}

/* ── 수정 모달 ── */
function EditModal({ bulletin, onClose, onSaved }) {
  const [title, setTitle] = useState(bulletin.title ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleImageUpload = useCallback((image) => uploadBulletinImage(image), [])
  const { containerRef, getHTML, LinkTooltip } = useQuillEditor({
    onImageUpload: handleImageUpload,
    // 에디터 도입 이전 순수 텍스트 본문도 줄바꿈을 유지한 채 불러온다
    initialValue: toEditorHtml(bulletin.content),
  })

  const handleSave = async () => {
    setError('')
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', title.trim())
      // 내용을 비운 경우도 반영되도록 빈 문자열까지 전송한다
      fd.append('content', getHTML())
      await updateBulletin(bulletin.id, fd)
      onSaved()
    } catch (e) { setError(e?.response?.data?.message ?? '수정에 실패했습니다.'); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <style>{QUILL_STYLE}</style>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#c5c6cd]">
          <h2 className="text-[18px] font-semibold text-[#0b1c30]">주보 수정</h2>
          <button onClick={onClose} className="p-1.5 text-[#45474c] hover:text-[#0b1c30] hover:bg-[#eff4ff] rounded-lg transition-colors"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-[12px] font-semibold text-[#45474c] uppercase tracking-wider mb-1.5">제목 <span className="text-[#ba1a1a]">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[#c5c6cd] rounded-lg px-3 py-2 text-[14px] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#091426]/20 transition-all" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#45474c] uppercase tracking-wider mb-1.5">
              내용 <span className="text-[11px] font-normal text-[#75777d] normal-case ml-1">(이미지 삽입·드래그·붙여넣기 가능)</span>
            </label>
            <div ref={containerRef} />
          </div>
        </div>
        {error && (
          <div className="px-6 py-3 bg-[#ffdad6] border-t border-[#ffdad6] flex items-center gap-2">
            <Warning size={16} className="text-[#93000a] shrink-0" />
            <p className="text-[13px] text-[#93000a]">{error}</p>
          </div>
        )}
        <div className="flex justify-end gap-2 px-6 py-4 bg-[#f8f9ff] border-t border-[#c5c6cd]">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-[#45474c] hover:text-[#0b1c30] rounded-lg transition-colors">취소</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-[13px] bg-[#091426] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
      <LinkTooltip />
    </div>
  )
}

/* ── 통계 카드 ── */
function StatCard({ Icon, iconBg, iconColor, label, value, badge, badgeColor }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-[#c5c6cd] p-6 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <span className={`p-2 rounded-lg ${iconBg}`}><Icon size={22} className={iconColor} /></span>
        {badge && <span className={`text-[12px] font-bold ${badgeColor}`}>{badge}</span>}
      </div>
      <div className="mt-4">
        <p className="text-[12px] font-medium text-[#45474c] uppercase tracking-tight">{label}</p>
        <h3 className="text-[24px] font-semibold text-[#0b1c30] mt-1 leading-tight">{value}</h3>
      </div>
    </div>
  )
}

/* ── 페이지네이션 버튼 ── */
function PageBtn({ label, onClick, active, disabled }) {
  if (active) return <button className="w-9 h-9 rounded-lg bg-[#091426] text-white text-[12px] font-bold">{label}</button>
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-9 h-9 rounded-lg border border-[#c5c6cd] text-[12px] font-bold text-[#45474c] hover:bg-[#e5eeff] disabled:opacity-40 transition-colors">
      {label}
    </button>
  )
}

/* ── 메인 ── */
export default function AdminBulletinPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAdminOrOperator } = useAuthStore()
  const isAdmin = isAdminOrOperator?.() ?? false

  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [writeOpen, setWriteOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'bulletins', page, keyword],
    queryFn: () => getBulletins({ page, size: 15, keyword }),
    staleTime: 30_000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBulletin(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'bulletins'] }),
  })

  const bulletins     = useMemo(() => data?.content ?? [], [data])
  const pageInfo      = data?.pageInfo ?? {}
  const totalElements = pageInfo.totalElements ?? 0
  const totalPages    = pageInfo.totalPages ?? 0
  const currentPage   = pageInfo.page ?? 0

  const thisMonthCount = useMemo(() => bulletins.filter((b) => isThisMonth(b.createdAt)).length, [bulletins])
  const totalViews     = useMemo(() => bulletins.reduce((s, b) => s + (b.viewCount ?? 0), 0), [bulletins])
  const latestDate     = bulletins[0]?.createdAt ? fmt(bulletins[0].createdAt) : '-'

  const handleSearch = (e) => { e.preventDefault(); setPage(0); setKeyword(searchInput) }
  const handleDelete = (id, title) => {
    if (!confirm(`"${title}" 주보를 삭제하시겠습니까?`)) return
    deleteMutation.mutate(id)
  }
  const handleSaved = () => {
    setWriteOpen(false); setEditTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin', 'bulletins'] })
  }

  const pageNums = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)
    const start = Math.max(0, Math.min(currentPage - 3, totalPages - 7))
    return Array.from({ length: 7 }, (_, i) => start + i)
  }, [totalPages, currentPage])

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* 상단 헤더 */}
      <header className="sticky top-0 z-40 flex flex-wrap md:flex-nowrap justify-between items-center gap-y-2 md:h-16 py-3 md:py-0 px-4 md:px-6 border-b border-[#c5c6cd] bg-[#f8f9ff]/80 backdrop-blur-md shrink-0">
        <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
          <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#45474c] pointer-events-none" />
          <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="주보 검색..."
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
                <span>Admin</span><CaretRight size={12} /><span className="text-[#091426] font-bold">주보 관리</span>
              </nav>
              <h2 className="text-[32px] font-semibold text-[#0b1c30] tracking-tight leading-10">주보 관리</h2>
              <p className="text-[14px] text-[#45474c] mt-1">주간 예배 주보를 등록하고 관리합니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { setPage(0); setKeyword(''); setSearchInput('') }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#c5c6cd] bg-white text-[12px] font-medium text-[#0b1c30] hover:bg-[#e5eeff] transition-all">
                <Funnel size={16} /> 초기화
              </button>
              {isAdmin && (
                <button onClick={() => setWriteOpen(true)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#091426] text-white text-[12px] font-semibold hover:opacity-90 transition-all shadow-sm">
                  <PlusCircle size={16} /> 새 주보 등록
                </button>
              )}
            </div>
          </section>

          {/* 통계 카드 */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard Icon={Newspaper} iconBg="bg-[#091426]/5" iconColor="text-[#091426]"
              label="전체 주보" value={`${totalElements}건`}
              badge={totalPages > 1 ? `${totalPages}페이지` : null} badgeColor="text-[#855300]" />
            <StatCard Icon={CalendarBlank} iconBg="bg-[#fea619]/10" iconColor="text-[#855300]"
              label="이번 달 주보" value={`${thisMonthCount}건`}
              badge={thisMonthCount > 0 ? '+이번 달' : '없음'}
              badgeColor={thisMonthCount > 0 ? 'text-[#855300]' : 'text-[#45474c]'} />
            <StatCard Icon={Eye} iconBg="bg-[#e5eeff]" iconColor="text-[#45474c]"
              label="조회수 합계" value={totalViews.toLocaleString()}
              badge="현재 페이지" badgeColor="text-[#45474c]" />
            <StatCard Icon={Clock} iconBg="bg-[#ffdad6]/30" iconColor="text-[#ba1a1a]"
              label="최근 등록일" value={latestDate} />
          </section>

          {/* 목록 테이블 */}
          <section className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-[#c5c6cd]">
            <div className="px-6 py-4 border-b border-[#c5c6cd] flex justify-between items-center bg-white">
              <h4 className="text-[18px] font-semibold text-[#0b1c30]">주보 목록</h4>
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
                    <th className="px-6 py-4">주보 정보</th>
                    <th className="px-6 py-4">작성자</th>
                    <th className="px-6 py-4">등록일</th>
                    <th className="px-6 py-4">상태</th>
                    <th className="px-6 py-4 text-right">조회</th>
                    <th className="px-6 py-4 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c6cd]/50">
                  {isLoading
                    ? [...Array(5)].map((_, i) => (
                        <tr key={i}>{[72, 300, 80, 80, 60, 64].map((w, j) => (
                          <td key={j} className="px-6 py-4"><div className="h-4 bg-[#e5eeff] rounded animate-pulse" style={{ width: w }} /></td>
                        ))}</tr>
                      ))
                    : bulletins.length === 0
                    ? (
                      <tr><td colSpan={6} className="px-6 py-16 text-center text-[14px] text-[#45474c]">
                        {keyword ? `"${keyword}"에 해당하는 주보가 없습니다.` : '등록된 주보가 없습니다.'}
                      </td></tr>
                    )
                    : bulletins.map((b) => (
                      <tr key={b.id} className="hover:bg-[#eff4ff]/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <button onClick={() => navigate(`/bulletin/${b.id}`)}
                              className="w-12 h-16 bg-[#e5eeff] rounded border border-[#c5c6cd] overflow-hidden flex-shrink-0 group-hover:shadow-md transition-shadow">
                              {b.thumbnailUrl
                                ? <img src={b.thumbnailUrl} alt={b.title} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-[#75777d]" /></div>
                              }
                            </button>
                            <div className="min-w-0">
                              <button onClick={() => navigate(`/bulletin/${b.id}`)}
                                className="text-[16px] font-bold text-[#0b1c30] hover:text-[#091426] hover:underline text-left block max-w-xs truncate">
                                {b.title}
                              </button>
                              {b.content && <p className="text-[12px] text-[#45474c] mt-0.5 max-w-xs truncate">{stripHtml(b.content)}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[14px] text-[#45474c] whitespace-nowrap">{b.authorName ?? '-'}</td>
                        <td className="px-6 py-4 text-[14px] text-[#45474c] whitespace-nowrap">{fmt(b.createdAt)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dce9ff] text-[#0b1c30] text-[11px] font-bold">
                            <span className="w-2 h-2 rounded-full bg-[#855300]" />게시됨
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-[14px] text-[#0b1c30] font-mono whitespace-nowrap">
                          {(b.viewCount ?? 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            {isAdmin && (
                              <>
                                <button onClick={() => setEditTarget(b)}
                                  className="p-2 text-[#45474c] hover:text-[#091426] hover:bg-[#eff4ff] rounded-lg transition-all" title="수정">
                                  <NotePencil size={18} />
                                </button>
                                <button onClick={() => handleDelete(b.id, b.title)} disabled={deleteMutation.isPending}
                                  className="p-2 text-[#45474c] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-all disabled:opacity-40" title="삭제">
                                  <Trash size={18} />
                                </button>
                              </>
                            )}
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
                : bulletins.length === 0
                ? (
                  <div className="px-6 py-16 text-center text-[14px] text-[#45474c]">
                    {keyword ? `"${keyword}"에 해당하는 주보가 없습니다.` : '등록된 주보가 없습니다.'}
                  </div>
                )
                : bulletins.map((b) => (
                  <div key={b.id} className="px-4 py-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <button onClick={() => navigate(`/bulletin/${b.id}`)}
                        className="w-10 h-14 bg-[#e5eeff] rounded border border-[#c5c6cd] overflow-hidden flex-shrink-0">
                        {b.thumbnailUrl
                          ? <img src={b.thumbnailUrl} alt={b.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={18} className="text-[#75777d]" /></div>
                        }
                      </button>
                      <div className="min-w-0 flex-1">
                        <button onClick={() => navigate(`/bulletin/${b.id}`)}
                          className="text-[15px] font-bold text-[#0b1c30] hover:underline text-left block truncate">
                          {b.title}
                        </button>
                        <p className="text-[12px] text-[#45474c] truncate">{b.authorName ?? '-'} · {fmt(b.createdAt)} · 조회 {(b.viewCount ?? 0).toLocaleString()}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setEditTarget(b)}
                          className="p-2 text-[#45474c] hover:text-[#091426] hover:bg-[#eff4ff] rounded-lg transition-all" title="수정">
                          <NotePencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(b.id, b.title)} disabled={deleteMutation.isPending}
                          className="p-2 text-[#45474c] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-all disabled:opacity-40" title="삭제">
                          <Trash size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-white border-t border-[#c5c6cd] flex justify-between items-center">
                <p className="text-[12px] text-[#45474c]">
                  {currentPage * 15 + 1}–{Math.min((currentPage + 1) * 15, totalElements)} / 총 {totalElements}건
                </p>
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
        <div className="flex gap-4">
          <a href="#" className="hover:text-[#091426] transition-colors">개인정보처리방침</a>
          <a href="#" className="hover:text-[#091426] transition-colors">이용약관</a>
        </div>
      </footer>

      {/* 모달 */}
      {writeOpen && <WriteModal onClose={() => setWriteOpen(false)} onSaved={handleSaved} />}
      {editTarget && <EditModal bulletin={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />}
    </div>
  )
}
