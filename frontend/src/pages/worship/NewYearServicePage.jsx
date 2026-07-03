import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PlayCircle, Play, DownloadSimple, FilePdf, YoutubeLogo, Quotes } from '@phosphor-icons/react'
import { fetchNewYear, updateNewYearLatestVideo, updateNewYearTranscript, updateNewYearScripture, uploadNewYearPdf } from '@/api/newYearApi'
import { downloadByPath } from '@/api/files'
import useAuthStore from '@/stores/authStore'
import useQuillEditor from '@/hooks/useQuillEditor.jsx'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import toast from '@/utils/toast'
import { formatTranscript } from '@/utils/formatTranscript'
import { getBiblePassage } from '@/api/bible'

function isEmptyTranscript(html) {
  if (!html) return true
  const trimmed = html.trim()
  return trimmed === '' || trimmed === '<p><br></p>'
}

// ─── 녹취록 편집 모달 ───────────────────────────────────────────
const TranscriptEditModal = ({ transcript, onSave, onClose, isSaving }) => {
  const [ready, setReady] = useState(false)

  const { containerRef, getHTML, LinkTooltip } = useQuillEditor({
    initialValue: transcript || '',
    onReady: () => setReady(true),
  })

  const handleSave = () => {
    const html = getHTML()
    if (isEmptyTranscript(html)) {
      if (!window.confirm('녹취본 내용이 비어있습니다. 계속하시겠습니까?')) return
    }
    onSave(html)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">녹취록 편집</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {!ready && (
            <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
              에디터 로딩 중...
            </div>
          )}
          <div
            ref={containerRef}
            className="min-h-[400px] border border-slate-200 rounded-lg overflow-hidden"
            style={{ display: ready ? 'block' : 'none' }}
          />
          <LinkTooltip />
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-200">
          <button
            type="button" onClick={handleSave} disabled={isSaving}
            className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 transition font-medium text-sm"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
          <button
            type="button" onClick={onClose}
            className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium text-sm"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}

async function handlePdfDownload(apiPath, filename = '설교원고.pdf') {
  try {
    await downloadByPath(apiPath, filename)
  } catch {
    toast.error('PDF 다운로드에 실패했습니다.')
  }
}

// ─── 영상 재생 모달 ───────────────────────────────────────────────
const VideoModal = ({ videoId, title, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-white/70 font-light truncate pr-4">{title}</p>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-white/70 hover:text-white transition-colors shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        </div>
      </div>
    </div>
  )
}

// ─── 본문 성경 구절 섹션 (다크 2단 패널) ──────────────────────────
const ScriptureSection = ({ scripture }) => {
  const ref = scripture?.trim()

  const { data } = useQuery({
    queryKey: ['bible-passage', ref],
    queryFn: () => getBiblePassage(ref),
    enabled: !!ref,
    staleTime: Infinity,
  })

  if (!data?.verses?.length) return null

  return (
    <section className="bg-[#171717] text-[#FAF9F6] border-b border-[#333]">
      <div className="max-w-[1600px] mx-auto border-x border-[#333] grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#333]">
        <div className="lg:col-span-4 p-8 md:p-16 lg:p-24 flex flex-col justify-center border-b lg:border-b-0 border-[#333]">
          <span className="text-xs font-mono text-[#A3A3A3] uppercase tracking-widest mb-6 block">Scripture Reading</span>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight break-keep">{ref}</h2>
          <p className="text-[#A3A3A3] font-light">본문 말씀</p>
        </div>

        <div className="lg:col-span-8 p-8 md:p-16 lg:p-24 bg-[#111]">
          <div className="max-w-3xl space-y-8 text-[17px] leading-relaxed font-light text-[#D4D4D4] break-keep">
            {data.verses.map((v) => (
              <p key={v.verse}>
                <sup className="text-xs text-[#737373] mr-1">{v.verse}</sup>{v.text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function NewYearServicePage() {
  const queryClient = useQueryClient()
  const { isAdminOrOperator: isAdminOrOperatorFn } = useAuthStore()
  const isAdmin = isAdminOrOperatorFn()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['worship', 'newyear'],
    queryFn: fetchNewYear,
    staleTime: Infinity,
  })

  const title            = data?.title            || '송구영신예배'
  const description      = data?.description      || '한 해를 보내고 새 해를 맞이하는 특별 예배'
  const latestVideoId    = data?.latestVideoId    ?? null
  const latestVideoTitle = data?.latestVideoTitle ?? null
  const transcript       = data?.transcript       ?? ''
  const pdfUrl           = data?.pdfUrl           ?? null
  const scripture        = data?.scripture        ?? ''

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [scriptureInput, setScriptureInput] = useState(scripture)

  useEffect(() => { setScriptureInput(scripture) }, [scripture])

  const saveTranscriptMutation = useMutation({
    mutationFn: updateNewYearTranscript,
    onSuccess: async (res) => {
      toast.success(res?.message ?? '저장되었습니다.')
      setIsModalOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['worship', 'newyear'] })
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e?.message ?? '녹취본 저장에 실패했습니다.'),
  })

  const updateVideoMutation = useMutation({
    mutationFn: updateNewYearLatestVideo,
    onSuccess: async (res) => {
      toast.success(res?.message ?? '최신 영상을 불러왔습니다.')
      await queryClient.invalidateQueries({ queryKey: ['worship', 'newyear'] })
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e?.message ?? '영상 업데이트에 실패했습니다.'),
  })

  const saveScriptureMutation = useMutation({
    mutationFn: updateNewYearScripture,
    onSuccess: async (res) => {
      toast.success(res?.message ?? '저장되었습니다.')
      await queryClient.invalidateQueries({ queryKey: ['worship', 'newyear'] })
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e?.message ?? '본문 참조 저장에 실패했습니다.'),
  })

  const uploadPdfMutation = useMutation({
    mutationFn: uploadNewYearPdf,
    onSuccess: async (res) => {
      toast.success(res?.message ?? 'PDF가 업로드되었습니다.')
      await queryClient.invalidateQueries({ queryKey: ['worship', 'newyear'] })
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e?.message ?? 'PDF 업로드에 실패했습니다.'),
  })

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <main className="pt-20 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-red-600 font-medium mb-2">데이터 로딩 실패</p>
        <p className="text-slate-600">{error?.message ?? '알 수 없는 오류'}</p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#2C2C2C]">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-[#171717] border-b border-[#E5E5E5]">
        <div className="max-w-[1600px] mx-auto border-x border-[#171717]">
          <div className="p-8 md:p-16 lg:p-24 xl:p-32 pt-28 md:pt-32 lg:pt-40 flex flex-col justify-center min-h-[60vh] bg-[#171717] relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'radial-gradient(#FAF9F6 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            />
            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#FAF9F6]/60 font-mono mb-8 block border border-[#FAF9F6]/20 px-4 py-2">
                New Year Worship Service
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tighter leading-[1.1] text-[#FAF9F6] mb-6 break-keep">
                {title}
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl font-light text-[#FAF9F6]/90 mb-12 break-keep">
                {description}
              </p>
              {scripture && (
                <div className="flex items-center justify-center gap-4 text-sm font-mono text-[#FAF9F6]/60 uppercase tracking-widest border-t border-[#FAF9F6]/20 pt-8">
                  <span>{scripture}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 관리자 컨트롤 ────────────────────────────────────────── */}
      {isAdmin && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="max-w-[1600px] mx-auto flex flex-wrap justify-end items-center gap-3">
            <input
              type="text"
              value={scriptureInput}
              onChange={(e) => setScriptureInput(e.target.value)}
              placeholder="본문 성경 참조 (예: 겔36:22-31)"
              className="px-3 py-2 rounded-lg border border-amber-300 text-sm w-56"
            />
            <button
              type="button"
              onClick={() => saveScriptureMutation.mutate({ scripture: scriptureInput.trim() })}
              disabled={saveScriptureMutation.isPending || scriptureInput.trim() === scripture}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium disabled:opacity-50"
            >
              {saveScriptureMutation.isPending ? '저장 중...' : '본문 참조 저장'}
            </button>
            <label className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              uploadPdfMutation.isPending
                ? 'bg-slate-400 text-white cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}>
              {uploadPdfMutation.isPending ? '업로드 중...' : 'PDF 업로드'}
              <input
                type="file" accept="application/pdf" className="hidden"
                disabled={uploadPdfMutation.isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  if (file.type !== 'application/pdf') { toast.error('PDF 파일만 업로드 가능합니다.'); return }
                  if (file.size > 10 * 1024 * 1024) { toast.error('파일 크기는 10MB 이하여야 합니다.'); e.target.value = ''; return }
                  uploadPdfMutation.mutate(file)
                  e.target.value = ''
                }}
              />
            </label>
            <button
              type="button" onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition text-sm font-medium"
            >
              녹취록 수정
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('YouTube에서 최신 영상을 불러오시겠습니까?')) updateVideoMutation.mutate()
              }}
              disabled={updateVideoMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-60"
            >
              {updateVideoMutation.isPending ? '불러오는 중...' : '최신 영상 불러오기'}
            </button>
          </div>
        </div>
      )}

      {/* ── 영상 섹션 ────────────────────────────────────────────── */}
      <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
        <div className="max-w-[1200px] mx-auto border-x border-[#E5E5E5] p-8 md:p-16 lg:p-24">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-4 block">Worship Video</span>
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-[#2C2C2C]">예배 영상</h2>
            {(latestVideoTitle || title) && (
              <p className="text-sm text-[#737373]">{latestVideoTitle || `${title} 영상`}</p>
            )}
          </div>

          {latestVideoId ? (
            <button
              type="button"
              onClick={() => setIsVideoOpen(true)}
              className="relative w-full aspect-video bg-[#171717] group cursor-pointer border border-[#171717] overflow-hidden block text-left"
            >
              <img
                src={`https://img.youtube.com/vi/${latestVideoId}/maxresdefault.jpg`}
                onError={(e) => {
                  const el = e.currentTarget
                  if (el.src.includes('maxresdefault')) el.src = `https://img.youtube.com/vi/${latestVideoId}/hqdefault.jpg`
                }}
                alt={latestVideoTitle || title}
                className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute top-0 left-0 w-full p-6 text-white text-left">
                <h3 className="font-bold text-lg leading-tight mb-1 truncate max-w-[80vw]">{latestVideoTitle || title}</h3>
                <p className="text-xs text-white/70">그리스도사랑교회</p>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-16 bg-[#FF0000] text-white flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <Play size={28} weight="fill" />
                </div>
              </div>

              <div className="absolute bottom-0 right-0 p-6">
                <span className="bg-black/80 text-white text-xs px-3 py-1.5 font-mono tracking-widest uppercase flex items-center gap-2 border border-white/20">
                  다음에서 보기: <YoutubeLogo size={18} weight="fill" />
                </span>
              </div>
            </button>
          ) : (
            <div className="w-full aspect-video bg-[#171717]/5 border border-[#E5E5E5] flex items-center justify-center">
              <div className="text-center">
                <PlayCircle size={48} className="text-[#A3A3A3] mb-4 mx-auto" />
                <p className="text-sm font-mono text-[#737373] tracking-widest uppercase">등록된 영상이 없습니다</p>
                {isAdmin && (
                  <p className="text-xs text-[#A3A3A3] mt-2">최신 영상 불러오기 버튼을 사용하세요</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {isVideoOpen && latestVideoId && (
        <VideoModal
          videoId={latestVideoId}
          title={latestVideoTitle || title}
          onClose={() => setIsVideoOpen(false)}
        />
      )}
        <ScriptureSection scripture={scripture} />

      {/* ── 설교 자료 PDF ────────────────────────────────────────── */}
      {pdfUrl && (
        <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
          <button
            type="button"
            onClick={() => handlePdfDownload(pdfUrl, `${title}_설교원고.pdf`)}
            className="w-full max-w-[1200px] mx-auto border-x border-[#E5E5E5] flex flex-col md:flex-row items-center justify-between p-6 md:px-12 lg:px-24 hover:bg-[#F4F2EA] transition-colors group text-left"
          >
            <div className="flex items-center gap-6 mb-4 md:mb-0">
              <div className="w-12 h-12 bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] flex items-center justify-center group-hover:bg-[#FAF9F6] transition-colors shrink-0">
                <FilePdf size={28} weight="fill" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-1 block">Sermon Material</span>
                <h4 className="font-bold text-lg text-[#2C2C2C]">설교 원고 PDF</h4>
                <p className="text-xs text-[#737373] mt-1">클릭하여 다운로드</p>
              </div>
            </div>
            <span className="w-full md:w-auto bg-[#171717] text-[#FAF9F6] px-8 py-4 text-xs font-bold tracking-[0.1em] uppercase flex items-center justify-center gap-3 group-hover:bg-[#2C2C2C] transition-colors">
              <DownloadSimple size={18} />
              다운로드
            </span>
          </button>
        </section>
      )}

      {/* ── 녹취록 ──────────────────────────────────────────────── */}
      {!isEmptyTranscript(transcript) ? (
        <>
          <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
            <div className="max-w-[1200px] mx-auto border-x border-[#E5E5E5] bg-[#FAF9F6]">
              <div className="p-8 md:p-16 lg:p-24 lg:px-32 border-b-2 border-[#171717] relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#171717]" />
                <Quotes size={48} weight="fill" className="text-[#E5E5E5] mb-10" />
                <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight break-keep">{title}</h2>
                <p className="text-lg text-[#737373] break-keep">{description}</p>
              </div>
            </div>
          </section>


          <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
            <div className="max-w-[1200px] mx-auto border-x border-[#E5E5E5] bg-white">
              <article className="p-8 md:p-16 lg:p-24 lg:px-32 text-[17px] text-[#2C2C2C] leading-[1.8] font-light break-keep pb-32">
                <div
                  className="ql-editor ql-output sermon-body newyear-sermon-body"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatTranscript(transcript)) }}
                />
              </article>
            </div>
          </section>
        </>
      ) : (
        !pdfUrl && (
          <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
            <div className="max-w-[1200px] mx-auto border-x border-[#E5E5E5] p-8 md:p-16 lg:p-24 flex flex-col items-center justify-center">
              <svg className="w-14 h-14 mb-4 text-[#E5E5E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-[#737373] font-light">아직 등록된 설교 자료가 없습니다</p>
              {isAdmin && (
                <p className="text-xs text-[#A3A3A3] mt-2">PDF 업로드 또는 녹취록 수정 버튼으로 자료를 등록할 수 있습니다</p>
              )}
            </div>
          </section>
        )
      )}

      {isEmptyTranscript(transcript) && <ScriptureSection scripture={scripture} />}

      {isModalOpen && (
        <TranscriptEditModal
          transcript={transcript}
          isSaving={saveTranscriptMutation.isPending}
          onSave={(html) => saveTranscriptMutation.mutate({ transcript: html })}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </main>
  )
}
