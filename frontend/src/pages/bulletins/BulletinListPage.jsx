import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBulletins, createBulletin, updateBulletin, deleteBulletin } from '@/api/bulletins'
import { deleteFile } from '@/api/files'
import useAuthStore from '@/stores/authStore'
import toast from '@/utils/toast'
import { MagnifyingGlass, CaretLeft, CaretRight } from '@phosphor-icons/react'

const PAGE_SIZE = 10
const PAGE_WINDOW = 5

const fmtDot = (val) => {
  if (!val) return ''
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return String(val)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const getPageRange = (current, total) => {
  if (total <= PAGE_WINDOW) return Array.from({ length: total }, (_, i) => i)
  let start = Math.max(0, current - Math.floor(PAGE_WINDOW / 2))
  const end = Math.min(total, start + PAGE_WINDOW)
  start = Math.max(0, end - PAGE_WINDOW)
  return Array.from({ length: PAGE_WINDOW }, (_, i) => start + i)
}

const PdfFileInput = ({ file, onChange, onClear }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-[#E5E5E5] hover:border-[#171717] cursor-pointer transition group">
      <span className="text-sm text-[#737373]">
        {file ? `✓ ${file.name}` : '파일 선택 (PDF · 최대 10MB)'}
      </span>
      {file && (
        <button type="button" onClick={(e) => { e.preventDefault(); onClear() }}
          className="ml-auto text-[#737373] hover:text-red-500 shrink-0">✕</button>
      )}
      <input type="file" accept=".pdf,application/pdf" onChange={onChange} className="hidden" />
    </label>
  </div>
)

const WriteModal = ({ onClose, onSaved }) => {
  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')
  const [file,    setFile]    = useState(null)
  const [error,   setError]   = useState('')
  const [saving,  setSaving]  = useState(false)

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) { setFile(null); return }
    if (f.type !== 'application/pdf') { setError('PDF 파일만 업로드 가능합니다.'); e.target.value = ''; return }
    if (f.size > 10 * 1024 * 1024)   { setError('파일 크기는 10MB를 초과할 수 없습니다.'); e.target.value = ''; return }
    setError('')
    setFile(f)
  }

  const handleSave = async () => {
    setError('')
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    const fd = new FormData()
    fd.append('title', title.trim())
    if (content.trim()) fd.append('content', content.trim())
    if (file) fd.append('thumbnail', file)
    setSaving(true)
    try {
      await createBulletin(fd)
      onSaved()
    } catch (e) {
      setError(e?.response?.data?.message ?? '주보 등록에 실패했습니다.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[#171717]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#FAF9F6] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-[#E5E5E5]">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#E5E5E5]">
          <h2 className="text-xl font-bold text-[#2C2C2C]">새 주보 등록</h2>
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
              placeholder="주보 제목을 입력하세요"
              className="w-full px-4 py-3 bg-white border border-[#E5E5E5] focus:border-[#171717] outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C2C2C]">주보 파일 <span className="text-xs text-[#737373]">(PDF만 가능 / 최대 10MB)</span></label>
            <PdfFileInput file={file} onChange={handleFileChange} onClear={() => setFile(null)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C2C2C]">내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              rows={5} placeholder="주보 내용을 입력하세요 (선택)"
              className="w-full px-4 py-3 bg-white border border-[#E5E5E5] focus:border-[#171717] outline-none transition-all resize-none" />
          </div>
        </div>
        {error && <div className="px-8 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">{error}</div>}
        <div className="flex items-center justify-end gap-3 px-8 py-5 bg-[#F4F2EA] border-t border-[#E5E5E5]">
          <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-[#737373] hover:text-[#171717] transition-colors">취소</button>
          <button onClick={handleSave} disabled={saving}
            className="px-8 py-2 text-sm font-medium bg-[#171717] text-[#FAF9F6] hover:bg-[#2C2C2C] transition-colors disabled:opacity-50">
            {saving ? '등록 중...' : '등록'}
          </button>
        </div>
      </div>
    </div>
  )
}

const EditModal = ({ bulletin, onClose, onSaved }) => {
  const [title,        setTitle]        = useState(bulletin.title ?? '')
  const [content,      setContent]      = useState(bulletin.content ?? '')
  const [file,         setFile]         = useState(null)
  const [error,        setError]        = useState('')
  const [saving,       setSaving]       = useState(false)
  const [hasExistingFile, setHasExistingFile] = useState(!!bulletin.fileId)
  const [deletingFile, setDeletingFile] = useState(false)

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) { setFile(null); return }
    if (f.type !== 'application/pdf') { setError('PDF 파일만 업로드 가능합니다.'); e.target.value = ''; return }
    if (f.size > 10 * 1024 * 1024)   { setError('파일 크기는 10MB를 초과할 수 없습니다.'); e.target.value = ''; return }
    setError('')
    setFile(f)
  }

  const handleDeleteExistingFile = async () => {
    if (!confirm('기존 파일을 삭제하시겠습니까?')) return
    setDeletingFile(true)
    try {
      await deleteFile(bulletin.fileId)
      setHasExistingFile(false)
    } catch {
      setError('파일 삭제에 실패했습니다.')
    } finally {
      setDeletingFile(false)
    }
  }

  const handleSave = async () => {
    setError('')
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    const fd = new FormData()
    fd.append('title', title.trim())
    if (content.trim()) fd.append('content', content.trim())
    if (file) fd.append('thumbnail', file)
    setSaving(true)
    try {
      await updateBulletin(bulletin.id, fd)
      onSaved()
    } catch (e) {
      setError(e?.response?.data?.message ?? '수정에 실패했습니다.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[#171717]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#FAF9F6] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-[#E5E5E5]">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#E5E5E5]">
          <h2 className="text-xl font-bold text-[#2C2C2C]">주보 수정</h2>
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
              className="w-full px-4 py-3 bg-white border border-[#E5E5E5] focus:border-[#171717] outline-none transition-all" />
          </div>
          {hasExistingFile && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2C2C2C]">현재 파일</label>
              <div className="flex items-center justify-between px-4 py-3 bg-[#F4F2EA] border border-[#E5E5E5]">
                <span className="text-sm text-[#737373] truncate">{bulletin.title}.pdf</span>
                <button onClick={handleDeleteExistingFile} disabled={deletingFile}
                  className="ml-3 text-xs text-red-500 hover:text-red-700 disabled:opacity-40 shrink-0">
                  {deletingFile ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C2C2C]">
              {hasExistingFile ? '새 파일로 교체 (선택)' : '주보 파일'} <span className="text-xs text-[#737373]">PDF · 최대 10MB</span>
            </label>
            <PdfFileInput file={file} onChange={handleFileChange} onClear={() => setFile(null)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C2C2C]">내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              rows={5} placeholder="주보 내용을 입력하세요 (선택)"
              className="w-full px-4 py-3 bg-white border border-[#E5E5E5] focus:border-[#171717] outline-none transition-all resize-none" />
          </div>
        </div>
        {error && <div className="px-8 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">{error}</div>}
        <div className="flex items-center justify-end gap-3 px-8 py-5 bg-[#F4F2EA] border-t border-[#E5E5E5]">
          <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-[#737373] hover:text-[#171717] transition-colors">취소</button>
          <button onClick={handleSave} disabled={saving}
            className="px-8 py-2 text-sm font-medium bg-[#171717] text-[#FAF9F6] hover:bg-[#2C2C2C] transition-colors disabled:opacity-50">
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

const DeleteModal = ({ title, onClose, onConfirm, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-[#171717]/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-[#FAF9F6] max-w-md w-full border border-[#E5E5E5]">
      <div className="p-8">
        <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">주보 삭제</h3>
        <p className="text-[#737373] mb-1">다음 주보를 삭제하시겠습니까?</p>
        <p className="text-[#2C2C2C] font-medium bg-[#F4F2EA] px-4 py-3">{title}</p>
      </div>
      <div className="flex items-center justify-end gap-3 px-8 py-5 bg-[#F4F2EA] border-t border-[#E5E5E5]">
        <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-[#737373] hover:text-[#171717] transition-colors">취소</button>
        <button onClick={onConfirm} disabled={deleting}
          className="px-8 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
          {deleting ? '삭제 중...' : '삭제하기'}
        </button>
      </div>
    </div>
  </div>
)

const Thumbnail = ({ url }) => {
  if (url) return (
    <div className="w-12 h-16 bg-cover bg-center border border-[#E5E5E5] flex-shrink-0"
      style={{ backgroundImage: `url(${url})` }} />
  )
  return (
    <div className="w-12 h-16 bg-[#F4F2EA] flex items-center justify-center border border-[#E5E5E5] flex-shrink-0">
      <svg className="w-6 h-6 text-[#A3A3A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  )
}

const BulletinListPage = () => {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const { canWrite: canWriteFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const isAdmin  = isAdminFn()
  const canWrite = canWriteFn('BULLETIN')
  const userId   = getUserId()

  const [page,         setPage]         = useState(0)
  const [keyword,      setKeyword]      = useState('')
  const [inputVal,     setInputVal]     = useState('')
  const [writeOpen,    setWriteOpen]    = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['bulletins', page, keyword],
    queryFn:  () => getBulletins({ page, size: PAGE_SIZE, keyword }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBulletin(id),
    onSuccess: () => {
      setDeleteTarget(null)
      queryClient.invalidateQueries({ queryKey: ['bulletins'] })
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? '삭제에 실패했습니다.'),
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    setKeyword(inputVal)
  }

  const goPage = (p) => {
    const total = data?.pageInfo?.totalPages ?? 0
    if (p < 0 || p >= total) return
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const bulletins     = data?.content ?? []
  const pageInfo      = data?.pageInfo ?? {}
  const totalPages    = pageInfo.totalPages ?? 0
  const totalElements = pageInfo.totalElements ?? 0
  const currentPage   = pageInfo.page ?? 0
  const pageSize      = pageInfo.size ?? PAGE_SIZE

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero */}
      <section className="pt-20 bg-[#171717] text-[#FAF9F6] border-b border-[#2C2C2C]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <span className="font-mono text-xs tracking-[0.25em] uppercase text-[#737373] mb-4 block">Weekly Bulletin</span>
            <h1 className="text-5xl font-bold tracking-tight">주보 게시판</h1>
          </div>
          <div className="flex items-center gap-4">
            {canWrite && (
              <button onClick={() => setWriteOpen(true)}
                className="text-xs font-bold tracking-[0.1em] uppercase bg-[#FAF9F6] text-[#171717] px-6 py-2.5 hover:bg-white transition-colors whitespace-nowrap">
                + 새 주보
              </button>
            )}
            <form onSubmit={handleSearch} className="relative w-full md:w-72">
              <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="w-full h-10 pl-4 pr-10 bg-transparent border border-[#737373] text-[#FAF9F6] text-sm focus:outline-none focus:border-[#FAF9F6] transition-colors placeholder:text-[#737373]" />
              <button type="submit" className="absolute right-0 top-0 w-10 h-10 flex items-center justify-center text-[#737373] hover:text-[#FAF9F6] transition-colors">
                <MagnifyingGlass size={16} weight="bold" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Table */}
      <main className="max-w-[1200px] mx-auto px-6 pt-14 md:pt-20 pb-32">
        <div className="h-px w-full bg-[#171717]" />
        <div className="grid grid-cols-[60px_64px_1fr_auto_auto] gap-4 px-4 py-3 border-b border-[#E5E5E5] text-[11px] font-mono text-[#A3A3A3] uppercase tracking-widest items-center">
          <div>No.</div>
          <div>Thumb</div>
          <div>Title</div>
          <div className="text-center w-14">File</div>
          <div className="text-right w-24">Date</div>
        </div>

        {isLoading && (
          <div className="py-32 text-center font-mono text-sm text-[#737373] tracking-wider">불러오는 중...</div>
        )}
        {isError && (
          <div className="py-32 text-center text-sm text-red-600">주보 목록을 불러올 수 없습니다.</div>
        )}
        {!isLoading && !isError && bulletins.length === 0 && (
          <div className="py-32 text-center text-sm text-[#737373]">
            {keyword ? `"${keyword}"에 해당하는 주보가 없습니다.` : '등록된 주보가 없습니다.'}
          </div>
        )}

        {!isLoading && !isError && bulletins.map((bulletin, idx) => (
          <div key={bulletin.id}
            className="grid grid-cols-[60px_64px_1fr_auto_auto] gap-4 px-4 py-5 border-b border-[#E5E5E5] hover:bg-[#F4F2EA] transition-colors items-center group">
            <div className="font-mono text-sm text-[#737373]">
              {totalElements - currentPage * pageSize - idx}
            </div>
            <div className="flex items-center">
              <button onClick={() => navigate(`/bulletin/${bulletin.id}`)}>
                <Thumbnail url={bulletin.thumbnailUrl} />
              </button>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => navigate(`/bulletin/${bulletin.id}`)}
                className="font-medium text-base text-[#2C2C2C] group-hover:text-[#171717] transition-colors text-left truncate">
                {bulletin.title}
              </button>
              <span className="font-mono text-xs text-[#A3A3A3] flex-shrink-0">{bulletin.viewCount}</span>
              {canWrite && (isAdmin || bulletin.authorId === userId) && (
                <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditTarget(bulletin)}
                    className="p-1.5 border border-[#E5E5E5] text-[#737373] hover:border-[#171717] hover:text-[#171717] transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => setDeleteTarget({ id: bulletin.id, title: bulletin.title })}
                    className="p-1.5 border border-[#E5E5E5] text-red-500 hover:border-red-500 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-center w-14">
              <button onClick={() => navigate(`/bulletin/${bulletin.id}`)}
                className="inline-flex px-2 py-1 border border-[#E5E5E5] text-[10px] font-mono tracking-widest text-[#737373] hover:text-[#171717] hover:border-[#171717] transition-colors">
                PDF
              </button>
            </div>
            <div className="font-mono text-sm text-[#737373] text-right w-24">
              {fmtDot(bulletin.createdAt)}
            </div>
          </div>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center">
            <nav className="inline-flex border border-[#E5E5E5]">
              <button onClick={() => goPage(currentPage - 1)} disabled={currentPage === 0}
                className="w-10 h-10 flex items-center justify-center border-r border-[#E5E5E5] text-[#737373] hover:bg-[#F4F2EA] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <CaretLeft size={14} weight="bold" />
              </button>
              {getPageRange(currentPage, totalPages).map((p) => (
                <button key={p} onClick={() => goPage(p)}
                  className={`w-10 h-10 flex items-center justify-center border-r border-[#E5E5E5] font-mono text-sm transition-colors ${
                    p === currentPage ? 'bg-[#171717] text-white' : 'text-[#737373] hover:bg-[#F4F2EA] hover:text-[#171717]'
                  }`}>
                  {p + 1}
                </button>
              ))}
              <button onClick={() => goPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}
                className="w-10 h-10 flex items-center justify-center text-[#737373] hover:bg-[#F4F2EA] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <CaretRight size={14} weight="bold" />
              </button>
            </nav>
          </div>
        )}
      </main>

      {writeOpen && (
        <WriteModal
          onClose={() => setWriteOpen(false)}
          onSaved={() => { setWriteOpen(false); queryClient.invalidateQueries({ queryKey: ['bulletins'] }) }}
        />
      )}
      {editTarget && (
        <EditModal
          key={editTarget.id}
          bulletin={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); queryClient.invalidateQueries({ queryKey: ['bulletins'] }) }}
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

export default BulletinListPage
