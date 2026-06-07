import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPraiseSheets, togglePraiseSheetPin, deletePraiseSheet, createPraiseSheet, uploadPraiseSheetImage } from '@/api/praiseSheets'
import useAuthStore from '@/stores/authStore'
import useQuillEditor from '@/hooks/useQuillEditor.jsx'
import Button from '@/components/ui/Button'
import PageHero from '@/components/ui/PageHero'
import { SkeletonRow } from '@/components/ui/SkeletonCard'
import toast from '@/utils/toast'

const QUILL_STYLE = `
  .ql-tooltip { display: none !important; }
  .ql-container { min-height: 240px; font-size: 16px; border-color: #e2e8f0 !important; }
  .ql-editor    { min-height: 240px; background-color: #f8fafc; font-family: inherit; }
  .ql-editor:focus { background-color: #fff; }
  .ql-toolbar   { background-color: #fff; border-color: #e2e8f0 !important; }
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
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-light text-slate-900 tracking-tight">찬양악보 등록</h2>
              <p className="text-sm text-slate-500 mt-1 font-light">찬양 악보와 관련 자료를 등록합니다</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-50 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">제목 <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="악보 제목을 입력하세요"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none transition-all font-light" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">내용</label>
              <div ref={containerRef} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 tracking-wide">
                첨부파일 <span className="text-xs text-slate-500 font-normal ml-1">(PDF, HWP, JPG, PNG · 최대 20MB)</span>
              </label>
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition group">
                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center flex-shrink-0 transition">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">파일 추가</p>
                  <p className="text-xs text-slate-400">PDF, HWP, JPG, PNG · 최대 20MB</p>
                </div>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.hwp"
                  onChange={handleFileChange} className="hidden" />
              </label>
              {files.length > 0 && (
                <ul className="space-y-1">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5">
                      <span className="truncate">✓ {f.name}</span>
                      <button type="button" onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="ml-2 text-slate-400 hover:text-red-500 shrink-0">✕</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {error && (
            <div className="px-8 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm font-light flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
            <button onClick={onClose} className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium">취소</button>
            <button onClick={handleSave} disabled={saving}
              className="px-8 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-medium disabled:opacity-60">
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
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white max-w-md w-full shadow-2xl">
      <div className="p-8">
        <h3 className="text-xl font-light text-slate-900 mb-2">찬양악보 삭제</h3>
        <p className="text-slate-600 font-light mb-1">다음 항목을 삭제하시겠습니까?</p>
        <p className="text-slate-900 font-medium">{title}</p>
      </div>
      <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-200">
        <Button variant="ghost" onClick={onClose}>취소</Button>
        <Button variant="danger" onClick={onConfirm} isLoading={deleting}>
          {deleting ? '삭제 중...' : '삭제'}
        </Button>
      </div>
    </div>
  </div>
)

const BookmarkIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
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
    queryFn:  () => getPraiseSheets({ page, size: 10, keyword }),
  })

  const sheets     = data?.content            ?? []
  const totalPages = data?.pageInfo?.totalPages    ?? 0
  const totalElem  = data?.pageInfo?.totalElements ?? 0
  const pageNum    = data?.pageInfo?.page          ?? 0
  const pageSize   = data?.pageInfo?.size          ?? 10

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

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ page: 0, keyword: searchInput })
  }

  useEffect(() => { setSearchInput(keyword) }, [keyword])

  const goPage = (p) => setSearchParams({ page: p, keyword })

  return (
    <main>
      <PageHero eyebrow="Praise Sheet" title="찬양악보" subtitle="찬양 악보와 관련 자료를 확인하세요">
        {canWrite && (
          <Button onClick={() => setWriteOpen(true)} variant="secondary" size="sm"
            className="border-white text-white hover:bg-white hover:text-slate-900">
            + 새 악보 등록
          </Button>
        )}
      </PageHero>

      <section className="py-5 bg-white px-6 border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="제목, 내용으로 검색"
              className="flex-1 px-4 py-2.5 text-sm border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors bg-slate-50 focus:bg-white" />
            <Button type="submit" size="sm">검색</Button>
            {keyword && (
              <Button type="button" variant="ghost" size="sm"
                onClick={() => { setSearchInput(''); setSearchParams({ page: 0, keyword: '' }) }}>
                초기화
              </Button>
            )}
          </form>
        </div>
      </section>

      <section className="py-16 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="space-y-0 border-t border-slate-200">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-red-500">찬양악보를 불러올 수 없습니다.</div>
          ) : sheets.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <p className="text-slate-500 font-light">등록된 찬양악보가 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-12 gap-4 py-4 px-4 border-b-2 border-slate-900 text-base font-medium text-slate-700">
                <div className="col-span-1 text-center">No</div>
                <div className="col-span-7">제목</div>
                <div className="col-span-2 text-center">등록일</div>
                <div className="col-span-2 text-center">조회수</div>
              </div>

              {sheets.map((sheet, idx) => (
                <div key={sheet.id}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 py-5 px-4 border-b border-slate-200
                    hover:bg-slate-50 transition-all duration-200 items-center group
                    ${sheet.isPinned ? 'bg-gradient-to-r from-slate-50 to-blue-50/30 border-l-4 border-blue-500' : ''}`}>

                  <div className="hidden md:flex col-span-1 items-center justify-center">
                    {sheet.isPinned
                      ? <BookmarkIcon className="w-5 h-5 text-slate-900" />
                      : <span className="text-slate-400 font-light text-sm">{totalElem - (pageNum * pageSize) - idx}</span>}
                  </div>

                  <div className="col-span-1 md:col-span-7">
                    <div className="flex items-center gap-3">
                      {sheet.isPinned && <span className="md:hidden flex-shrink-0"><BookmarkIcon className="w-5 h-5 text-slate-900" /></span>}
                      <Link to={`/praise-sheets/${sheet.id}`}
                        className={`text-base md:text-lg hover:underline hover:text-blue-600 flex-1 min-w-0 transition-colors
                          ${sheet.isPinned ? 'text-slate-900 font-medium' : 'text-slate-700 font-light'}`}>
                        {sheet.title}
                      </Link>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {sheet.hasAttachments && (
                          <span className="text-slate-400" title="첨부파일">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          </span>
                        )}
                        {sheet.isNew && (
                          <span className="px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-sm">NEW</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-center md:justify-center">
                    <span className="text-sm md:text-base text-slate-400 md:text-slate-500">
                      {sheet.createdAt
                        ? new Date(sheet.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '')
                        : ''}
                    </span>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center gap-4">
                    <span className="text-sm md:text-base text-slate-400 md:text-slate-500 font-light">{sheet.viewCount}</span>
                    {canWrite && (isAdmin || sheet.authorId === userId) && (
                      <div className="flex gap-2">
                        {isAdmin && (
                          <button onClick={() => pinMutation.mutate(sheet.id)} disabled={pinMutation.isPending}
                            title={sheet.isPinned ? '고정 해제' : '고정'}
                            className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50
                              ${sheet.isPinned ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            <BookmarkIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setDeleteTarget({ id: sheet.id, title: sheet.title })}
                          className="p-2 bg-slate-100 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <nav className="flex items-center gap-2">
                    {page > 0 && (
                      <button onClick={() => goPage(page - 1)} className="px-3 py-2 text-slate-600 hover:bg-slate-100 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i} onClick={() => goPage(i)}
                        className={`px-4 py-2 transition font-light ${i === page ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                        {i + 1}
                      </button>
                    ))}
                    {page < totalPages - 1 && (
                      <button onClick={() => goPage(page + 1)} className="px-3 py-2 text-slate-600 hover:bg-slate-100 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </section>

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
    </main>
  )
}

export default PraiseSheetListPage
