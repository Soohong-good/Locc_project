import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPraiseSheets, togglePraiseSheetPin, deletePraiseSheet, createPraiseSheet, uploadPraiseSheetImage } from '@/api/praiseSheets'
import useAuthStore from '@/stores/authStore'
import useQuillEditor from '@/hooks/useQuillEditor.jsx'
import toast from '@/utils/toast'
import {
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react'
import Button from '@/components/ui/Button'
import { PinnableListHeader, PinnableListRow } from '@/components/ui/PinnableListRow'
import { getPageRange } from '@/utils/pagination'
import { formatDateDot as fmtDot } from '@/utils/dateFormat'

const PAGE_SIZE = 10

const QUILL_STYLE = `
  .ql-tooltip { display: none !important; }
  .ql-container { min-height: 240px; font-size: 16px; border-color: #E5E5E5 !important; }
  .ql-editor    { min-height: 240px; background-color: #FAF9F6; font-family: inherit; }
  .ql-editor:focus { background-color: #fff; }
  .ql-toolbar   { background-color: #fff; border-color: #E5E5E5 !important; }
`

const WriteModal = ({ onClose, onSaved }) => {
  const [title,  setTitle]  = useState('')
  const [files,  setFiles]  = useState([])
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  const { containerRef, getHTML, LinkTooltip } = useQuillEditor({ onImageUpload: uploadPraiseSheetImage })

  const handleFileChange = (e) => {
    const ALLOWED_EXTS = ['.pdf', '.jpg', '.jpeg', '.png', '.hwp']
    const newFiles = Array.from(e.target.files)
    for (const f of newFiles) {
      const ext = '.' + f.name.split('.').pop().toLowerCase()
      if (!ALLOWED_EXTS.includes(ext)) { toast.error(`허용되지 않는 파일 형식: ${f.name}`); e.target.value = ''; return }
      if (f.size > 20 * 1024 * 1024)  { toast.error(`파일 크기는 20MB 이하여야 합니다: ${f.name}`); e.target.value = ''; return }
    }
    setFiles((prev) => [...prev, ...newFiles])
    e.target.value = ''
  }

  const handleSave = async () => {
    setError('')
    if (!title.trim()) return setError('제목을 입력해주세요.')
    const fd = new FormData()
    fd.append('title',    title.trim())
    fd.append('content',  getHTML() || '')
    fd.append('isPinned', 'false')
    files.forEach((f) => fd.append('files', f))
    setSaving(true)
    try {
      await createPraiseSheet(fd)
      onSaved()
    } catch (e) {
      setError(e?.response?.data?.message ?? '등록에 실패했습니다.')
      setSaving(false)
    }
  }

  return (
    <>
      <style>{QUILL_STYLE}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-[#171717]/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-[#FAF9F6] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-[#E5E5E5]">
          <div className="flex items-center justify-between px-8 py-6 border-b border-[#E5E5E5]">
            <h2 className="text-xl font-bold text-[#2C2C2C]">찬양악보 등록</h2>
            <button onClick={onClose} className="text-[#737373] hover:text-[#171717] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2C2C2C]">제목 <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="악보 제목을 입력하세요"
                className="w-full px-4 py-3 bg-white border border-[#E5E5E5] focus:border-[#171717] outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2C2C2C]">내용</label>
              <div ref={containerRef} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#2C2C2C]">
                첨부파일 <span className="text-xs text-[#737373] font-normal ml-1">(PDF, HWP, JPG, PNG · 최대 20MB)</span>
              </label>
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-[#E5E5E5] hover:border-[#171717] cursor-pointer transition">
                <span className="text-sm text-[#737373]">파일 추가</span>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.hwp" onChange={handleFileChange} className="hidden" />
              </label>
              {files.length > 0 && (
                <ul className="space-y-1">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between text-xs text-[#737373] bg-[#F4F2EA] border border-[#E5E5E5] px-3 py-1.5">
                      <span className="truncate">✓ {f.name}</span>
                      <button type="button" onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="ml-2 text-[#737373] hover:text-red-500 shrink-0">✕</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {error && (
            <div className="px-8 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">{error}</div>
          )}
          <div className="flex items-center justify-end gap-3 px-8 py-5 bg-[#F4F2EA] border-t border-[#E5E5E5]">
            <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-[#737373] hover:text-[#171717] transition-colors">취소</button>
            <button onClick={handleSave} disabled={saving}
              className="px-8 py-2 text-sm font-medium bg-[#171717] text-[#FAF9F6] hover:bg-[#2C2C2C] transition-colors disabled:opacity-50">
              {saving ? '등록 중...' : '등록'}
            </button>
          </div>
        </div>
      </div>
      <LinkTooltip />
    </>
  )
}

const DeleteModal = ({ title, onClose, onConfirm, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-[#171717]/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-[#FAF9F6] max-w-md w-full border border-[#E5E5E5]">
      <div className="p-8">
        <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">찬양악보 삭제</h3>
        <p className="text-[#737373] mb-1">다음 항목을 삭제하시겠습니까?</p>
        <p className="text-[#2C2C2C] font-medium">{title}</p>
      </div>
      <div className="flex items-center justify-end gap-3 px-8 py-5 bg-[#F4F2EA] border-t border-[#E5E5E5]">
        <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-[#737373] hover:text-[#171717] transition-colors">취소</button>
        <button onClick={onConfirm} disabled={deleting}
          className="px-6 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
          {deleting ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </div>
  </div>
)

const PraiseSheetListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const page    = Number(searchParams.get('page') ?? 0)
  const keyword = searchParams.get('keyword') ?? ''
  const [searchInput,  setSearchInput]  = useState(keyword)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [writeOpen,    setWriteOpen]    = useState(false)

  const { canWrite: canWriteFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const isAdmin  = isAdminFn()
  const canWrite = canWriteFn('PRAISE_SHEET')
  const userId   = getUserId()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['praise-sheets', { page, keyword }],
    queryFn:  () => getPraiseSheets({ page, size: PAGE_SIZE, keyword }),
  })

  const sheets     = data?.content                ?? []
  const totalPages = data?.pageInfo?.totalPages    ?? 0
  const totalElem  = data?.pageInfo?.totalElements ?? 0
  const pageNum    = data?.pageInfo?.page          ?? 0
  const pageSize   = data?.pageInfo?.size          ?? PAGE_SIZE

  const pinMutation = useMutation({
    mutationFn: (id) => togglePraiseSheetPin(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['praise-sheets'] }),
    onError:    (e) => toast.error(e?.response?.data?.message ?? '고정 변경에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePraiseSheet(id),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['praise-sheets'] })
      setDeleteTarget(null)
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? '삭제에 실패했습니다.'),
  })

  useEffect(() => { setSearchInput(keyword) }, [keyword])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ page: 0, keyword: searchInput })
  }

  const goPage = (p) => {
    setSearchParams({ page: p, keyword })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero */}
      <section className="relative pt-20 text-[#FAF9F6] border-b border-[#2C2C2C] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/praise_sheet.png)' }} />
        <div className="absolute inset-0 bg-[#171717]/70" />
        <div className="relative max-w-[1200px] mx-auto px-6 py-8 md:py-16 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-5 md:gap-8">
          <div>
            <span className="font-mono text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.25em] uppercase text-[#737373] mb-2 md:mb-4 block">Praise Sheets</span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">찬양악보</h1>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            {canWrite && (
              <button
                onClick={() => setWriteOpen(true)}
                className="text-xs font-bold tracking-[0.1em] uppercase bg-[#FAF9F6] text-[#171717] px-6 py-2.5 hover:bg-white transition-colors whitespace-nowrap"
              >
                + 새 악보 등록
              </button>
            )}
            <form onSubmit={handleSearch} className="relative w-full md:w-72">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="w-full h-10 pl-4 pr-11 bg-transparent border border-[#737373] text-[#FAF9F6] text-sm focus:outline-none focus:border-[#FAF9F6] transition-colors placeholder:text-[#737373]"
              />
              <button type="submit" className="absolute right-0 top-0 w-11 h-11 flex items-center justify-center text-[#737373] hover:text-[#FAF9F6] transition-colors">
                <MagnifyingGlass size={16} weight="bold" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Table */}
      <main className="max-w-[1200px] mx-auto px-6 pt-14 md:pt-20 pb-32">
        <div className="h-px w-full bg-[#171717]" />
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
          <span className="text-[11px] font-mono text-[#A3A3A3] uppercase tracking-widest">찬양악보 목록</span>
          <span className="text-[11px] font-mono text-[#A3A3A3] uppercase tracking-widest">총 {totalElem}건</span>
        </div>
        <PinnableListHeader />

        {isLoading && (
          <div className="py-32 text-center font-mono text-sm text-[#737373] tracking-wider">불러오는 중...</div>
        )}
        {isError && (
          <div className="py-32 text-center text-sm text-red-600">찬양악보를 불러올 수 없습니다.</div>
        )}
        {!isLoading && !isError && sheets.length === 0 && (
          <div className="py-32 text-center text-sm text-[#737373]">
            {keyword ? `"${keyword}"에 해당하는 찬양악보가 없습니다.` : '등록된 찬양악보가 없습니다.'}
          </div>
        )}

        {!isLoading && !isError && sheets.map((sheet, idx) => (
          <PinnableListRow
            key={sheet.id}
            no={totalElem - pageNum * pageSize - idx}
            isPinned={sheet.isPinned}
            title={sheet.title}
            titleHref={`/praise-sheets/${sheet.id}`}
            hasAttachments={sheet.hasAttachments}
            isNew={sheet.isNew}
            date={fmtDot(sheet.createdAt)}
            authorName={sheet.authorName}
            authorRole={sheet.authorRole}
            viewCount={sheet.viewCount}
            canManage={canWrite && (isAdmin || sheet.authorId === userId)}
            isAdmin={isAdmin}
            onTogglePin={() => pinMutation.mutate(sheet.id)}
            pinPending={pinMutation.isPending}
            onDelete={() => setDeleteTarget({ id: sheet.id, title: sheet.title })}
          />
        ))}

        {totalPages > 1 && (
          <div className="mt-16 flex justify-center">
            <nav className="inline-flex border border-[#E5E5E5]">
              <button onClick={() => goPage(page - 1)} disabled={page === 0}
                className="w-11 h-11 flex items-center justify-center border-r border-[#E5E5E5] text-[#737373] hover:bg-[#F4F2EA] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <CaretLeft size={14} weight="bold" />
              </button>
              {getPageRange(page, totalPages).map((p) => (
                <button key={p} onClick={() => goPage(p)}
                  className={`w-11 h-11 flex items-center justify-center border-r border-[#E5E5E5] font-mono text-sm transition-colors ${
                    p === page ? 'bg-[#171717] text-white' : 'text-[#737373] hover:bg-[#F4F2EA] hover:text-[#171717]'
                  }`}>
                  {p + 1}
                </button>
              ))}
              <button onClick={() => goPage(page + 1)} disabled={page >= totalPages - 1}
                className="w-11 h-11 flex items-center justify-center text-[#737373] hover:bg-[#F4F2EA] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <CaretRight size={14} weight="bold" />
              </button>
            </nav>
          </div>
        )}
      </main>

      {writeOpen && (
        <WriteModal
          onClose={() => setWriteOpen(false)}
          onSaved={() => {
            setWriteOpen(false)
            queryClient.invalidateQueries({ queryKey: ['praise-sheets'] })
          }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          title={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          deleting={deleteMutation.isPending}
        />
      )}
    </div>
  )
}

export default PraiseSheetListPage
