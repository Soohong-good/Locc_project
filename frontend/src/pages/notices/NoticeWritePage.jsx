import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createNotice, uploadNoticeImage } from '@/api/notices'
import useAuthStore from '@/stores/authStore'
import useQuillEditor from '@/hooks/useQuillEditor.jsx'
import Button from '@/components/ui/Button'
import PageHero from '@/components/ui/PageHero'
import toast from '@/utils/toast'

/* ── Quill CSS ─────────────────────────────────────────────────────── */
const QUILL_STYLE = `
  .ql-tooltip { display: none !important; }
  .ql-container { min-height: 320px; font-size: 16px; border-color: #e2e8f0 !important; }
  .ql-editor    { min-height: 320px; background-color: #f8fafc; font-family: inherit; }
  .ql-editor:focus { background-color: #fff; }
  .ql-toolbar   { background-color: #fff; border-color: #e2e8f0 !important; }
  .ql-editor a  { color: #2563eb !important; text-decoration: underline !important; }
`

/* ── 첨부파일 아이콘 ──────────────────────────────────────────────── */
const PaperclipIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
)

/* ── 메인 컴포넌트 ─────────────────────────────────────────────────── */
const NoticeWritePage = () => {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const { isAdminOrOperator: isAdminOrOperatorFn } = useAuthStore()
  const canWrite = isAdminOrOperatorFn()

  const [title, setTitle] = useState('')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  // 권한 없는 접근 차단
  useEffect(() => {
    if (!canWrite) navigate('/notices', { replace: true })
  }, [canWrite, navigate])

  const handleUpload = useCallback((file) => uploadNoticeImage(file), [])
  const { containerRef, getHTML, LinkTooltip } = useQuillEditor({
    onImageUpload: handleUpload,
  })

  const mutation = useMutation({
    mutationFn: (fd) => createNotice(fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
      navigate('/notices')
    },
    onError: (e) => setError(e?.response?.data?.message ?? '등록에 실패했습니다.'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const content = getHTML()
    if (!title.trim()) return setError('제목을 입력해주세요.')
    if (!content)      return setError('내용을 입력해주세요.')

    const fd = new FormData()
    fd.append('title',    title.trim())
    fd.append('content',  content)
    fd.append('isPinned', 'false')
    files.forEach((f) => fd.append('files', f))
    mutation.mutate(fd)
  }

  const handleFileChange = (e) => {
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
    const ALLOWED_EXTS  = ['.pdf', '.jpg', '.jpeg', '.png', '.hwp']
    const newFiles = Array.from(e.target.files)
    for (const file of newFiles) {
      const ext = '.' + file.name.split('.').pop().toLowerCase()
      const typeOk = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTS.includes(ext)
      if (!typeOk) { toast.error(`허용되지 않는 파일 형식입니다: ${file.name}`); e.target.value = ''; return }
      if (file.size > 20 * 1024 * 1024) { toast.error(`파일 크기는 20MB 이하여야 합니다: ${file.name}`); e.target.value = ''; return }
    }
    setFiles((prev) => [...prev, ...newFiles])
    e.target.value = ''
  }

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  if (!canWrite) return null

  return (
    <>
      <style>{QUILL_STYLE}</style>
      <main>
        {/* Hero */}
        <PageHero
          eyebrow="Notice"
          title="새 공지사항 작성"
          subtitle="교회 소식과 공지사항을 등록합니다"
        />

        {/* 폼 */}
        <section className="py-12 bg-white px-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* 제목 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 tracking-wide">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="공지사항 제목을 입력하세요"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200
                             focus:bg-white focus:border-slate-900 outline-none
                             transition-all font-light text-slate-900"
                />
              </div>

              {/* 내용 (Quill) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 tracking-wide">
                  내용 <span className="text-red-500">*</span>
                </label>
                <div ref={containerRef} />
              </div>

              {/* 첨부파일 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 tracking-wide">
                  첨부파일{' '}
                  <span className="text-xs text-slate-400 font-normal">
                    (PDF, HWP, JPG, PNG · 최대 20MB)
                  </span>
                </label>
                <label className="flex items-center gap-3 px-4 py-3
                                  border-2 border-dashed border-slate-200
                                  hover:border-slate-400 hover:bg-slate-50
                                  cursor-pointer transition group">
                  <div className="w-8 h-8 flex items-center justify-center
                                  bg-slate-100 group-hover:bg-slate-200
                                  flex-shrink-0 transition text-slate-500">
                    <PaperclipIcon />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">파일 추가</p>
                    <p className="text-xs text-slate-400">여러 파일을 동시에 선택할 수 있습니다</p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.hwp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {files.length > 0 && (
                  <ul className="space-y-1 mt-2">
                    {files.map((f, i) => (
                      <li key={i}
                          className="flex items-center justify-between text-sm
                                     text-slate-600 bg-slate-50 px-4 py-2
                                     border border-slate-100">
                        <span className="flex items-center gap-2 truncate">
                          <PaperclipIcon />
                          <span className="truncate">{f.name}</span>
                          <span className="text-xs text-slate-400 shrink-0">
                            ({(f.size / 1024).toFixed(0)}KB)
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="ml-3 text-slate-400 hover:text-red-500 shrink-0 transition"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 에러 */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/notices')}
                >
                  ← 목록으로
                </Button>
                <Button
                  type="submit"
                  isLoading={mutation.isPending}
                >
                  공지사항 등록
                </Button>
              </div>

            </form>
          </div>
        </section>
      </main>
      <LinkTooltip />
    </>
  )
}

export default NoticeWritePage
