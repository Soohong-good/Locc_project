import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from '@/utils/toast'
import {
  getPraiseSheet, increasePraiseSheetViews, togglePraiseSheetPin,
  updatePraiseSheet, deletePraiseSheet, uploadPraiseSheetImage,
} from '@/api/praiseSheets'
import { deleteFile, downloadFile } from '@/api/files'
import useAuthStore from '@/stores/authStore'
import useQuillEditor from '@/hooks/useQuillEditor.jsx'
import { SkeletonRow } from '@/components/ui/SkeletonCard'

const QUILL_STYLE = `
  .ql-tooltip { display: none !important; }
  .ql-container { min-height: 240px; font-size: 16px; border-color: #e2e8f0 !important; }
  .ql-editor    { min-height: 240px; background-color: #f8fafc; font-family: inherit; }
  .ql-editor:focus { background-color: #fff; }
  .ql-toolbar   { background-color: #fff; border-color: #e2e8f0 !important; }
  .ql-editor a  { color: #2563eb !important; text-decoration: underline !important; }
`

const formatDate = (dt) => {
  if (!dt) return ''
  const d = new Date(dt)
  return `${d.getFullYear()}. ${String(d.getMonth()+1).padStart(2,'0')}. ${String(d.getDate()).padStart(2,'0')}`
}

const EditModal = ({ sheet, onClose, onSaved }) => {
  const [title, setTitle] = useState(sheet.title ?? '')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [existingAttachments, setExistingAttachments] = useState(sheet.attachments ?? [])
  const [deletingFileId, setDeletingFileId] = useState(null)

  const { containerRef, getHTML, setHTML, LinkTooltip } = useQuillEditor({ onImageUpload: uploadPraiseSheetImage })

  useEffect(() => {
    if (!sheet.content) return
    const t = setTimeout(() => setHTML(sheet.content), 150)
    return () => clearTimeout(t)
  }, [sheet.content, setHTML])

  const handleDeleteAttachment = async (fileId) => {
    if (!confirm('이 첨부파일을 삭제하시겠습니까?')) return
    setDeletingFileId(fileId)
    try {
      await deleteFile(fileId)
      setExistingAttachments((prev) => prev.filter((a) => a.id !== fileId))
    } catch { toast.error('파일 삭제에 실패했습니다.') }
    finally { setDeletingFileId(null) }
  }

  const handleSave = async () => {
    setError('')
    const content = getHTML()
    if (!title.trim()) return setError('제목을 입력해주세요.')
    const fd = new FormData()
    fd.append('title', title.trim())
    fd.append('content', content || '')
    fd.append('isPinned', String(sheet.isPinned ?? false))
    files.forEach((f) => fd.append('files', f))
    setSaving(true)
    try {
      await updatePraiseSheet({ id: sheet.id, formData: fd })
      onSaved()
    } catch (e) {
      setError(e?.response?.data?.message ?? '수정에 실패했습니다.')
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
              <h2 className="text-2xl font-light text-slate-900 tracking-tight">찬양악보 수정</h2>
              <p className="text-sm text-slate-500 mt-1 font-light">내용을 수정해주세요</p>
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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none transition-all font-light" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">내용</label>
              <div ref={containerRef} />
            </div>
            {existingAttachments.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">기존 첨부파일</label>
                <ul className="space-y-2">
                  {existingAttachments.map((att) => (
                    <li key={att.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200">
                      <span className="text-sm text-slate-600 font-light truncate">{att.originalFileName ?? att.originalFilename ?? att.fileName}</span>
                      <button onClick={() => handleDeleteAttachment(att.id)} disabled={deletingFileId === att.id}
                        className="ml-3 text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-40 shrink-0">
                        {deletingFileId === att.id ? '삭제 중...' : '삭제'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 tracking-wide">
                새 파일 첨부 <span className="text-xs text-slate-500 font-normal ml-1">(PDF, HWP, JPG, PNG · 최대 20MB)</span>
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
                  onChange={(e) => { setFiles(Array.from(e.target.files)); e.target.value = '' }} className="hidden" />
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
              {saving ? '저장 중...' : '저장'}
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
    <div className="relative bg-white w-full max-w-md shadow-2xl">
      <div className="px-8 py-6 border-b border-slate-100">
        <h2 className="text-xl font-medium text-slate-900">찬양악보 삭제</h2>
        <p className="text-sm text-slate-500 mt-0.5 font-light">이 작업은 되돌릴 수 없습니다</p>
      </div>
      <div className="px-8 py-6">
        <p className="font-medium text-slate-900 bg-slate-50 px-4 py-3 rounded">{title}</p>
      </div>
      <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
        <button onClick={onClose} className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium">취소</button>
        <button onClick={onConfirm} disabled={deleting}
          className="px-8 py-2.5 bg-red-600 text-white hover:bg-red-700 font-medium disabled:opacity-60">
          {deleting ? '삭제 중...' : '삭제하기'}
        </button>
      </div>
    </div>
  </div>
)

const PraiseSheetDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { canWrite: canWriteFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const isAdmin  = isAdminFn()
  const canWrite = canWriteFn('PRAISE_SHEET')
  const userId   = getUserId()

  const [editOpen,   setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: sheet, isLoading, isError } = useQuery({
    queryKey: ['praise-sheets', id],
    queryFn:  () => getPraiseSheet(id),
  })

  useEffect(() => {
    if (id) increasePraiseSheetViews(id).catch(() => {})
  }, [id])

  const pinMutation = useMutation({
    mutationFn: () => togglePraiseSheetPin(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['praise-sheets', id] }),
    onError:    (e) => toast.error(e?.response?.data?.message ?? '고정 변경에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deletePraiseSheet(id),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['praise-sheets'] }); navigate('/praise-sheets') },
    onError: (e) => toast.error(e?.response?.data?.message ?? '삭제에 실패했습니다.'),
  })

  const deleteAttachment = async (fileId) => {
    if (!confirm('이 첨부파일을 삭제하시겠습니까?')) return
    try {
      await deleteFile(fileId)
      queryClient.invalidateQueries({ queryKey: ['praise-sheets', id] })
    } catch (e) { toast.error(e?.response?.data?.message ?? '파일 삭제에 실패했습니다.') }
  }

  if (isLoading) return (
    <main>
      <section className="pt-page pb-12 bg-slate-900 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="skeleton-shimmer h-3 w-24 mb-12 opacity-30 rounded" />
          <div className="skeleton-shimmer h-10 w-3/4 mb-4 opacity-30 rounded" />
        </div>
      </section>
      <section className="py-24 bg-white px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </section>
    </main>
  )
  if (isError) return (
    <main className="pt-page pb-16 px-6">
      <div className="max-w-4xl mx-auto text-red-500">찬양악보를 불러올 수 없습니다.</div>
    </main>
  )

  return (
    <main>
      <section className="pt-page pb-12 bg-slate-900 px-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate('/praise-sheets')}
            className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-12 group transition-all duration-300">
            <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-light tracking-wide">목록으로</span>
          </button>

          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-4">Praise Sheet</p>
            <h1 className="text-4xl md:text-5xl font-light text-white leading-[1.3] tracking-tight mb-8">{sheet.title}</h1>
            <div className="h-px w-16 bg-slate-600 mb-8" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 text-slate-400 font-light">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(sheet.createdAt)}</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{sheet.viewCount}</span>
              </div>
            </div>
            {canWrite && (isAdmin || sheet.authorId === userId) && (
              <div className="flex gap-3">
                {isAdmin && (
                  <button onClick={() => pinMutation.mutate()} disabled={pinMutation.isPending}
                    className={`px-4 py-2 border-2 transition font-medium flex items-center gap-2 disabled:opacity-50
                      ${sheet.isPinned ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-400 text-slate-200 hover:border-white hover:text-white'}`}>
                    {sheet.isPinned ? '고정 해제' : '최상단 고정'}
                  </button>
                )}
                <button onClick={() => setEditOpen(true)}
                  className="px-4 py-2 border-2 border-slate-400 text-slate-200 hover:border-white hover:text-white transition font-medium">
                  수정
                </button>
                <button onClick={() => setDeleteOpen(true)}
                  className="px-4 py-2 border-2 border-red-400 text-red-400 hover:border-red-300 hover:text-red-300 transition font-medium">
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white px-6">
        <article className="max-w-4xl mx-auto">
          <div className="prose prose-lg prose-slate max-w-none">
            <div className="text-slate-700 leading-[1.9] font-light text-lg"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sheet.content ?? '') }} />
          </div>

          {sheet.attachments && sheet.attachments.length > 0 && (
            <div className="mt-20 pt-12 border-t border-slate-200">
              <h3 className="text-sm tracking-[0.2em] text-eyebrow uppercase mb-6">Attachments</h3>
              <div className="space-y-3">
                {sheet.attachments.map((file) => (
                  <div key={file.id} className="flex items-center gap-4 p-5 bg-slate-50 hover:bg-slate-100 transition-all duration-300 group">
                    <div className="w-12 h-12 flex items-center justify-center bg-white group-hover:bg-slate-900 transition-all duration-300">
                      <svg className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-light text-slate-900 truncate">{file.originalFileName}</p>
                      <p className="text-sm text-slate-500 font-light">{file.fileSize ? `${(file.fileSize / 1024).toFixed(2)} KB` : ''}</p>
                    </div>
                    <button onClick={() => downloadFile(file.id, file.originalFileName)}
                      className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      다운로드
                    </button>
                    {canWrite && (isAdmin || sheet.authorId === userId) && (
                      <button onClick={() => deleteAttachment(file.id)}
                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-all duration-300">
                        삭제
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="py-12 bg-slate-50 px-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate('/praise-sheets')}
            className="group inline-flex items-center px-8 py-4 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 font-light tracking-wide">
            <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            목록으로 돌아가기
          </button>
        </div>
      </section>

      {editOpen && (
        <EditModal key={`edit-${sheet.id}`} sheet={sheet} onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false)
            queryClient.invalidateQueries({ queryKey: ['praise-sheets', id] })
            queryClient.invalidateQueries({ queryKey: ['praise-sheets'] })
          }} />
      )}
      {deleteOpen && (
        <DeleteModal title={sheet.title} onClose={() => setDeleteOpen(false)}
          onConfirm={() => deleteMutation.mutate()} deleting={deleteMutation.isPending} />
      )}
    </main>
  )
}

export default PraiseSheetDetailPage
