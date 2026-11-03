import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSermon, createSermon, updateSermon, uploadSermonImage } from '@/api/sermons'
import useQuillEditor from '@/hooks/useQuillEditor.jsx'
import { DateInput } from '@/components/ui/DateInput'
import { getErrorMessage } from '@/lib/apiError'
import toast from '@/utils/toast'

const CATEGORIES = ['주일오전', '주일오후', '수요예배', '금요기도회', '훈련용메시지', '수련회특강']
// 저장값과 화면 표기가 다른 카테고리만 정의
const CATEGORY_LABEL = { '수련회특강': '수련회/특강' }

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

  const [fields, setFields] = useState({
    title: '', scripture: '', preacher: '',
    category: '주일오후', serviceNumber: '',
    sermonDate: '', videoUrl: '', audioUrl: '',
  })
  const [content, setContent] = useState('')
  const [files,   setFiles]   = useState([])

  const set = (key) => (e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))

  // ── 수정 모드: 기존 데이터 로드 ──
  const { data: detail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['sermons', id],
    queryFn: () => getSermon(id),
    enabled: isEdit,
  })

  // v5 호환: 데이터 로드 후 폼 초기값 세팅
  useEffect(() => {
    if (detail) {
      setFields({
        title:         detail.title         ?? '',
        scripture:     detail.scripture     ?? '',
        preacher:      detail.preacher      ?? '',
        category:      detail.category      ?? '주일오전',
        serviceNumber: detail.serviceNumber ?? '',
        sermonDate:    detail.sermonDate    ?? '',
        videoUrl:      detail.videoUrl      ?? '',
        audioUrl:      detail.audioUrl      ?? '',
      })
      setContent(detail.content ?? '')
    }
  }, [detail])

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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!fields.title.trim()) return toast.error('제목을 입력해주세요.')

    const formData = new FormData()
    formData.append('title',    fields.title.trim())
    formData.append('category', fields.category)
    if (fields.scripture)     formData.append('scripture',     fields.scripture)
    if (fields.preacher)      formData.append('preacher',      fields.preacher)
    if (fields.serviceNumber) formData.append('serviceNumber', fields.serviceNumber)
    if (fields.sermonDate)    formData.append('sermonDate',    fields.sermonDate)
    if (fields.videoUrl)      formData.append('videoUrl',      fields.videoUrl)
    if (fields.audioUrl)      formData.append('audioUrl',      fields.audioUrl)
    const html = getHTML()
    if (html) formData.append('content', html)
    files.forEach((f) => formData.append('files', f))
    saveMutation.mutate(formData)
  }

  const handleFileChange = (e) => {
    setFiles((prev) => [...prev, ...Array.from(e.target.files)])
    e.target.value = ''
  }
  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  const showServiceNumber = ['주일오전', '주일오후', '수련회특강'].includes(fields.category)
  const isRetreat = fields.category === '수련회특강'

  if (isEdit && isDetailLoading) return (
    <div className="p-8 max-w-3xl space-y-6">
      <div className="skeleton-shimmer h-7 w-36 rounded mb-8" />
      <div className="skeleton-shimmer h-10 w-full rounded" />
      <div className="skeleton-shimmer h-10 w-1/2 rounded" />
      <div className="skeleton-shimmer h-64 w-full rounded" />
    </div>
  )

  return (
    <div className="h-full overflow-y-auto p-8 max-w-3xl">
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
            type="text" value={fields.title} onChange={set('title')}
            maxLength={200} required placeholder="설교 제목"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 카테고리 + 부 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 <span className="text-red-500">*</span></label>
            {/* 주일오전은 통합 폼(/admin/sermons/sunday-morning)에서 관리 — 신규 등록 시 선택 제외, 기존 행 수정 시에만 표시 */}
            <select value={fields.category} onChange={set('category')} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {(isEdit && fields.category === '주일오전' ? CATEGORIES : CATEGORIES.filter((c) => c !== '주일오전'))
                .map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c] ?? c}</option>)}
            </select>
          </div>
          {showServiceNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isRetreat ? '구분' : '예배부'}</label>
              <select value={fields.serviceNumber} onChange={set('serviceNumber')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">선택 안 함</option>
                <option value="1">{isRetreat ? '수련회' : '1부'}</option>
                <option value="2">{isRetreat ? '특강' : '2부'}</option>
              </select>
            </div>
          )}
        </div>

        {/* 설교자 + 성경 구절 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설교자</label>
            <input type="text" value={fields.preacher} onChange={set('preacher')} maxLength={50} placeholder="설교자 이름"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">성경 구절</label>
            <input type="text" value={fields.scripture} onChange={set('scripture')} maxLength={100} placeholder="예: 요한복음 3:16"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* 설교일 + YouTube */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설교 날짜</label>
            <DateInput
              value={fields.sermonDate}
              onChange={(v) => setFields((p) => ({ ...p, sermonDate: v }))}
              placeholder="설교 날짜 선택"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
            <input type="url" value={fields.videoUrl} onChange={set('videoUrl')} placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* 음원 URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">음원 URL</label>
          <input type="url" value={fields.audioUrl} onChange={set('audioUrl')} placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div ref={containerRef} style={{ minHeight: '280px' }} className="text-sm" />
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

        {saveMutation.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
            {getErrorMessage(saveMutation.error, '저장 중 오류가 발생했습니다.')}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saveMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
            {saveMutation.isPending ? '저장 중...' : isEdit ? '수정 완료' : '등록'}
          </button>
          <button type="button" onClick={() => navigate('/admin/sermons')}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm px-5 py-2.5 rounded-lg transition-colors">
            취소
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminSermonFormPage
