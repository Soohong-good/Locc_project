import DOMPurify from 'dompurify'
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSundayMorningByDate, updateSermon, deleteSermon, getSermon } from '@/api/sermons'
import { downloadFile } from '@/api/files'
import useAuthStore from '@/stores/authStore'
import SermonModal from '@/components/sermon/SermonModal'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import toast from '@/utils/toast'

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

const SERVICE_NUMBER_OPTIONS = [
  { value: 1, label: '1부 예배' },
  { value: 2, label: '2부 예배' },
]

const BackIcon = () => (
  <svg className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200"
    fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const SundayMorningDetailPage = () => {
  const { date }     = useParams()   // "2026-06-08"
  const navigate     = useNavigate()
  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const canWrite     = isAdminOrOperatorFn()
  const isAdmin      = isAdminFn()
  const userId       = getUserId()
  const queryClient  = useQueryClient()

  // 활성 부 (1 또는 2) — 기본 1부
  const [activePart,        setActivePart]        = useState(1)
  const [editTarget,        setEditTarget]        = useState(null)
  const [isSaving,          setIsSaving]          = useState(false)
  const [isLoadingDetail,   setIsLoadingDetail]   = useState(false)

  const queryKey = ['sermon', 'sunday-morning', 'date', date]

  const { data: group, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getSundayMorningByDate(date),
  })

  // 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => updateSermon({ id, formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ['sermons', 'sunday-morning'] })
      setEditTarget(null)
      setIsSaving(false)
      toast.success('설교가 수정되었습니다.')
    },
    onError: () => {
      toast.error('저장에 실패했습니다.')
      setIsSaving(false)
    },
  })

  // 삭제
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSermon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermons', 'sunday-morning'] })
      toast.success('설교가 삭제되었습니다.')
      navigate('/worship/sermon/sunday-morning')
    },
    onError: () => toast.error('설교 삭제에 실패했습니다.'),
  })

  const handleDeleteClick = (sermon) => {
    if (!confirm(`"${sermon.title}" 설교를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) return
    deleteMutation.mutate(sermon.id)
  }

  // ── 로딩 / 에러 ────────────────────────────────────────────────────
  if (isLoading) return <LoadingSpinner />
  if (error) return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <ErrorMessage error={error} fallback="설교를 불러올 수 없습니다." />
      <button onClick={() => navigate(-1)}
        className="mt-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition group">
        <BackIcon /> 목록으로
      </button>
    </div>
  )

  const hasBoth = !!group.part1 && !!group.part2

  // 선택한 part가 없으면 존재하는 쪽으로 fallback
  const sermon = activePart === 1
    ? (group.part1 ?? group.part2)
    : (group.part2 ?? group.part1)

  const effectivePart = activePart === 1
    ? (group.part1 ? 1 : 2)
    : (group.part2 ? 2 : 1)

  const videoId = extractYouTubeId(sermon?.videoUrl)
  const dateStr = date ? date.replace(/-/g, '. ') : ''

  return (
    <>
      {/* ── Hero ── */}
      <section className="pt-page pb-14 bg-slate-900 text-white px-6">
        <div className="max-w-4xl mx-auto">

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-white
              mb-10 group transition-colors duration-200 tracking-[0.1em] uppercase"
          >
            <BackIcon /> 목록으로
          </button>

          <div className="animate-fade-in-up">
            <p className="text-xs font-medium tracking-[0.3em] text-eyebrow uppercase mb-4">
              주일오전예배
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white leading-snug tracking-tight mb-4">
              {dateStr} 주일오전예배
            </h1>
            <div className="h-px w-12 bg-slate-700 mb-6" />
          </div>

          {/* 메타 */}
          <div className="flex flex-wrap items-center gap-5 text-slate-300 font-light">
            {sermon?.preacher && (
              <>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{sermon.preacher}</span>
                </div>
                <span className="text-slate-600">•</span>
              </>
            )}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{dateStr}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1부/2부 토글 + 영상 ── */}
      <section className="py-16 bg-white px-6">
        <div className="max-w-4xl mx-auto">

          {/* 토글 버튼 (둘 다 있을 때만) */}
          {hasBoth && (
            <div className="flex gap-3 mb-8">
              {[1, 2].map((part) => (
                <button
                  key={part}
                  onClick={() => setActivePart(part)}
                  className={`px-6 py-2.5 text-sm font-medium transition-colors duration-200
                    ${effectivePart === part
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {part}부 예배
                </button>
              ))}
            </div>
          )}

          {/* 설교 정보 + 관리자 버튼 */}
          {sermon && (
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-light text-slate-900 mb-2">
                  {sermon.title}
                </h2>
                {sermon.scripture && (
                  <p className="text-slate-500 text-sm">{sermon.scripture}</p>
                )}
              </div>
              {canWrite && (isAdmin || sermon.authorId === userId) && (
                <div className="flex gap-3 flex-shrink-0">
                  <button
                    disabled={isLoadingDetail}
                    onClick={async () => {
                      setIsLoadingDetail(true)
                      try {
                        const detail = await getSermon(sermon.id)
                        setEditTarget(detail)
                      } catch {
                        setEditTarget(sermon)
                      } finally {
                        setIsLoadingDetail(false)
                      }
                    }}
                    className="px-4 py-2 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white disabled:opacity-50 transition font-medium text-sm"
                  >
                    {isLoadingDetail ? '불러오는 중...' : '수정'}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(sermon)}
                    disabled={deleteMutation.isPending}
                    className="px-4 py-2 border-2 border-red-400 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 disabled:opacity-50 transition font-medium text-sm"
                  >
                    {deleteMutation.isPending ? '삭제 중...' : '삭제'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 영상 */}
          {videoId ? (
            <div className="aspect-video bg-slate-900 overflow-hidden shadow-xl">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="aspect-video bg-slate-100 flex items-center justify-center">
              <p className="text-slate-400 text-sm">등록된 영상이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── 설교 내용 ── */}
      {sermon?.content && (
        <section className="py-24 bg-white px-6">
          <article className="max-w-4xl mx-auto">
            <div className="prose prose-lg prose-slate max-w-none">
              <div
                className="text-slate-700 leading-[1.9] font-light text-lg"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sermon.content) }}
              />
            </div>
          </article>
        </section>
      )}

      {/* ── 첨부파일 ── */}
      {sermon?.attachments && sermon.attachments.length > 0 && (
        <section className="py-12 bg-slate-50 px-6 border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm tracking-[0.2em] text-eyebrow uppercase mb-6">Attachments</h3>
            <div className="space-y-3">
              {sermon.attachments.map((attachment) => (
                <div key={attachment.id}
                  className="flex items-center gap-4 p-5 bg-white hover:bg-slate-100 transition-all duration-300 group border border-slate-200">
                  <div className="w-10 h-10 flex items-center justify-center bg-slate-100 group-hover:bg-slate-900 transition-all duration-300 flex-shrink-0">
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-300"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-light text-slate-900 truncate">{attachment.originalFileName}</p>
                    {attachment.fileSize && (
                      <p className="text-sm text-slate-500 font-light">
                        {(attachment.fileSize / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => downloadFile(attachment.id, attachment.originalFileName)}
                    className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-700 transition-all duration-300 flex items-center gap-2 text-sm flex-shrink-0"
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
        </section>
      )}

      {/* ── 목록 버튼 ── */}
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

      {/* ── 수정 모달 ── */}
      {editTarget && (
        <SermonModal
          isOpen
          onClose={() => setEditTarget(null)}
          onSave={(formData) => {
            setIsSaving(true)
            updateMutation.mutate({ id: editTarget.id, formData })
          }}
          isSaving={isSaving}
          editTarget={editTarget}
          fixedCategory="주일오전"
          serviceNumberOptions={SERVICE_NUMBER_OPTIONS}
          defaultServiceNumber={editTarget.serviceNumber ?? 1}
        />
      )}
    </>
  )
}

export default SundayMorningDetailPage
