import { useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSermon, createSermon, updateSermon, uploadSermonImage } from '@/api/sermons'
import useQuillEditor from '@/hooks/useQuillEditor'
import { getErrorMessage } from '@/lib/apiError'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const CATEGORIES = ['주일오전', '주일오후', '기타예배']

/**
 * 관리자 설교 생성·수정 폼 (통합)
 * - /admin/sermons/new      → 생성 모드
 * - /admin/sermons/:id/edit  → 수정 모드
 */
const AdminSermonFormPage = () => {
  const { id }  = useParams()
  const isEdit  = Boolean(id)
  const navigate      = useNavigate()
  const queryClient   = useQueryClient()

  // ── 필드 상태 ──
  const [fields, setFields] = useState({
    title:         '',
    scripture:     '',
    preacher:      '',
    category:      '주일오전',
    serviceNumber: '',
    sermonDate:    '',
    videoUrl:      '',
  })
  const [content,  setContent]  = useState('')
  const [files,    setFiles]    = useState([])
  const [initDone, setInitDone] = useState(false)

  const set = (key) => (e) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }))

  // ── 수정 모드: 기존 데이터 로드 ──
  const { isLoading: isDetailLoading } = useQuery({
    queryKey: ['sermons', id],
    queryFn: () => getSermon(id),
    enabled: isEdit,
    onSuccess: (data) => {
      if (!initDone) {
        setFields({
          title:         data.title         ?? '',
          scripture:     data.scripture     ?? '',
          preacher:      data.preacher      ?? '',
          category:      data.category      ?? '주일오전',
          serviceNumber: data.serviceNumber ?? '',
          sermonDate:    data.sermonDate    ?? '',
          videoUrl:      data.videoUrl      ?? '',
        })
        setContent(data.content ?? '')
        setInitDone(true)
      }
    },
  })

  // ── Quill ──
  const handleUpload = useCallback((file) => uploadSermonImage(file), [])
  const { containerRef, getHTML } = useQuillEditor({
    initialValue: content,
    onChange: setContent,
    onImageUpload: handleUpload,
  })

  // ── 뮤테이션 ──
  const saveMutation = useMutation({
    mutationFn: (formData) =>
      isEdit ? updateSermon({ id, formData }) : createSermon(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sermons'] })
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
      navigate('/admin/sermons')
    },
  })

  // ── 제출 ──
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!fields.title.trim()) return alert('제목을 입력해주세요.')

    const html = getHTML()
    const formData = new FormData()
    formData.append('title',    fields.title.trim())
    formData.append('category', fields.category)
    if (fields.scripture)     formData.append('scripture',     fields.scripture)
    if (fields.preacher)      formData.append('preacher',      fields.preacher)
    if (fields.serviceNumber) formData.append('serviceNumber', fields.serviceNumber)
    if (fields.sermonDate)    formData.append('sermonDate',    fields.sermonDate)
    if (fields.videoUrl)      formData.append('videoUrl',      fields.videoUrl)
    if (html)                 formData.append('content',       html)
    files.forEach((f) => formData.append('files', f))

    saveMutation.mutate(formData)
  }

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)
    setFiles((prev) => [...prev, ...selected])
    e.target.value = ''
  }

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  // serviceNumber 노출 여부
  const showServiceNumber = ['주일오전', '주일오후'].includes(fields.category)

  if (isEdit && isDetailLoading) return <LoadingSpinner fullScreen={false} />

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-900 mb-8">
        {isEdit ? '설교 수정' : '설교 등록'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fields.title}
            onChange={set('title')}
            maxLength={200}
            required
            placeholder="설교 제목"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 카테고리 + 부 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              value={fields.category}
              onChange={set('category')}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {showServiceNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">예배부</label>
              <select
                value={fields.serviceNumber}
                onChange={set('serviceNumber')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">선택 안 함</option>
                <option value="1">1부</option>
                <option value="2">2부</option>
              </select>
            </div>
          )}
        </div>

        {/* 설교자 + 성경 구절 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설교자</label>
            <input
              type="text"
              value={fields.preacher}
              onChange={set('preacher')}
              maxLength={50}
              placeholder="설교자 이름"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">성경 구절</label>
            <input
              type="text"
              value={fields.scripture}
              onChange={set('scripture')}
              maxLength={100}
              placeholder="예: 요한복음 3:16"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 설교일 + YouTube URL */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설교 날짜</label>
            <input
              type="date"
              value={fields.sermonDate}
              onChange={set('sermonDate')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
            <input
              type="url"
              value={fields.videoUrl}
              onChange={set('videoUrl')}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 내용 (Quill) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div
              ref={containerRef}
              style={{ minHeight: '280px' }}
              className="text-sm"
            />
          </div>
        </div>

        {/* 첨부파일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">첨부파일</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:border file:border-gray-300 file:rounded-lg file:text-sm file:bg-gray-50 hover:file:bg-gray-100 file:cursor-pointer"
          />
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
            onClick={() => navigate('/admin/sermons')}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminSermonFormPage
