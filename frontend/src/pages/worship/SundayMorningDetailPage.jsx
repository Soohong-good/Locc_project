import DOMPurify from 'dompurify'
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  House, CaretRight, User, CalendarBlank, BookOpen,
  Play, DownloadSimple, YoutubeLogo, Rows, ArrowLeft, ArrowRight,
} from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSundayMorningByDate, deleteSermon } from '@/api/sermons'
import { downloadFile } from '@/api/files'
import useAuthStore from '@/stores/authStore'
import useNoIndex from '@/hooks/useNoIndex'
import SundayMorningModal from '@/components/sermon/SundayMorningModal'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import toast from '@/utils/toast'
import { formatTranscript } from '@/utils/formatTranscript'
import BiblePassageSection from '@/components/sermon/BiblePassageSection'
import { extractYouTubeId } from '@/utils/youtube'

/** 설교 본문 렌더 — 평문(PDF 자동 추출)만 구조화, HTML(수동 작성)은 그대로 */
function renderSermonContent(content) {
  if (!content) return ''
  return content.includes('<') ? content : formatTranscript(content)
}

const SundayMorningDetailPage = () => {
  const { date }    = useParams()
  const navigate    = useNavigate()
  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const canWrite    = isAdminOrOperatorFn()
  const isAdmin     = isAdminFn()
  const userId      = getUserId()
  const queryClient = useQueryClient()

  const [activePart,   setActivePart]   = useState(1)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [editing,      setEditing]      = useState(false)

  // 이전/다음 설교 버튼으로 날짜만 바뀌는 경우 컴포넌트가 리마운트되지 않으므로 직접 리셋
  useEffect(() => {
    setActivePart(1)
    setVideoPlaying(false)
  }, [date])

  const queryKey = ['sermon', 'sunday-morning', 'date', date]

  const { data: group, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getSundayMorningByDate(date),
  })

  // 존재하지 않는 날짜도 SPA 특성상 200 OK가 나가므로 색인에서 제외
  useNoIndex(!isLoading && !!error)

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

  if (isLoading) return <LoadingSpinner />
  if (error) return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <ErrorMessage error={error} fallback="설교를 불러올 수 없습니다." />
      <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition">
        목록으로
      </button>
    </div>
  )

  const hasBoth       = !!group.part1 && !!group.part2
  const sermon        = activePart === 1 ? (group.part1 ?? group.part2) : (group.part2 ?? group.part1)
  const effectivePart = activePart === 1 ? (group.part1 ? 1 : 2) : (group.part2 ? 2 : 1)

  const videoId      = extractYouTubeId(sermon?.videoUrl)
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : sermon?.thumbnailUrl
  const dateStr = date ? date.replace(/-/g, '. ') : ''

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen border-x border-[#e6e0d6] bg-white">

      {/* ── 헤더 ── */}
      <div className="p-8 md:p-12 lg:p-16 border-b border-[#e6e0d6]">
        <div className="flex items-center gap-3 text-sm text-[#7a766e] font-mono mb-8">
          <Link to="/" className="hover:text-[#1a1710] transition-colors flex items-center gap-1">
            <House size={14} /> Home
          </Link>
          <CaretRight size={12} />
          <Link to="/worship/sermon/sunday-morning" className="hover:text-[#1a1710] transition-colors">
            복음말씀
          </Link>
          <CaretRight size={12} />
          <span className="text-[#1a1710] font-bold">주일오전</span>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#1a1710] mb-6">
          {sermon?.title || `${dateStr} 주일오전예배`}
        </h1>

        <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-mono text-[#7a766e]">
          {sermon?.preacher && (
            <div className="flex items-center gap-2">
              <User size={15} />
              <span className="font-medium text-[#1a1710]">{sermon.preacher}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <CalendarBlank size={15} />
            <span>{dateStr}</span>
          </div>
          {sermon?.scripture && (
            <div className="flex items-center gap-2">
              <BookOpen size={15} />
              <span>{sermon.scripture}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 1부/2부 토글 + 관리자 버튼 ── */}
      {(hasBoth || (canWrite && (isAdmin || sermon?.authorId === userId))) && (
        <div className="px-8 md:px-12 lg:px-16 py-4 border-b border-[#e6e0d6] flex flex-wrap items-center justify-between gap-4 bg-[#faf8f5]">
          {hasBoth ? (
            <div className="flex gap-2">
              {[1, 2].map((part) => (
                <button
                  key={part}
                  onClick={() => { setActivePart(part); setVideoPlaying(false) }}
                  className={`px-5 py-2 text-sm font-medium transition-colors ${
                    effectivePart === part
                      ? 'bg-[#1a1710] text-white'
                      : 'bg-white text-[#7a766e] border border-[#e6e0d6] hover:bg-[#e6e0d6]'
                  }`}
                >
                  {part}부 예배
                </button>
              ))}
            </div>
          ) : <div />}

          {canWrite && (isAdmin || sermon?.authorId === userId) && (
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 border border-[#e6e0d6] text-[#3d3a35] hover:bg-[#1a1710] hover:text-white hover:border-[#1a1710] transition-colors text-sm font-medium"
              >
                수정
              </button>
              <button
                onClick={() => handleDeleteClick(sermon)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 영상 + 상세 그리드 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#e6e0d6]">

        {/* 영상 */}
        <div className="lg:col-span-8 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#7a766e] font-mono mb-6 block">
            Sermon Video
          </span>

          <div className="relative w-full aspect-video bg-[#faf8f5] border border-[#e6e0d6] overflow-hidden group">
            {videoId ? (
              videoPlaying ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <>
                  <button
                    onClick={() => setVideoPlaying(true)}
                    className="absolute inset-0 w-full h-full"
                    aria-label="영상 재생"
                  >
                    {thumbnailUrl && (
                      <img
                        src={thumbnailUrl}
                        alt="Video Thumbnail"
                        className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.02]"
                        onError={(e) => {
                          if (e.target.src.includes('maxresdefault')) {
                            e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                          }
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-[#1a1710]/20 group-hover:bg-[#1a1710]/10 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-20 h-20 bg-[#1a1710] text-white flex items-center justify-center rounded-full shadow-lg group-hover:scale-110 group-hover:bg-[#FF0000] transition-all duration-300">
                        <Play size={32} weight="fill" className="ml-1" />
                      </span>
                    </div>
                  </button>
                  {sermon?.videoUrl && (
                    <a
                      href={sermon.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-4 right-4 z-10 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium hover:bg-white/40 transition-colors flex items-center gap-2"
                    >
                      YouTube에서 보기 <YoutubeLogo size={18} weight="fill" />
                    </a>
                  )}
                </>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[#7a766e] text-sm">등록된 영상이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* 상세 사이드바 */}
        <div className="lg:col-span-4 bg-white flex flex-col">
          <div className="p-8 md:p-12 lg:p-16 flex-1 flex flex-col justify-center">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#7a766e] font-mono mb-8 block">
              Sermon Details
            </span>

            <div className="flex flex-col border-t border-[#e6e0d6]">
              {sermon?.preacher && (
                <div className="flex justify-between items-center py-4 border-b border-[#e6e0d6]">
                  <span className="text-sm font-mono text-[#7a766e]">설교자</span>
                  <span className="font-bold text-[#1a1710]">{sermon.preacher}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-4 border-b border-[#e6e0d6]">
                <span className="text-sm font-mono text-[#7a766e]">날짜</span>
                <span className="font-bold font-mono text-[#1a1710]">{dateStr}</span>
              </div>
              {sermon?.scripture && (
                <div className="flex justify-between items-center py-4 border-b border-[#e6e0d6]">
                  <span className="text-sm font-mono text-[#7a766e]">본문</span>
                  <span className="font-bold text-[#1a1710] text-right">{sermon.scripture}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-4 border-b border-[#e6e0d6]">
                <span className="text-sm font-mono text-[#7a766e]">예배</span>
                <span className="font-bold text-[#1a1710]">
                  주일오전{hasBoth ? ` ${effectivePart}부` : ''}예배
                </span>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              {group.prevDate && (
                <button
                  onClick={() => navigate(`/worship/sermon/sunday-morning/${group.prevDate}`)}
                  className="w-full flex justify-between items-center py-4 px-6 bg-[#faf8f5] border border-[#e6e0d6] hover:bg-[#1a1710] hover:text-white hover:border-[#1a1710] transition-colors group/nav"
                >
                  <span className="text-sm font-bold tracking-wider">이전 설교 보기</span>
                  <ArrowLeft size={18} className="group-hover/nav:-translate-x-1 transition-transform" />
                </button>
              )}
              {group.nextDate && (
                <button
                  onClick={() => navigate(`/worship/sermon/sunday-morning/${group.nextDate}`)}
                  className="w-full flex justify-between items-center py-4 px-6 bg-[#faf8f5] border border-[#e6e0d6] hover:bg-[#1a1710] hover:text-white hover:border-[#1a1710] transition-colors group/nav"
                >
                  <span className="text-sm font-bold tracking-wider">다음 설교 보기</span>
                  <ArrowRight size={18} className="group-hover/nav:translate-x-1 transition-transform" />
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="w-full flex justify-between items-center py-4 px-6 bg-[#faf8f5] border border-[#e6e0d6] hover:bg-[#1a1710] hover:text-white hover:border-[#1a1710] transition-colors"
              >
                <span className="text-sm font-bold tracking-wider">목록으로 돌아가기</span>
                <Rows size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 성경 본문 ── */}
      <BiblePassageSection
        scripture={sermon?.scripture ?? group.part1?.scripture ?? group.part2?.scripture}
      />

      {/* ── 설교 내용 ── */}
      {(group.part1?.content ?? group.part2?.content) && (
        <section className="py-24 bg-white px-6 border-t border-[#e6e0d6]">
          <div className="max-w-[960px] mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#7a766e] font-mono mb-4 block">
                Transcript
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-[#1a1710] tracking-tight">설교 녹취록</h3>
            </div>
            <article className="prose prose-lg prose-slate max-w-none">
              <div
                className="ql-editor ql-output sermon-body text-[#3d3a35] leading-[1.9] font-light text-lg"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    renderSermonContent(group.part1?.content ?? group.part2?.content)
                  )
                }}
              />
            </article>
          </div>
        </section>
      )}

      {/* ── 첨부파일 ── */}
      {sermon?.attachments && sermon.attachments.length > 0 && (
        <section className="py-12 bg-[#faf8f5] px-6 border-t border-[#e6e0d6]">
          <div className="max-w-[960px] mx-auto">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#7a766e] font-mono mb-6 block">
              Attachments
            </span>
            <div className="space-y-3">
              {sermon.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-4 p-5 bg-white border border-[#e6e0d6] hover:border-[#1a1710] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1a1710] truncate">{attachment.originalFileName}</p>
                    {attachment.fileSize && (
                      <p className="text-sm text-[#7a766e]">
                        {(attachment.fileSize / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => downloadFile(attachment.id, attachment.originalFileName)}
                    className="px-4 py-2 bg-[#1a1710] text-white hover:bg-[#3d3a35] transition-colors flex items-center gap-2 text-sm flex-shrink-0"
                  >
                    <DownloadSimple size={16} />
                    다운로드
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 목록 버튼 ── */}
      <div className="p-8 md:p-12 lg:p-16 bg-[#faf8f5] border-t border-[#e6e0d6] flex justify-start">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-[#e6e0d6] text-sm font-bold tracking-wider hover:bg-[#1a1710] hover:text-white hover:border-[#1a1710] transition-colors"
        >
          <Rows size={18} />
          목록으로 돌아가기
        </button>
      </div>

      {/* ── 수정 모달 ── */}
      {editing && (
        <SundayMorningModal
          isOpen
          onClose={() => setEditing(false)}
          editGroup={{ ...group, sermonDate: date }}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey })
            queryClient.invalidateQueries({ queryKey: ['sermons', 'sunday-morning'] })
            toast.success('설교가 수정되었습니다.')
          }}
        />
      )}
    </div>
  )
}

export default SundayMorningDetailPage
