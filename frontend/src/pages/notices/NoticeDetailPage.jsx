import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  List, DownloadSimple, ArrowUp, ArrowDown, FileText, FilePdf, FileDoc,
  PushPin, PencilSimple, Trash, User, CalendarBlank, Folder, Eye,
} from '@phosphor-icons/react'
import toast from '@/utils/toast'
import {
  getNotice, increaseNoticeViews, toggleNoticePin,
  updateNotice, deleteNotice, uploadNoticeImage,
} from '@/api/notices'
import { deleteFile, downloadFile } from '@/api/files'
import useAuthStore from '@/stores/authStore'
import useQuillEditor from '@/hooks/useQuillEditor.jsx'
import { SkeletonRow } from '@/components/ui/SkeletonCard'

/* ── Quill CSS ───────────────────────────────────────────────────── */
const QUILL_STYLE = `
  .ql-tooltip { display: none !important; }
  .ql-container { min-height: 240px; font-size: 16px; border-color: #e2e8f0 !important; }
  .ql-container .ql-editor    { min-height: 240px; background-color: #f8fafc; font-family: inherit; }
  .ql-container .ql-editor:focus { background-color: #fff; }
  .ql-toolbar   { background-color: #fff; border-color: #e2e8f0 !important; }
  .ql-container .ql-editor a  { color: #2563eb !important; text-decoration: underline !important; }
`

/* ── 날짜 포맷: 원본 yyyy. MM. dd ───────────────────────────────── */
const formatDate = (dt) => {
  if (!dt) return ''
  const d = new Date(dt)
  const y  = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}. ${mm}. ${dd}`
}

/* ── 수정 모달 (detail.html editModal 1:1) ───────────────────────── */
const EditModal = ({ notice, onClose, onSaved }) => {
  const [title, setTitle]   = useState(notice.title ?? '')
  const [files, setFiles]   = useState([])   // 새로 추가할 파일
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)
  // 기존 첨부파일 상태 (수정 중 개별 삭제 가능)
  const [existingAttachments, setExistingAttachments] = useState(notice.attachments ?? [])
  const [deletingFileId, setDeletingFileId] = useState(null)

  const { containerRef, getHTML, setHTML, LinkTooltip } = useQuillEditor({
    onImageUpload: uploadNoticeImage,
  })

  /* 기존 내용 주입 */
  useEffect(() => {
    if (!notice.content) return
    const t = setTimeout(() => setHTML(notice.content), 150)
    return () => clearTimeout(t)
  }, [notice.content, setHTML])

  /* 기존 첨부파일 삭제 */
  const handleDeleteAttachment = async (fileId) => {
    if (!confirm('이 첨부파일을 삭제하시겠습니까?')) return
    setDeletingFileId(fileId)
    try {
      await deleteFile(fileId)
      setExistingAttachments((prev) => prev.filter((a) => a.id !== fileId))
    } catch {
      toast.error('파일 삭제에 실패했습니다.')
    } finally {
      setDeletingFileId(null)
    }
  }

  const handleSave = async () => {
    setError('')
    const content = getHTML()
    if (!title.trim()) return setError('제목을 입력해주세요.')
    if (!content)      return setError('내용을 입력해주세요.')

    const fd = new FormData()
    fd.append('title',    title.trim())
    fd.append('content',  content)
    fd.append('isPinned', String(notice.isPinned ?? false))
    files.forEach((f) => fd.append('files', f))

    setSaving(true)
    try {
      await updateNotice({ id: notice.id, formData: fd })
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

          {/* 헤더 */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-light text-slate-900 tracking-tight">공지사항 수정</h2>
              <p className="text-sm text-slate-500 mt-1 font-light">공지사항 정보를 수정해주세요</p>
            </div>
            <button onClick={onClose}
              className="text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-50 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {/* 제목 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 tracking-wide">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none transition-all font-light"
              />
            </div>

            {/* 내용 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 tracking-wide">
                내용 <span className="text-red-500">*</span>
              </label>
              <div ref={containerRef} />
            </div>

            {/* 기존 첨부파일 */}
            {existingAttachments.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 tracking-wide">기존 첨부파일</label>
                <ul className="space-y-2">
                  {existingAttachments.map((att) => (
                    <li key={att.id}
                      className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-light min-w-0">
                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{att.originalFileName ?? att.originalFilename ?? att.fileName}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteAttachment(att.id)}
                        disabled={deletingFileId === att.id}
                        className="ml-3 text-xs text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-40 shrink-0"
                      >
                        {deletingFileId === att.id ? '삭제 중...' : '삭제'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 새 파일 추가 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 tracking-wide">
                새 파일 첨부 <span className="text-xs text-slate-500">(PDF, JPG, PNG / 최대 10MB)</span>
              </label>
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 hover:border-slate-400 transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">새 파일 추가</p>
                  <p className="text-xs text-slate-400">PDF, HWP, JPG, PNG · 최대 10MB</p>
                </div>
                <input
                  type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.hwp"
                  onChange={(e) => {
                    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
                    const ALLOWED_EXTS  = ['.pdf', '.jpg', '.jpeg', '.png', '.hwp']
                    const selected = Array.from(e.target.files)
                    const valid = []
                    for (const file of selected) {
                      const ext = '.' + file.name.split('.').pop().toLowerCase()
                      const typeOk = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTS.includes(ext)
                      if (!typeOk) { toast.error(`허용되지 않는 파일 형식입니다: ${file.name}`); continue }
                      if (file.size > 10 * 1024 * 1024) { toast.error(`파일 크기는 10MB 이하여야 합니다: ${file.name}`); continue }
                      valid.push(file)
                    }
                    setFiles(valid)
                    e.target.value = ''
                  }}
                  className="hidden"
                />
              </label>
              {files.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2">
                      <span className="truncate">{f.name}</span>
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

          {/* 푸터 */}
          <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
            <button onClick={onClose}
              className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
              취소
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-8 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-medium transition-all disabled:opacity-60">
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
      <LinkTooltip />
    </>
  )
}


/* ── 삭제 확인 모달 (detail.html deleteModal 1:1) ────────────────── */
const DeleteModal = ({ title, onClose, onConfirm, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white w-full max-w-md overflow-hidden shadow-2xl">
      <div className="px-8 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-medium text-slate-900">공지사항 삭제</h2>
            <p className="text-sm text-slate-500 mt-0.5 font-light">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>
      </div>
      <div className="px-8 py-6">
        <p className="text-slate-600 mb-3 font-light">이 공지사항을 삭제하시겠습니까?</p>
        <p className="font-medium text-slate-900 bg-slate-50 px-4 py-3 rounded">{title}</p>
      </div>
      <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
        <button onClick={onClose}
          className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
          취소
        </button>
        <button onClick={onConfirm} disabled={deleting}
          className="px-8 py-2.5 bg-red-600 text-white hover:bg-red-700 font-medium transition-all disabled:opacity-60">
          {deleting ? '삭제 중...' : '삭제하기'}
        </button>
      </div>
    </div>
  </div>
)

/* ── 메인 컴포넌트 ──────────────────────────────────────────────── */
const NoticeDetailPage = () => {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const queryClient = useQueryClient()

  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const isAdmin = isAdminFn()
  const canWrite = isAdminOrOperatorFn()
  const userId = getUserId()

  const [editOpen,   setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: notice, isLoading, isError } = useQuery({
    queryKey: ['notices', id],
    queryFn:  () => getNotice(id),
  })

  /* 조회수 증가 — 최초 1회 (원본: POST /api/notices/{id}/views) */
  useEffect(() => {
    if (id) increaseNoticeViews(id).catch(() => {})
  }, [id])

  /* 고정 토글 — 원본 toggleDetailPin() */
  const pinMutation = useMutation({
    mutationFn: () => toggleNoticePin(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['notices', id] }),
    onError:    (e) => toast.error(e?.response?.data?.message ?? '고정 변경에 실패했습니다.'),
  })

  /* 삭제 — 원본 deleteNotice() → /notices 이동 */
  const deleteMutation = useMutation({
    mutationFn: () => deleteNotice(id),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
      navigate('/notices')
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? '삭제에 실패했습니다.'),
  })

  /* 첨부파일 삭제 — 원본 deleteAttachmentFromDetail(attachmentId) */
  const deleteAttachment = async (fileId) => {
    if (!confirm('이 첨부파일을 삭제하시겠습니까?')) return
    try {
      await deleteFile(fileId)
      queryClient.invalidateQueries({ queryKey: ['notices', id] })
    } catch (e) {
      toast.error(e?.response?.data?.message ?? '파일 삭제에 실패했습니다.')
    }
  }

  if (isLoading) return (
    <main className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] min-h-screen pt-20 bg-[#FAF9F6]">
      <div className="max-w-[840px] mx-auto px-6 py-16 md:py-24 space-y-4">
        <div className="skeleton-shimmer h-3 w-32 mb-6 rounded" />
        <div className="skeleton-shimmer h-10 w-3/4 mb-8 rounded" />
        {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    </main>
  )
  if (isError) return (
    <main className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] min-h-screen pt-20 px-6">
      <div className="text-red-500">공지사항을 불러올 수 없습니다.</div>
    </main>
  )

  const fileIcon = (fileName) => {
    const ext = (fileName?.split('.').pop() || '').toLowerCase()
    if (ext === 'pdf') return FilePdf
    if (['doc', 'docx', 'hwp'].includes(ext)) return FileDoc
    return FileText
  }

  return (
    <main className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] min-h-screen pt-20 bg-[#FAF9F6]">
      <article className="w-full max-w-[840px] mx-auto px-6 py-16 md:py-24">

        {/* 관리자 버튼 */}
        {canWrite && (isAdmin || notice.authorId === userId) && (
          <div className="flex justify-end gap-5 font-mono text-[10px] text-[#737373] mb-8 tracking-[0.1em] uppercase">
            {isAdmin && (
              <button
                onClick={() => pinMutation.mutate()}
                disabled={pinMutation.isPending}
                className={`flex items-center gap-1 transition-colors disabled:opacity-50 ${notice.isPinned ? 'text-amber-600' : 'hover:text-[#171717]'}`}
              >
                <PushPin size={14} weight={notice.isPinned ? 'fill' : 'regular'} />
                <span>{notice.isPinned ? '고정 해제' : '상단고정'}</span>
              </button>
            )}
            <button onClick={() => setEditOpen(true)} className="flex items-center gap-1 hover:text-[#171717] transition-colors">
              <PencilSimple size={14} />
              <span>수정</span>
            </button>
            <button onClick={() => setDeleteOpen(true)} className="flex items-center gap-1 hover:text-red-600 transition-colors">
              <Trash size={14} />
              <span>삭제</span>
            </button>
          </div>
        )}

        {/* 헤더 */}
        <header className="mb-12">
          <div className="font-mono text-[#737373] text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#171717] block" />
            NOTICE
          </div>
          <h1 className="text-3xl md:text-[2.75rem] font-bold text-[#171717] leading-[1.3] mb-8 break-keep tracking-tight">
            {notice.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-[11px] font-mono text-[#737373] tracking-widest uppercase">
            <span className="flex items-center gap-1.5"><User size={14} /> {notice.authorName}</span>
            <span className="w-px h-3 bg-[#E5E5E5] block" />
            <span className="flex items-center gap-1.5"><CalendarBlank size={14} /> {formatDate(notice.createdAt)}</span>
            <span className="w-px h-3 bg-[#E5E5E5] block" />
            <span className="flex items-center gap-1.5"><Folder size={14} /> 공지사항</span>
            <span className="w-px h-3 bg-[#E5E5E5] block" />
            <span className="flex items-center gap-1.5"><Eye size={14} /> {notice.viewCount}</span>
          </div>
        </header>

        <hr className="border-t border-[#E5E5E5] mb-16" />

        {/* 본문 */}
        <div className="prose prose-lg max-w-none text-base md:text-lg leading-[1.8] text-[#2C2C2C] font-light tracking-[-0.01em] break-keep [&_p]:mb-8 min-h-[80px]">
          <div
            className="ql-editor ql-output"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notice.content ?? '') }}
          />
        </div>

        {/* 첨부파일 */}
        {notice.attachments && notice.attachments.length > 0 && (
          <div className="mt-24">
            <div className="flex items-end justify-between border-b border-[#171717] pb-3 mb-2">
              <h4 className="font-mono text-[11px] font-bold text-[#171717] tracking-widest uppercase">Attachments</h4>
              <span className="font-mono text-[10px] text-[#737373] tracking-widest">{notice.attachments.length} FILES</span>
            </div>
            <ul className="flex flex-col">
              {notice.attachments.map((file) => {
                const Icon = fileIcon(file.originalFileName)
                const ext = (file.originalFileName?.split('.').pop() || 'FILE').toUpperCase()
                return (
                  <li key={file.id}>
                    <div className="flex items-center gap-4 py-4 border-b border-[#E5E5E5] group hover:bg-[#F4F2EA] transition-colors px-3 -mx-3">
                      <Icon size={24} className="text-[#737373] group-hover:text-[#171717] shrink-0" />
                      <button
                        onClick={() => downloadFile(file.id, file.originalFileName)}
                        className="flex-1 text-left text-sm md:text-base text-[#171717] truncate group-hover:underline underline-offset-4 decoration-1"
                      >
                        {file.originalFileName}
                      </button>
                      <span className="font-mono text-[10px] text-[#737373] tracking-widest uppercase shrink-0">.{ext}</span>
                      {file.fileSize && (
                        <span className="font-mono text-[10px] text-[#737373] tracking-widest shrink-0 hidden md:block w-16 text-right">
                          {(file.fileSize / 1024).toFixed(1)}KB
                        </span>
                      )}
                      <button onClick={() => downloadFile(file.id, file.originalFileName)} className="shrink-0">
                        <DownloadSimple size={18} className="text-[#737373] group-hover:text-[#171717]" />
                      </button>
                      {canWrite && (isAdmin || notice.authorId === userId) && (
                        <button
                          onClick={() => deleteAttachment(file.id)}
                          className="ml-2 text-xs text-red-500 hover:text-red-600 font-medium shrink-0"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* 이전글/다음글 */}
        <nav className="border-y border-[#E5E5E5] mt-24 flex flex-col">
          {notice.prevId ? (
            <button
              onClick={() => navigate(`/notices/${notice.prevId}`)}
              className="flex flex-col sm:flex-row sm:items-center py-6 px-3 hover:bg-[#F4F2EA] transition-colors -mx-3 gap-2 sm:gap-8 group border-b border-[#E5E5E5] text-left"
            >
              <div className="flex items-center gap-2 w-20 shrink-0">
                <ArrowUp size={14} className="text-[#737373] group-hover:text-[#171717]" />
                <span className="font-mono text-[10px] sm:text-xs text-[#737373] group-hover:text-[#171717] tracking-widest transition-colors uppercase">PREV</span>
              </div>
              <span className="text-sm sm:text-base text-[#171717] truncate flex-1 group-hover:underline underline-offset-4 decoration-1 font-medium">
                {notice.prevTitle}
              </span>
              <span className="font-mono text-[10px] text-[#737373] shrink-0 hidden sm:block tracking-widest">{formatDate(notice.prevCreatedAt)}</span>
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center py-6 px-3 -mx-3 gap-2 sm:gap-8 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2 w-20 shrink-0 opacity-40">
                <ArrowUp size={14} className="text-[#737373]" />
                <span className="font-mono text-[10px] sm:text-xs text-[#737373] tracking-widest uppercase">PREV</span>
              </div>
              <span className="text-sm sm:text-base text-[#737373] flex-1">이전 글이 없습니다</span>
            </div>
          )}
          {notice.nextId ? (
            <button
              onClick={() => navigate(`/notices/${notice.nextId}`)}
              className="flex flex-col sm:flex-row sm:items-center py-6 px-3 hover:bg-[#F4F2EA] transition-colors -mx-3 gap-2 sm:gap-8 group text-left"
            >
              <div className="flex items-center gap-2 w-20 shrink-0">
                <ArrowDown size={14} className="text-[#737373] group-hover:text-[#171717]" />
                <span className="font-mono text-[10px] sm:text-xs text-[#737373] group-hover:text-[#171717] tracking-widest transition-colors uppercase">NEXT</span>
              </div>
              <span className="text-sm sm:text-base text-[#171717] truncate flex-1 group-hover:underline underline-offset-4 decoration-1 font-medium">
                {notice.nextTitle}
              </span>
              <span className="font-mono text-[10px] text-[#737373] shrink-0 hidden sm:block tracking-widest">{formatDate(notice.nextCreatedAt)}</span>
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center py-6 px-3 -mx-3 gap-2 sm:gap-8">
              <div className="flex items-center gap-2 w-20 shrink-0 opacity-40">
                <ArrowDown size={14} className="text-[#737373]" />
                <span className="font-mono text-[10px] sm:text-xs text-[#737373] tracking-widest uppercase">NEXT</span>
              </div>
              <span className="text-sm sm:text-base text-[#737373] flex-1">다음 글이 없습니다</span>
            </div>
          )}
        </nav>

        {/* 목록으로 */}
        <div className="mt-20 flex justify-center pb-8">
          <button
            onClick={() => navigate('/notices')}
            className="border border-[#E5E5E5] bg-transparent text-xs font-bold tracking-[0.1em] uppercase py-5 px-16 text-[#171717] hover:bg-[#171717] hover:text-[#FAF9F6] hover:border-[#171717] transition-all duration-300 flex items-center gap-3"
          >
            <List size={18} />
            <span>목록으로 돌아가기</span>
          </button>
        </div>
      </article>

      {/* 수정 모달 */}
      {editOpen && (
        <EditModal
          key={`edit-${notice.id}`}
          notice={notice}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false)
            queryClient.invalidateQueries({ queryKey: ['notices', id] })
            queryClient.invalidateQueries({ queryKey: ['notices'] })
          }}
        />
      )}

      {/* 삭제 확인 모달 */}
      {deleteOpen && (
        <DeleteModal
          title={notice.title}
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => deleteMutation.mutate()}
          deleting={deleteMutation.isPending}
        />
      )}
    </main>
  )
}

export default NoticeDetailPage
