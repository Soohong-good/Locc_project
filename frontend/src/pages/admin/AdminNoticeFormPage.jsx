import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotice, createNotice, updateNotice, uploadNoticeImage } from '@/api/notices'
import useQuillEditor from '@/hooks/useQuillEditor.jsx'
import { getErrorMessage } from '@/lib/apiError'
import toast from '@/utils/toast'

/**
 * 관리자 공지사항 생성·수정 폼 (통합)
 * - /admin/notices/new     → 생성 모드
 * - /admin/notices/:id/edit → 수정 모드
 */
const AdminNoticeFormPage = () => {
  const { id } = useParams()
  const isEdit  = Boolean(id)
  const navigate      = useNavigate()
  const queryClient   = useQueryClient()

  const [title,    setTitle]    = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [files,    setFiles]    = useState([])
  const [content,  setContent]  = useState('')

  // ── 수정 모드: 기존 데이터 로드 ──
  const { data: detail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['notices', id],
    queryFn: () => getNotice(id),
    enabled: isEdit,
  })

  // v5 호환: 데이터 로드 후 폼 초기값 세팅
  useEffect(() => {
    if (detail) {
      setTitle(detail.title ?? '')
      setIsPinned(detail.isPinned ?? false)
      setContent(detail.content ?? '')
    }
  }, [detail])

  // ── Quill 에디터 ──
  const handleUpload = useCallback((file) => uploadNoticeImage(file), [])
  const { containerRef, getHTML } = useQuillEditor({
    initialValue: content,
    onChange: setContent,
    onImageUpload: handleUpload,
  })

  // ── 뮤테이션 ──
  const saveMutation = useMutation({
    mutationFn: (formData) =>
      isEdit ? updateNotice({ id, formData }) : createNotice(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notices'] })
      queryClient.invalidateQueries({ queryKey: ['notices'] })
      navigate('/admin/notices')
    },
  })

  // ── 제출 ──
  const handleSubmit = (e) => {
    e.preventDefault()
    const html = getHTML()
    if (!title.trim()) return toast.error('제목을 입력해주세요.')
    if (!html)          return toast.error('내용을 입력해주세요.')

    const formData = new FormData()
    formData.append('title',    title.trim())
    formData.append('content',  html)
    formData.append('isPinned', isPinned)
    files.forEach((f) => formData.append('files', f))
    saveMutation.mutate(formData)
  }

  const handleFileChange = (e) => {
    setFiles((prev) => [...prev, ...Array.from(e.target.files)])
    e.target.value = ''
  }
  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  if (isEdit && isDetailLoading) return (
    <div className="p-8 max-w-3xl space-y-6">
      <div className="skeleton-shimmer h-7 w-40 rounded mb-8" />
      <div className="skeleton-shimmer h-10 w-full rounded" />
      <div className="skeleton-shimmer h-64 w-full rounded" />
    </div>
  )

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-900 mb-8">
        {isEdit ? '공지사항 수정' : '공지사항 등록'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            placeholder="공지사항 제목을 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 고정 여부 */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPinned"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="w-4 h-4 accent-blue-600"
          />
          <label htmlFor="isPinned" className="text-sm text-gray-700">공지사항 상단 고정</label>
        </div>

        {/* 내용 (Quill) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            내용 <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div ref={containerRef} style={{ minHeight: '300px' }} className="text-sm" />
          </div>
        </div>

        {/* 첨부파일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">첨부파일</label>
          <label className="flex items-center gap-3 w-full border border-dashed border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span className="text-sm text-gray-500">파일 선택하기</span>
            <span className="ml-auto text-xs text-gray-400 shrink-0">PDF, HWP, JPG, PNG · 최대 10MB</span>
            <input type="file" multiple onChange={handleFileChange} className="hidden" />
          </label>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1">
              {files.map((f, idx) => (
                <li key={idx} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded px-3 py-1.5">
                  <span className="truncate">{f.name}</span>
                  <button type="button" onClick={() => removeFile(idx)} className="ml-2 text-gray-400 hover:text-red-500 shrink-0">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 에러 */}
        {saveMutation.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
            {getErrorMessage(saveMutation.error, '저장 중 오류가 발생했습니다.')}
          </p>
        )}

        {/* 버튼 */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            {saveMutation.isPending ? '저장 중...' : isEdit ? '수정 완료' : '등록'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/notices')}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminNoticeFormPage
