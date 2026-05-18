import DOMPurify from 'dompurify'
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSermon, updateSermon, deleteSermon } from '@/api/sermons'
import { downloadFile } from '@/api/files'
import useAuthStore from '@/stores/authStore'
import SermonModal from '@/components/sermon/SermonModal'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import toast from '@/utils/toast'

// detail.html: extractYouTubeId 그대로 이식
function extractYouTubeId(url) {
  if (!url) return null
  if (url.includes('youtube.com/watch')) {
    return new URLSearchParams(url.split('?')[1]).get('v')
  }
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1].split('?')[0]
  }
  if (url.includes('youtube.com/embed/')) {
    return url.split('embed/')[1].split('?')[0]
  }
  return null
}

// 카테고리별 serviceNumberOptions (detail.html의 th:if 조건 그대로)
function getServiceNumberOptions(category) {
  if (category === '주일오전') return [
    { value: 1, label: '1부 예배' },
    { value: 2, label: '2부 예배' },
  ]
  if (category === '기타예배') return [
    { value: 1, label: '수요예배' },
    { value: 2, label: '금요기도회' },
  ]
  return null
}

const SermonDetailPage = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const isAdmin = isAdminFn()
  const canWrite = isAdminOrOperatorFn()
  const userId = getUserId()
  const queryClient  = useQueryClient()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving,   setIsSaving]   = useState(false)

  const { data: sermon, isLoading, error } = useQuery({
    queryKey: ['sermon', id],
    queryFn:  () => getSermon(id),
  })

  // 수정 — detail.html saveSermon() 그대로
  const updateMutation = useMutation({
    mutationFn: (formData) => updateSermon({ id, formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermon', id] })
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
      setIsEditOpen(false)
      setIsSaving(false)
    },
    onError: () => {
      toast.error('저장에 실패했습니다.')
      setIsSaving(false)
    },
  })

  // 카테고리 → 목록 경로 매핑
  const getCategoryPath = (category) => {
    if (category === '주일오전' || category === '주일오후') return '/worship/sermon/sunday-morning'
    if (category === '기타예배') return '/worship/sermon/weekday'
    if (category === '훈련용메시지') return '/worship/sermon/training-message'
    return '/worship/sermon/sunday-morning'
  }

  // 삭제 — detail.html confirmDelete() + deleteSermon() 그대로
  const deleteMutation = useMutation({
    mutationFn: () => deleteSermon(id),
    onSuccess: () => {
      toast.success('설교가 삭제되었습니다.')
      navigate(getCategoryPath(sermon?.category))
    },
    onError: () => toast.error('설교 삭제에 실패했습니다.'),
  })

  const handleSave = (formData) => {
    setIsSaving(true)
    updateMutation.mutate(formData)
  }

  // detail.html: confirmDelete() — confirm 다이얼로그
  const handleDeleteClick = () => {
    if (!confirm(`"${sermon.title}" 설교를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) return
    deleteMutation.mutate()
  }

  // ── 로딩 / 에러 ──────────────────────────────────────────────────
  if (isLoading) return <LoadingSpinner />
  if (error) return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <ErrorMessage error={error} fallback="설교를 불러올 수 없습니다." />
      <button onClick={() => navigate(-1)}
        className="mt-4 inline-block text-sm text-slate-600 hover:text-slate-900 transition">
        ← 목록으로
      </button>
    </div>
  )

  const videoId   = extractYouTubeId(sermon.videoUrl)
  const serviceNumberOptions = getServiceNumberOptions(sermon.category)
  const dateStr   = sermon.sermonDate
    ? String(sermon.sermonDate).replace(/-/g, '. ')
    : ''

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="pt-page pb-14 bg-slate-900 text-white px-6">
        <div className="max-w-4xl mx-auto">

          {/* 뒤로가기 */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-white
              mb-10 group transition-colors duration-200 tracking-[0.1em] uppercase"
          >
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </button>

          <div className="animate-fade-in-up">
            <p className="text-xs font-medium tracking-[0.3em] text-eyebrow uppercase mb-4">
              {sermon.category}
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white leading-snug tracking-tight mb-6">
              {sermon.title}
            </h1>
            <div className="h-px w-12 bg-slate-700 mb-6" />
          </div>

          {/* 메타 정보 + 관리자 버튼 */}
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 text-slate-300 font-light">
              {/* 설교자 */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{sermon.preacher}</span>
              </div>
              <span className="text-slate-600">•</span>
              {/* 날짜 */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{dateStr}</span>
              </div>
              <span className="text-slate-600">•</span>
              {/* 성경 구절 */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{sermon.scripture}</span>
              </div>
            </div>

            {/* 관리자 버튼 — detail.html 그대로 */}
            {canWrite && (isAdmin || sermon?.authorId === userId) && (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="px-4 py-2 border-2 border-white text-white hover:bg-white hover:text-slate-900 transition font-medium"
                >
                  수정
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 border-2 border-red-300 text-red-300 hover:bg-red-600 hover:text-white hover:border-red-600 disabled:opacity-50 transition font-medium"
                >
                  {deleteMutation.isPending ? '삭제 중...' : '삭제'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 유튜브 영상 — detail.html 그대로 ── */}
      {videoId && (
        <section className="py-16 bg-white px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-sm tracking-[0.2em] text-eyebrow uppercase mb-2">Sermon Video</h2>
              <h3 className="text-3xl font-light text-slate-900">설교 영상</h3>
            </div>
            <div className="aspect-video bg-slate-900 overflow-hidden shadow-xl">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── 설교 내용 + 첨부파일 — detail.html 그대로 ── */}
      <section className="py-24 bg-white px-6">
        <article className="max-w-4xl mx-auto">

          {/* 본문 — detail.html: th:utext + quill-custom 클래스 그대로 */}
          <div className="prose prose-lg prose-slate max-w-none">
            <div
              className="text-slate-700 leading-[1.9] font-light text-lg"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sermon.content || '' )}}
            />
          </div>

          {/* 첨부파일 — detail.html 그대로 */}
          {sermon.attachments && sermon.attachments.length > 0 && (
            <div className="mt-20 pt-12 border-t border-slate-200">
              <h3 className="text-sm tracking-[0.2em] text-eyebrow uppercase mb-6">Attachments</h3>
              <div className="space-y-3">
                {sermon.attachments.map((attachment) => (
                  <div key={attachment.id}
                    className="flex items-center gap-4 p-5 bg-slate-50 hover:bg-slate-100 transition-all duration-300 group">
                    <div className="w-12 h-12 flex items-center justify-center bg-white group-hover:bg-slate-900 transition-all duration-300">
                      <svg className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors duration-300"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-light text-slate-900 truncate">
                        {attachment.originalFileName}
                      </p>
                      <p className="text-sm text-slate-500 font-light">
                        {attachment.fileSize
                          ? `${(attachment.fileSize / 1024).toFixed(2)} KB`
                          : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => downloadFile(attachment.id, attachment.originalFileName)}
                      className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      다운로드
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </section>

      {/* ── 하단 목록 버튼 — detail.html 그대로 ── */}
      <section className="py-12 bg-slate-50 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center px-8 py-4 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 font-light tracking-wide"
          >
            <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로 돌아가기
          </button>
        </div>
      </section>

      {/* ── 수정 모달 — detail.html openEditModal() + SermonModal 재사용 ── */}
      <SermonModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
        editTarget={sermon}
        fixedCategory={sermon.category}
        serviceNumberOptions={serviceNumberOptions}
        defaultServiceNumber={sermon.serviceNumber ?? ''}
      />
    </>
  )
}

export default SermonDetailPage
