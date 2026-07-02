import DOMPurify from 'dompurify'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PlayCircle, DownloadSimple } from '@phosphor-icons/react'
import { fetchNewYear, updateNewYearLatestVideo, updateNewYearTranscript, uploadNewYearPdf } from '@/api/newYearApi'
import { downloadByPath } from '@/api/files'
import useAuthStore from '@/stores/authStore'
import useQuillEditor from '@/hooks/useQuillEditor.jsx'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import toast from '@/utils/toast'
import { formatTranscript } from '@/utils/formatTranscript'

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

const navItems = [
  { href: '#sermon-video', section: '00', title: '예배 영상' },
  { href: '#sermon-material', section: '01', title: '설교 자료 & 녹취록' },
]

const Sidebar = () => (
  <aside className="lg:col-span-3 bg-[#FAF9F6] hidden lg:block border-r border-[#E5E5E5]">
    <div
      className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto flex flex-col"
      style={{ scrollbarWidth: 'none' }}
    >
      <div className="p-8 lg:p-12 border-b border-[#E5E5E5]">
        <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#2C2C2C] font-mono block mb-2">Index</span>
        <span className="text-sm text-[#737373]">목차</span>
      </div>
      <nav className="flex-1 flex flex-col divide-y divide-[#E5E5E5]">
        {navItems.map(({ href, section, title }, i) => (
          <a
            key={href}
            href={href}
            className={`p-8 lg:px-12 py-6 hover:bg-[#F4F2EA] transition-colors group ${
              i === navItems.length - 1 ? 'border-b border-[#E5E5E5]' : ''
            }`}
          >
            <span className="text-[10px] font-mono text-[#737373] mb-2 block uppercase tracking-widest group-hover:text-[#2C2C2C] transition-colors">
              Section {section}
            </span>
            <h4 className="font-bold text-[#2C2C2C] break-keep text-sm">{title}</h4>
          </a>
        ))}
      </nav>
    </div>
  </aside>
)

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

  const [isModalOpen, setIsModalOpen] = useState(false)

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
            </div>
          </div>
        </div>
      </section>

      {/* ── 관리자 컨트롤 ────────────────────────────────────────── */}
      {isAdmin && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="max-w-[1600px] mx-auto flex justify-end gap-3">
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

      {/* ── Sidebar + Article ──────────────────────────────────── */}
      <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E5] border-x border-[#E5E5E5]">
          <Sidebar />

          <article className="lg:col-span-9 bg-[#FAF9F6] flex flex-col divide-y divide-[#E5E5E5]">
            {/* 영상 섹션 */}
            <div id="sermon-video" className="bg-[#171717] border-b border-[#E5E5E5] scroll-mt-20">
              <div className="p-8 md:p-16 lg:p-24 xl:px-32 xl:py-20 flex flex-col items-center">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#FAF9F6]/60 font-mono mb-6 block">Worship Video</span>
                <h2 className="text-2xl md:text-3xl font-bold text-[#FAF9F6] mb-8 break-keep">
                  {latestVideoTitle || `${title} 영상`}
                </h2>
                {latestVideoId ? (
                  <div className="w-full max-w-4xl aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${latestVideoId}`}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={latestVideoTitle || title}
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-4xl aspect-video bg-[#FAF9F6]/10 border border-[#FAF9F6]/20 flex items-center justify-center">
                    <div className="text-center">
                      <PlayCircle size={48} className="text-[#FAF9F6]/40 mb-4 mx-auto" />
                      <p className="text-sm font-mono text-[#FAF9F6]/50 tracking-widest uppercase">등록된 영상이 없습니다</p>
                      {isAdmin && (
                        <p className="text-xs text-[#FAF9F6]/30 mt-2">최신 영상 불러오기 버튼을 사용하세요</p>
                      )}
                    </div>
                  </div>
                )}
                <p className="text-sm text-[#FAF9F6]/40 mt-6 font-light">본 영상은 유튜브 임베드 형식으로 제공됩니다</p>
              </div>
            </div>

            {/* 설교 자료 & 녹취록 */}
            <div id="sermon-material" className="scroll-mt-20 flex flex-col divide-y divide-[#E5E5E5]">
              <div className="p-8 md:p-16 lg:p-24 xl:px-32 xl:py-16">
                <div className="flex items-center gap-4 mb-4">
                  <span className="w-8 h-px bg-[#2C2C2C]" />
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#2C2C2C] font-mono">Sermon Material</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2C2C2C]">설교 자료</h2>
              </div>

              {pdfUrl && (
                <div className="bg-[#F4F2EA] border-b border-[#E5E5E5] p-8 md:p-16 lg:p-24 xl:px-32 xl:py-20">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="flex-1">
                      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#2C2C2C] font-mono mb-4 block">PDF Document</span>
                      <h3 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-2 break-keep">설교 녹취록 PDF</h3>
                      <p className="text-[#737373] font-light">{title} 설교 녹취록 파일</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePdfDownload(pdfUrl, `${title}_설교원고.pdf`)}
                      className="inline-flex items-center gap-3 bg-[#171717] text-[#FAF9F6] px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-[#2C2C2C] transition-colors"
                    >
                      <DownloadSimple size={18} />
                      PDF 다운로드
                    </button>
                  </div>
                </div>
              )}

              {!isEmptyTranscript(transcript) ? (
                <div className="p-8 md:p-16 lg:p-24 xl:px-32 xl:py-24 pb-32">
                  <div
                    className="ql-editor ql-output sermon-body"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatTranscript(transcript)) }}
                  />
                </div>
              ) : (
                !pdfUrl && (
                  <div className="p-8 md:p-16 lg:p-24 xl:px-32 xl:py-24 flex flex-col items-center justify-center">
                    <svg className="w-14 h-14 mb-4 text-[#E5E5E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-[#737373] font-light">아직 등록된 설교 자료가 없습니다</p>
                    {isAdmin && (
                      <p className="text-xs text-[#A3A3A3] mt-2">PDF 업로드 또는 녹취록 수정 버튼으로 자료를 등록할 수 있습니다</p>
                    )}
                  </div>
                )
              )}
            </div>
          </article>
        </div>
      </section>

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
