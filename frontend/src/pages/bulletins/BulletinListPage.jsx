import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBulletins, createBulletin, updateBulletin, deleteBulletin } from '@/api/bulletins'
import { deleteFile } from '@/api/files'
import useAuthStore from '@/stores/authStore'
import { SkeletonRow } from '@/components/ui/SkeletonCard'
import Button from '@/components/ui/Button'
import PageHero from '@/components/ui/PageHero'
import toast from '@/utils/toast'

const formatDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const PdfFileInput = ({ file, onChange, onClear }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition group">
      <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center flex-shrink-0 transition">
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">새 파일 추가</p>
        <p className="text-xs text-slate-400">PDF · 최대 10MB</p>
      </div>
      <input type="file" accept=".pdf,application/pdf" onChange={onChange} className="hidden" />
    </label>
    {file && (
      <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5">
        <span className="truncate">✓ {file.name}</span>
        <button type="button" onClick={onClear} className="ml-2 text-slate-400 hover:text-red-500 shrink-0">✕</button>
      </div>
    )}
    <p className="text-xs text-slate-500">※ PDF 파일 업로드 시 자동으로 첫 페이지가 썸네일로 표시됩니다</p>
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-light text-slate-900 tracking-tight">새 주보 등록</h2>
            <p className="text-sm text-slate-500 mt-1 font-light">주보 정보를 입력해주세요</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-50 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 tracking-wide">제목 <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="주보 제목을 입력하세요"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none transition-all font-light" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 tracking-wide">주보 파일 <span className="text-xs text-slate-500">(PDF만 가능 / 최대 10MB)</span></label>
            <PdfFileInput file={file} onChange={handleFileChange} onClear={() => setFile(null)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 tracking-wide">내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              rows={6} placeholder="주보 내용을 입력하세요 (선택)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none transition-all font-light resize-none" />
          </div>
          {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 font-light text-sm">{error}</div>}
        </div>
        <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
          <button onClick={onClose} className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">취소</button>
          <button onClick={handleSave} disabled={saving}
            className="px-8 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-medium transition-all disabled:opacity-60">
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-light text-slate-900 tracking-tight">주보 수정</h2>
            <p className="text-sm text-slate-500 mt-1 font-light">주보 정보를 수정해주세요</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-50 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* 제목 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 tracking-wide">제목 <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none transition-all font-light" />
          </div>
          {/* 기존 파일 */}
          {hasExistingFile && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 tracking-wide">현재 파일</label>
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-600 font-light">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{bulletin.title}.pdf</span>
                </div>
                <button onClick={handleDeleteExistingFile} disabled={deletingFile}
                  className="ml-3 text-xs text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-40 shrink-0">
                  {deletingFile ? '삭제 중...' : '삭제'}
                </button>
              </div>
              <p className="text-xs text-slate-400">새 파일을 업로드하면 기존 파일이 교체됩니다</p>
            </div>
          )}
          {/* 새 파일 업로드 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 tracking-wide">
              {hasExistingFile ? '새 파일로 교체 (선택)' : '주보 파일'}
              <span className="text-xs text-slate-500 ml-2">PDF · 최대 10MB</span>
            </label>
            <PdfFileInput file={file} onChange={handleFileChange} onClear={() => setFile(null)} />
          </div>
          {/* 내용 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 tracking-wide">내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              rows={6} placeholder="주보 내용을 입력하세요 (선택)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none transition-all font-light resize-none" />
          </div>
          {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 font-light text-sm">{error}</div>}
        </div>
        <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
          <button onClick={onClose} className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">취소</button>
          <button onClick={handleSave} disabled={saving}
            className="px-8 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-medium transition-all disabled:opacity-60">
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

const DeleteModal = ({ title, onClose, onConfirm, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white max-w-md w-full shadow-2xl">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-medium text-slate-900">주보 삭제</h3>
            <p className="text-sm text-slate-500 mt-0.5 font-light">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>
        <p className="text-slate-600 font-light mb-2">다음 주보를 삭제하시겠습니까?</p>
        <p className="font-medium text-slate-900 bg-slate-50 px-4 py-3">{title}</p>
      </div>
      <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-200">
        <button onClick={onClose} className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">취소</button>
        <button onClick={onConfirm} disabled={deleting}
          className="px-8 py-2.5 bg-red-600 text-white hover:bg-red-700 font-medium transition-all disabled:opacity-60">
          {deleting ? '삭제 중...' : '삭제하기'}
        </button>
      </div>
    </div>
  </div>
)

const Thumbnail = ({ url }) => {
  if (url) {
    return (
      <div className="w-16 h-20 bg-cover bg-center border border-slate-200 flex-shrink-0"
        style={{ backgroundImage: `url(${url})` }} />
    )
  }
  return (
    <div className="w-16 h-20 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-200 flex-shrink-0">
      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  )
}

const BulletinListPage = () => {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const isAdmin = isAdminFn()
  const canWrite = isAdminOrOperatorFn()
  const userId = getUserId()

  const [page,         setPage]         = useState(0)
  const [keyword,      setKeyword]      = useState('')
  const [inputVal,     setInputVal]     = useState('')
  const [writeOpen,    setWriteOpen]    = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['bulletins', page, keyword],
    queryFn:  () => getBulletins({ page, size: 10, keyword }),
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

  return (
    <main>
      <PageHero
        eyebrow="Weekly Bulletin"
        title="주보"
        subtitle="주간 예배 및 교회 소식을 확인하세요"
        bgImage="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=80&auto=format&fit=crop"
      >
        {canWrite && (
          <Button variant="primary" size="sm" onClick={() => setWriteOpen(true)}>
            + 새 주보 등록
          </Button>
        )}
      </PageHero>

      <section className="py-8 bg-white px-6 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="flex-1 px-4 py-3 border border-slate-300 focus:border-slate-900 focus:outline-none transition text-base" />
            <button type="submit"
              className="px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 transition font-medium">검색</button>
          </form>
        </div>
      </section>

      <section className="py-16 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          {isLoading && (
            <div className="space-y-0 border-t border-slate-200">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          )}
          {isError && <div className="text-center py-20 text-red-500">주보 목록을 불러올 수 없습니다.</div>}
          {!isLoading && !isError && bulletins.length === 0 && (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-500 font-light">등록된 주보가 없습니다.</p>
            </div>
          )}
          {!isLoading && !isError && bulletins.length > 0 && (
            <>
              <div className="hidden md:grid grid-cols-12 gap-4 py-4 px-4 border-b-2 border-slate-900 text-base font-medium text-slate-700">
                <div className="col-span-1 text-center">썸네일</div>
                <div className={canWrite ? 'col-span-6' : 'col-span-7'}>제목</div>
                <div className="col-span-2 text-center">작성일</div>
                <div className="col-span-1 text-center">조회수</div>
                {canWrite && <div className="col-span-2 text-center">관리</div>}
              </div>

              {bulletins.map((bulletin) => (
                <div key={bulletin.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 py-5 px-4 border-b border-slate-200 hover:bg-slate-50 transition-all duration-200 items-center">
                  <div className="col-span-1 flex items-center justify-center">
                    <button onClick={() => navigate(`/bulletin/${bulletin.id}`)}>
                      <Thumbnail url={bulletin.thumbnailUrl} />
                    </button>
                  </div>
                  <div className={`col-span-1 ${canWrite ? 'md:col-span-6' : 'md:col-span-7'}`}>
                    <button onClick={() => navigate(`/bulletin/${bulletin.id}`)}
                      className="text-base md:text-lg hover:underline hover:text-blue-600 transition-colors text-slate-700 font-light text-left">
                      {bulletin.title}
                    </button>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-center md:justify-center">
                    <span className="text-sm md:text-base text-slate-400">{formatDate(bulletin.createdAt)}</span>
                  </div>
                  <div className="col-span-1 md:col-span-1 flex items-center md:justify-center">
                    <span className="text-sm md:text-base text-slate-400 font-light">{bulletin.viewCount}</span>
                  </div>
                  {canWrite && (isAdmin || bulletin.authorId === userId) && (
                    <div className="col-span-1 md:col-span-2 flex items-center justify-end md:justify-center gap-2">
                      <button onClick={() => setEditTarget(bulletin)}
                        className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-all duration-200" title="수정">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteTarget({ id: bulletin.id, title: bulletin.title })}
                        className="p-2 bg-slate-100 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200" title="삭제">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {totalElements > 10 && (
                <div className="flex justify-center mt-12">
                  <nav className="flex items-center gap-2">
                    <button onClick={() => goPage(currentPage - 1)} disabled={currentPage === 0}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i} onClick={() => goPage(i)}
                        className={`px-4 py-2 transition font-light ${i === currentPage ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                        {i + 1}
                      </button>
                    ))}
                    <button onClick={() => goPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
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
    </main>
  )
}

export default BulletinListPage
