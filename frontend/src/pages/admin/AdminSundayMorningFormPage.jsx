import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSundayMorningByDate, createSermon, updateSermon, uploadSermonImage } from '@/api/sermons'
import useQuillEditor from '@/hooks/useQuillEditor.jsx'
import { DateInput } from '@/components/ui/DateInput'
import { getErrorMessage } from '@/lib/apiError'
import toast from '@/utils/toast'

// YouTube URL → 영상 ID (youtu.be / watch?v= / embed 형식 지원)
const extractVideoId = (url = '') => {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/)
  return m ? m[1] : null
}

/**
 * 관리자 주일오전 통합 폼 (1부 + 2부 한 페이지 관리)
 * - /admin/sermons/sunday-morning/new          → 생성 모드
 * - /admin/sermons/sunday-morning/:date/edit   → 수정 모드 (날짜 기준)
 *
 * 1부/2부는 같은 설교(제목·본문 공유)이므로 공통 필드 1세트 + 부별 영상 URL로 관리.
 * 저장 시 부별 행(serviceNumber 1/2)을 각각 생성/수정한다.
 */
const AdminSundayMorningFormPage = () => {
  const { date } = useParams()
  const isEdit   = Boolean(date)
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const [fields, setFields] = useState({
    title: '', scripture: '', preacher: '',
    sermonDate: date ?? '', video1Url: '', video2Url: '',
  })
  const [content, setContent] = useState('')
  const [files,   setFiles]   = useState([])

  const set = (key) => (e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))

  // ── 수정 모드: 날짜 그룹(1부+2부) 로드 ──
  const { data: detail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['sermons', 'sunday-morning', 'date', date],
    queryFn: () => getSundayMorningByDate(date),
    enabled: isEdit,
  })

  useEffect(() => {
    if (detail) {
      const base = detail.part1 ?? detail.part2
      setFields({
        title:      base?.title      ?? '',
        scripture:  base?.scripture  ?? '',
        preacher:   base?.preacher   ?? '',
        sermonDate: detail.sermonDate ?? date ?? '',
        video1Url:  detail.part1?.videoUrl ?? '',
        video2Url:  detail.part2?.videoUrl ?? '',
      })
      setContent(base?.content ?? '')
    }
  }, [detail, date])

  // ── Quill ──
  const handleUpload = useCallback((file) => uploadSermonImage(file), [])
  const { containerRef, getHTML } = useQuillEditor({
    initialValue: content,
    onChange: setContent,
    onImageUpload: handleUpload,
  })

  // ── 부별 FormData 구성 (공통 필드 공유, 영상 URL만 부별) ──
  const buildFormData = (serviceNumber, videoUrl, withFiles) => {
    const fd = new FormData()
    fd.append('title',         fields.title.trim())
    fd.append('category',      '주일오전')
    fd.append('serviceNumber', serviceNumber)
    if (fields.scripture)  fd.append('scripture',  fields.scripture)
    if (fields.preacher)   fd.append('preacher',   fields.preacher)
    if (fields.sermonDate) fd.append('sermonDate', fields.sermonDate)
    if (videoUrl) {
      fd.append('videoUrl', videoUrl)
      const vid = extractVideoId(videoUrl)
      if (vid) fd.append('thumbnailUrl', `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`)
    }
    const html = getHTML()
    if (html) fd.append('content', html)
    if (withFiles) files.forEach((f) => fd.append('files', f))
    return fd
  }

  // ── 저장: 부별 행 생성/수정 (첨부파일은 1부 우선 귀속) ──
  const saveMutation = useMutation({
    mutationFn: async () => {
      const p1 = detail?.part1 ?? null
      const p2 = detail?.part2 ?? null
      // 첨부 귀속 대상: 1부가 존재하거나 생성될 예정이면 1부, 아니면 2부
      const attachTo = (p1 || fields.video1Url || !isEdit) ? 1 : 2

      if (isEdit) {
        if (p1)                       await updateSermon({ id: p1.id, formData: buildFormData(1, fields.video1Url, attachTo === 1) })
        else if (fields.video1Url)    await createSermon(buildFormData(1, fields.video1Url, attachTo === 1))
        if (p2)                       await updateSermon({ id: p2.id, formData: buildFormData(2, fields.video2Url, attachTo === 2) })
        else if (fields.video2Url)    await createSermon(buildFormData(2, fields.video2Url, attachTo === 2))
      } else {
        // 생성: 1부는 항상 생성, 2부는 영상 URL 입력 시에만
        await createSermon(buildFormData(1, fields.video1Url, true))
        if (fields.video2Url) await createSermon(buildFormData(2, fields.video2Url, false))
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sermons'] })
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
      navigate('/admin/sermons')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!fields.title.trim())  return toast.error('제목을 입력해주세요.')
    if (!fields.sermonDate)    return toast.error('설교 날짜를 선택해주세요.')
    saveMutation.mutate()
  }

  const handleFileChange = (e) => {
    setFiles((prev) => [...prev, ...Array.from(e.target.files)])
    e.target.value = ''
  }
  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  if (isEdit && isDetailLoading) return (
    <div className="p-8 max-w-3xl space-y-6">
      <div className="skeleton-shimmer h-7 w-36 rounded mb-8" />
      <div className="skeleton-shimmer h-10 w-full rounded" />
      <div className="skeleton-shimmer h-10 w-1/2 rounded" />
      <div className="skeleton-shimmer h-64 w-full rounded" />
    </div>
  )

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-900 mb-2">
        {isEdit ? '주일오전 설교 수정' : '주일오전 설교 등록'}
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        1부와 2부는 같은 설교로 관리됩니다. 제목·본문은 공통으로 저장되고, 영상 URL만 부별로 입력합니다.
      </p>

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

        {/* 설교일 + 설교자 + 성경 구절 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설교 날짜 <span className="text-red-500">*</span>
            </label>
            <DateInput
              value={fields.sermonDate}
              onChange={(v) => setFields((p) => ({ ...p, sermonDate: v }))}
              placeholder="설교 날짜 선택"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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

        {/* 부별 영상 URL */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">1부 영상 URL</label>
            <input type="url" value={fields.video1Url} onChange={set('video1Url')} placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">2부 영상 URL</label>
            <input type="url" value={fields.video2Url} onChange={set('video2Url')} placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* 내용 (공통) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">내용 (1·2부 공통)</label>
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
            <span className="ml-auto text-xs text-gray-400 shrink-0">PDF, JPG, PNG · 최대 10MB</span>
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

export default AdminSundayMorningFormPage
