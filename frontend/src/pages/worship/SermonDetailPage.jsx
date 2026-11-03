import DOMPurify from 'dompurify'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User, CalendarBlank, BookOpen, ShareNetwork, Eye,
  ArrowLeft, List, Play, House, CaretRight,
} from '@phosphor-icons/react'
import { getSermon, updateSermon, deleteSermon, increaseSermonViews } from '@/api/sermons'
import { downloadFile } from '@/api/files'
import { getBiblePassage } from '@/api/bible'
import useAuthStore from '@/stores/authStore'
import useNoIndex from '@/hooks/useNoIndex'
import SermonModal from '@/components/sermon/SermonModal'
import { formatTranscript } from '@/utils/formatTranscript'
import toast from '@/utils/toast'
import { extractYouTubeId } from '@/utils/youtube'
import { formatDateDotSpaced as fmtDate } from '@/utils/dateFormat'

function renderContent(content) {
  if (!content) return ''
  return content.includes('<') ? content : formatTranscript(content)
}

function getServiceNumberOptions(category) {
  if (category === '주일오전') return [
    { value: 1, label: '1부 예배' },
    { value: 2, label: '2부 예배' },
  ]
  return null
}

const CATEGORY_TO_PATH = {
  '주일오전':     '/worship/sermon/sunday-morning',
  '주일오후':     '/worship/sermon/sunday-afternoon',
  '수요예배':     '/worship/sermon/weekday',
  '금요기도회':   '/worship/sermon/weekday',
  '훈련용메시지': '/worship/sermon/training-message',
  '수련회특강':   '/worship/sermon/retreat',
}

const CATEGORY_LABEL = {
  '주일오전':     '주일오전예배',
  '주일오후':     '주일오후예배',
  '수요예배':     '수요예배',
  '금요기도회':   '금요기도회',
  '훈련용메시지': '훈련메시지',
  '수련회특강':   '수련회/특강',
}

function getServiceLabel(category, serviceNumber) {
  if (category === '주일오전' && serviceNumber) return `주일오전 ${serviceNumber}부`
  return CATEGORY_LABEL[category] ?? category
}

/* ── 성경 책 레이아웃 ─────────────────────────────────────── */
const BibleBook = ({ scripture, verses }) => {
  const mid       = Math.ceil(verses.length / 2)
  const leftPage  = verses.slice(0, mid)
  const rightPage = verses.slice(mid)

  return (
    <div className="bg-[#F4F2EA] border-y border-[#E5E5E5] py-16 md:py-24 lg:py-32">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-4 block">Scripture</span>
          <h3 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] tracking-tight">{scripture}</h3>
        </div>

        <div className="relative max-w-[960px] mx-auto">
          <div className="absolute top-3 -left-3 -right-3 bottom-[-12px] border border-[#E5E5E5] bg-[#EAE8E0]" />
          <div className="absolute top-2 -left-2 -right-2 bottom-[-8px] border border-[#E5E5E5] bg-[#F0EEDF]" />
          <div className="absolute top-1 -left-1 -right-1 bottom-[-4px] border border-[#E5E5E5] bg-[#FAF9F6]" />

          <div className="relative flex flex-col md:flex-row bg-[#FDFCF9] border border-[#E5E5E5] z-10">
            <div className="flex-1 p-8 md:p-12 lg:p-16 border-b md:border-b-0 md:border-r border-[#E5E5E5] relative">
              <div className="hidden md:block absolute top-0 bottom-0 right-0 w-[1px] bg-[#E5E5E5]" />
              <div className="hidden md:block absolute top-0 bottom-0 right-[1px] w-[2px] bg-[#F4F2EA] opacity-50" />
              <div className="hidden md:block absolute top-0 bottom-0 right-[3px] w-[4px] bg-[#FAF9F6] opacity-30" />
              <div className="flex justify-between items-center mb-10 pb-4 border-b border-[#E5E5E5]">
                <span className="text-[11px] font-mono text-[#737373] tracking-[0.1em] uppercase">{scripture}</span>
                <span className="text-[11px] font-mono text-[#737373]">Page 1</span>
              </div>
              <div className="space-y-6 text-[#2C2C2C] leading-[2.2] text-[15px] break-keep text-justify">
                {leftPage.map((v) => (
                  <p key={v.verse}>
                    <span className="text-[10px] text-[#737373] font-mono font-bold mr-2 align-super">{v.verse}</span>
                    {v.text}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex-1 p-8 md:p-12 lg:p-16 relative">
              <div className="hidden md:block absolute top-0 bottom-0 left-0 w-[1px] bg-[#E5E5E5]" />
              <div className="hidden md:block absolute top-0 bottom-0 left-[1px] w-[2px] bg-[#F4F2EA] opacity-50" />
              <div className="hidden md:block absolute top-0 bottom-0 left-[3px] w-[4px] bg-[#FAF9F6] opacity-30" />
              <div className="flex justify-between items-center mb-10 pb-4 border-b border-[#E5E5E5]">
                <span className="text-[11px] font-mono text-[#737373] tracking-[0.1em] uppercase">{scripture}</span>
                <span className="text-[11px] font-mono text-[#737373]">Page 2</span>
              </div>
              <div className="space-y-6 text-[#2C2C2C] leading-[2.2] text-[15px] break-keep text-justify">
                {rightPage.map((v) => (
                  <p key={v.verse}>
                    <span className="text-[10px] text-[#737373] font-mono font-bold mr-2 align-super">{v.verse}</span>
                    {v.text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 메인 ───────────────────────────────────────────────────── */
const SermonDetailPage = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()

  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const canWrite = isAdminOrOperatorFn()
  const isAdmin  = isAdminFn()
  const userId   = getUserId()

  const [videoPlaying, setVideoPlaying] = useState(false)
  const [thumbErr,     setThumbErr]     = useState(false)
  const [isEditOpen,   setIsEditOpen]   = useState(false)
  const [isSaving,     setIsSaving]     = useState(false)

  const { data: sermon, isLoading, error } = useQuery({
    queryKey: ['sermon', id],
    queryFn:  () => getSermon(id),
  })

  // 존재하지 않는 설교 id도 SPA 특성상 200 OK가 나가므로 색인에서 제외
  useNoIndex(!isLoading && (!!error || !sermon))

  // 조회수 증가 — 상세 진입 시 1회 (공지·주보와 동일 방식, 실패해도 화면에 영향 없음)
  useEffect(() => {
    if (id) increaseSermonViews(id).catch(() => {})
  }, [id])

  const { data: bibleData } = useQuery({
    queryKey: ['bible-passage', sermon?.scripture],
    queryFn:  () => getBiblePassage(sermon.scripture),
    enabled:  !!sermon?.scripture,
    staleTime: Infinity,
  })

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

  const deleteMutation = useMutation({
    mutationFn: () => deleteSermon(id),
    onSuccess: () => {
      toast.success('설교가 삭제되었습니다.')
      const backPath = CATEGORY_TO_PATH[sermon?.category] ?? '/worship/sermon/sunday-morning'
      navigate(backPath)
    },
    onError: () => toast.error('설교 삭제에 실패했습니다.'),
  })

  const handleSave = (formData) => {
    setIsSaving(true)
    updateMutation.mutate(formData)
  }

  const handleDeleteClick = () => {
    if (!confirm(`"${sermon.title}" 설교를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) return
    deleteMutation.mutate()
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] pt-20">
      <p className="font-mono text-sm text-[#737373] tracking-wider">불러오는 중...</p>
    </div>
  )

  if (error || !sermon) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] pt-20">
      <div className="text-center">
        <p className="text-sm text-[#B91C1C] mb-4">설교를 불러올 수 없습니다.</p>
        <button onClick={() => navigate(-1)} className="text-sm text-[#737373] hover:text-[#171717]">← 돌아가기</button>
      </div>
    </div>
  )

  const videoId    = extractYouTubeId(sermon.videoUrl)
  const backPath   = CATEGORY_TO_PATH[sermon.category] ?? '/worship/sermon/sunday-morning'
  const catLabel   = CATEGORY_LABEL[sermon.category] ?? sermon.category
  const svcLabel   = getServiceLabel(sermon.category, sermon.serviceNumber)
  const dateStr    = fmtDate(sermon.sermonDate)
  const verses     = bibleData?.verses ?? []
  const serviceNumberOptions = getServiceNumberOptions(sermon.category)

  const thumbUrl = videoId
    ? (thumbErr
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)
    : null

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] pt-20">
      <div className="max-w-[1600px] mx-auto w-full min-h-screen border-x border-[#E5E5E5] bg-[#FAF9F6]">

        {/* ── 헤더: 브레드크럼 + 제목 + 메타 ── */}
        <div className="p-8 md:p-12 lg:p-16 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-3 text-sm text-[#737373] font-mono mb-8">
            <button onClick={() => navigate('/')} className="hover:text-[#171717] transition-colors flex items-center gap-1">
              <House size={14} />
              <span>Home</span>
            </button>
            <CaretRight size={12} weight="bold" className="text-[#C8C8C8]" />
            <span>복음말씀</span>
            <CaretRight size={12} weight="bold" className="text-[#C8C8C8]" />
            <button onClick={() => navigate(backPath)} className="font-bold text-[#171717] hover:text-[#737373] transition-colors">
              {catLabel}
            </button>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#2C2C2C] mb-6">
            {sermon.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-mono text-[#737373]">
              <div className="flex items-center gap-2">
                <User size={14} />
                <span className="font-medium text-[#2C2C2C]">{sermon.preacher}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarBlank size={14} />
                <span>{dateStr}</span>
              </div>
              {sermon.scripture && (
                <div className="flex items-center gap-2">
                  <BookOpen size={14} />
                  <span>{sermon.scripture}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye size={14} />
                <span>{sermon.viewCount ?? 0}</span>
              </div>
            </div>

            {/* 관리자 버튼 */}
            {canWrite && (isAdmin || sermon?.authorId === userId) && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="px-4 py-2 border-2 border-[#171717] text-[#171717] hover:bg-[#171717] hover:text-white transition-colors text-sm font-bold"
                >
                  수정
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 border-2 border-red-400 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 disabled:opacity-50 transition-colors text-sm font-bold"
                >
                  {deleteMutation.isPending ? '삭제 중...' : '삭제'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 영상 + 상세 정보 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E5]">

          {/* 좌: 영상 */}
          <div className="lg:col-span-8 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-6 block">
              Sermon Video
            </span>

            <div className="relative w-full aspect-video bg-[#F4F2EA] group border border-[#E5E5E5] overflow-hidden">
              {videoId && videoPlaying ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : videoId ? (
                <>
                  {thumbUrl && (
                    <img
                      src={thumbUrl}
                      alt={sermon.title}
                      onError={() => setThumbErr(true)}
                      className="absolute inset-0 w-full h-full object-cover grayscale-[20%] opacity-90 transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  )}
                  <div className="absolute inset-0 bg-[#171717]/20 group-hover:bg-[#171717]/10 transition-colors duration-300" />

                  <div className="absolute top-4 left-4 right-4 z-10">
                    <p className="text-sm font-bold text-white drop-shadow truncate">
                      {dateStr} {svcLabel} · {sermon.title}
                    </p>
                    <p className="text-xs text-white/80 mt-0.5">그리스도사랑교회</p>
                  </div>

                  <button
                    onClick={() => setVideoPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center z-10"
                    aria-label="영상 재생"
                  >
                    <div className="w-20 h-20 bg-[#171717] text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#FF0000] transition-all duration-300">
                      <Play size={32} weight="fill" className="ml-1" />
                    </div>
                  </button>

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
                    <button
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: sermon.title, url: window.location.href })
                        } else {
                          navigator.clipboard.writeText(window.location.href)
                          toast.success('링크가 복사되었습니다.')
                        }
                      }}
                    >
                      <ShareNetwork size={18} />
                    </button>
                    <a
                      href={sermon.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium hover:bg-white/40 transition-colors flex items-center gap-2"
                    >
                      YouTube에서 보기
                    </a>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="font-mono text-sm text-[#A3A3A3]">등록된 영상이 없습니다</p>
                </div>
              )}
            </div>
          </div>

          {/* 우: 상세 정보 패널 */}
          <div className="lg:col-span-4 bg-[#FAF9F6] flex flex-col">
            <div className="p-8 md:p-12 lg:p-16 flex-1 flex flex-col justify-center">
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-8 block">
                Sermon Details
              </span>

              <div className="flex flex-col border-t border-[#E5E5E5]">
                <div className="flex justify-between items-center py-4 border-b border-[#E5E5E5]">
                  <span className="text-sm font-mono text-[#737373]">설교자</span>
                  <span className="font-bold text-[#2C2C2C]">{sermon.preacher}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-[#E5E5E5]">
                  <span className="text-sm font-mono text-[#737373]">날짜</span>
                  <span className="font-bold font-mono text-[#2C2C2C]">{dateStr}</span>
                </div>
                {sermon.scripture && (
                  <div className="flex justify-between items-center py-4 border-b border-[#E5E5E5]">
                    <span className="text-sm font-mono text-[#737373]">본문</span>
                    <span className="font-bold text-[#2C2C2C]">{sermon.scripture}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-4 border-b border-[#E5E5E5]">
                  <span className="text-sm font-mono text-[#737373]">예배</span>
                  <span className="font-bold text-[#2C2C2C]">{svcLabel}</span>
                </div>
              </div>

              <div className="mt-12">
                <button
                  onClick={() => navigate(backPath)}
                  className="w-full flex justify-between items-center py-4 px-6 bg-[#F4F2EA] border border-[#E5E5E5] hover:bg-[#171717] hover:text-white transition-colors group"
                >
                  <span className="text-sm font-bold tracking-wider">목록으로 돌아가기</span>
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 성경 본문 (책 레이아웃) ── */}
        {verses.length > 0 && (
          <BibleBook scripture={sermon.scripture} verses={verses} />
        )}

        {/* ── 설교 내용 ── */}
        {sermon.content && (
          <div className="bg-[#FAF9F6] border-t border-[#E5E5E5] py-16 md:py-24">
            <div className="max-w-[1200px] mx-auto px-6 md:px-12">
              <div className="text-center mb-16">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-4 block">
                  Transcript
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] tracking-tight">설교 내용</h3>
              </div>

              <div
                className="max-w-[960px] mx-auto sermon-body ql-output"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(renderContent(sermon.content))
                }}
              />
            </div>
          </div>
        )}

        {/* ── 첨부파일 ── */}
        {sermon.attachments && sermon.attachments.length > 0 && (
          <div className="border-t border-[#E5E5E5] py-16 md:py-24 bg-[#FAF9F6]">
            <div className="max-w-[1200px] mx-auto px-6 md:px-12">
              <div className="text-center mb-16">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-4 block">
                  Attachments
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] tracking-tight">첨부파일</h3>
              </div>
              <div className="max-w-[960px] mx-auto space-y-3">
                {sermon.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-4 p-5 bg-white border border-[#E5E5E5] hover:border-[#C8C8C8] hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-[#F4F2EA] group-hover:bg-[#171717] transition-all">
                      <svg className="w-6 h-6 text-[#737373] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#2C2C2C] truncate">{attachment.originalFileName}</p>
                      <p className="text-sm text-[#737373] font-mono">
                        {attachment.fileSize ? `${(attachment.fileSize / 1024).toFixed(2)} KB` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => downloadFile(attachment.id, attachment.originalFileName)}
                      className="px-4 py-2 bg-[#171717] text-white hover:bg-black transition-colors flex items-center gap-2 text-sm font-bold"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      다운로드
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 하단 목록 버튼 ── */}
        <div className="p-8 md:p-12 lg:p-16 bg-[#F4F2EA] flex justify-start border-t border-[#E5E5E5]">
          <button
            onClick={() => navigate(backPath)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#FAF9F6] border border-[#E5E5E5] text-sm font-bold tracking-wider hover:bg-[#171717] hover:text-white transition-colors group"
          >
            <List size={18} />
            목록으로 돌아가기
          </button>
        </div>

      </div>

      {/* ── 수정 모달 ── */}
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
    </div>
  )
}

export default SermonDetailPage
