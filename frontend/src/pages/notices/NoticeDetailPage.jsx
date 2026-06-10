import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
                    for (const file of selected) {
                      const ext = '.' + file.name.split('.').pop().toLowerCase()
                      const typeOk = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTS.includes(ext)
                      if (!typeOk) { toast.error(`허용되지 않는 파일 형식입니다: ${file.name}`); e.target.value = ''; return }
                      if (file.size > 10 * 1024 * 1024) { toast.error(`파일 크기는 10MB 이하여야 합니다: ${file.name}`); e.target.value = ''; return }
                    }
                    setFiles(selected)
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
    <main>
      <section className="pt-page pb-12 bg-slate-900 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="skeleton-shimmer h-3 w-24 mb-12 opacity-30 rounded" />
          <div className="skeleton-shimmer h-4 w-20 mb-4 opacity-30 rounded" />
          <div className="skeleton-shimmer h-10 w-3/4 mb-4 opacity-30 rounded" />
          <div className="skeleton-shimmer h-px w-16 mb-8 opacity-30" />
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
      <div className="max-w-4xl mx-auto text-red-500">공지사항을 불러올 수 없습니다.</div>
    </main>
  )

  return (
    <main>
      {/* Hero — 다크 패턴 통일 */}
      <section className="pt-page pb-12 bg-slate-900 px-6">
        <div className="max-w-4xl mx-auto">

          {/* 목록으로 — 원본 href /church/notice */}
          <button
            onClick={() => navigate('/notices')}
            className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-12 group transition-all duration-300"
          >
            <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-light tracking-wide">목록으로</span>
          </button>

          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-4">Notice</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-[1.3] tracking-tight mb-8">
              {notice.title}
            </h1>
            <div className="h-px w-16 bg-slate-600 mb-8" />
          </div>

          {/* 메타 정보 */}
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 text-slate-400 font-light">
              {/* 날짜 — 원본 yyyy. MM. dd */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(notice.createdAt)}</span>
              </div>
              <span className="text-slate-600">•</span>
              {/* 조회수 */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{notice.viewCount}</span>
              </div>
            </div>

            {/* 관리자 버튼 — 고정은 ADMIN만, 수정/삭제는 ADMIN 또는 본인 */}
            {canWrite && (isAdmin || notice.authorId === userId) && (
              <div className="flex gap-3">
                {/* 고정 토글 — ADMIN 전용 */}
                {isAdmin && (
                  <button
                    onClick={() => pinMutation.mutate()}
                    disabled={pinMutation.isPending}
                    className={`px-4 py-2 border-2 transition font-medium flex items-center gap-2 disabled:opacity-50
                      ${notice.isPinned
                        ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                        : 'border-slate-400 text-slate-200 hover:border-white hover:text-white'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span>{notice.isPinned ? '고정 해제' : '최상단 고정'}</span>
                  </button>
                )}
                <button
                  onClick={() => setEditOpen(true)}
                  className="px-4 py-2 border-2 border-slate-400 text-slate-200 hover:border-white hover:text-white transition font-medium"
                >
                  수정
                </button>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="px-4 py-2 border-2 border-red-400 text-red-400 hover:border-red-300 hover:text-red-300 transition font-medium"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 본문 — 원본 th:utext */}
      <section className="py-24 bg-white px-6">
        <article className="max-w-4xl mx-auto">
          <div className="prose prose-lg prose-slate max-w-none">
            <div
              className="ql-editor ql-output text-slate-700 leading-[1.9] font-light text-lg"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notice.content ?? '' )}}
            />
          </div>

          {/* 첨부파일 — 원본 구조 1:1 */}
          {notice.attachments && notice.attachments.length > 0 && (
            <div className="mt-20 pt-12 border-t border-slate-200">
              <h3 className="text-sm tracking-[0.2em] text-eyebrow uppercase mb-6">Attachments</h3>
              <div className="space-y-3">
                {notice.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-5 bg-slate-50 hover:bg-slate-100 transition-all duration-300 group"
                  >
                    {/* 파일 아이콘 */}
                    <div className="w-12 h-12 flex items-center justify-center bg-white group-hover:bg-slate-900 transition-all duration-300">
                      <svg className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors duration-300"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {/* 파일 정보 */}
                    <div className="flex-1 min-w-0">
                      <p className="font-light text-slate-900 truncate">{file.originalFileName}</p>
                      <p className="text-sm text-slate-500 font-light">
                        {file.fileSize ? `${(file.fileSize / 1024).toFixed(2)} KB` : ''}
                      </p>
                    </div>
                    {/* 다운로드 — <a href> 방식은 Authorization 헤더 미전송으로 401 발생 */}
                    <button
                      onClick={() => downloadFile(file.id, file.originalFileName)}
                      className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      다운로드
                    </button>
                    {/* 파일 삭제 — ADMIN 또는 본인 */}
                    {canWrite && (isAdmin || notice.authorId === userId) && (
                      <button
                        onClick={() => deleteAttachment(file.id)}
                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-all duration-300"
                      >
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

      {/* 하단 목록으로 — 원본 Navigation 섹션 */}
      <section className="py-12 bg-slate-50 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/notices')}
            className="group inline-flex items-center px-8 py-4 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 font-light tracking-wide"
          >
            <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            목록으로 돌아가기
          </button>
        </div>
      </section>

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
