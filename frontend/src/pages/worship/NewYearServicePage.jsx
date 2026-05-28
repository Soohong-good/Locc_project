import DOMPurify from 'dompurify'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNewYear, updateNewYearLatestVideo, updateNewYearTranscript, uploadNewYearPdf } from '@/api/newYearApi'
import { downloadByPath } from '@/api/files'
import useAuthStore from '@/stores/authStore'
import useQuillEditor from '@/hooks/useQuillEditor.jsx'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import toast from '@/utils/toast'

function isEmptyTranscript(html) {
  if (!html) return true
  const trimmed = html.trim()
  return trimmed === '' || trimmed === '<p><br></p>'
}

// ─── 녹취록 편집 모달 ──────────────────────────────────────────────
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

// ─── 녹취록 텍스트 전처리 ──────────────────────────────────────────
/**
 * 설교 녹취록 HTML을 구조화된 HTML로 변환합니다.
 *
 * [에디터로 저장된 경우] p태그가 여러 개 → 그대로 반환
 * [텍스트로 저장된 경우] 아래 규칙으로 구조화:
 *
 *   빈 줄          → 단락 구분
 *   서론/본론       → <h2> 섹션 헤더
 *   결론-...        → <h2> 섹션 헤더
 *   1. 2. 3.        → <h3> 대항목 (굵게)
 *   1) 2) 3) 4)     → <p class="sermon-sub"> 소항목
 *   책명장:절 "..." → <p class="sermon-ref"> + <blockquote class="sermon-quote">
 *   "..."           → <blockquote class="sermon-quote">
 *   -설명문         → <p class="sermon-desc"> 들여쓰기 설명
 *   그 외           → <p class="sermon-p"> 일반 단락
 */
/** XSS 방지: 텍스트 노드를 HTML에 삽입하기 전 이스케이프 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function formatTranscript(html) {
  if (!html) return html

  // 에디터로 저장된 구조화 데이터 → 그대로 반환
  // 단, Quill이 생성한 <p><span style=...> 패턴은 재처리 필요
  const pCount = (html.match(/<p[\s>]/gi) || []).length
  const isQuillHtml = html.includes('<span style=') || html.includes('<span class=')
  if (pCount > 1 && !isQuillHtml) return html

  // Quill HTML인 경우 — 태그 제거 후 텍스트만 추출하여 재처리
  let rawText = html
  if (isQuillHtml) {
    rawText = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')   // 나머지 태그 제거
      .replace(/&nbsp;/g, ' ')
      .trim()
    // Quill HTML 경로는 rawText를 단락으로 감싸서 재처리
    const lines2 = rawText.split('\n').map(l => l.trim())
    const result2 = []
    for (const line of lines2) {
      if (!line) continue
      result2.push(`<p class="sermon-p">${escapeHtml(line)}</p>`)
    }
    return result2.join('\n')
  }

  // 내부 텍스트 추출
  const inner = html
    .replace(/^<p[^>]*>/i, '')
    .replace(/<\/p>$/i, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .trim()

  // 리터럴 \n 문자열(DB 저장 아티팩트)을 실제 줄바꿈으로 변환
  const normalized = inner.replace(/\\n/g, '\n')

  // 줄 단위로 분리
  const lines = normalized.split('\n').map((l) => l.trim())

  const result = []
  let titleDone = false  // 첫 타이틀 블록 처리 여부

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // 빈 줄 → 스킵
    if (line === '') continue

    // ── 첫 번째 타이틀 블록 ──────────────────────────────────────
    // 날짜+예배명 (예: "12.31, 2025. 송구영신예배") → sermon-title
    // 주제 성구 (예: "하나님의 거룩한 이름을 위함이라(겔36:22-31)") → sermon-verse
    // 두 줄이 연속으로 나오는 구조 → 서론이 나오기 전까지 타이틀 블록으로 처리
    if (!titleDone) {
      // 날짜 패턴으로 시작하면 타이틀
      if (/^\d+\.\d+/.test(line)) {
        result.push(`<p class="sermon-title-date">${escapeHtml(line)}</p>`)
        continue
      }
      // 서론/본론/결론/숫자항목이 아니고 타이틀 아직 안 끝났으면 주제 성구
      if (!/^(서론|본론|결론)/.test(line) && !/^[1-9]/.test(line) && !/^[-"]/.test(line)) {
        result.push(`<p class="sermon-title-verse">${escapeHtml(line)}</p>`)
        continue
      }
      titleDone = true
    }

    // 서론 / 본론
    if (/^(서론|본론)\s*$/.test(line)) {
      result.push(`<h2 class="sermon-section">${escapeHtml(line)}</h2>`)
      continue
    }

    // 결론-... (결론 뒤에 설명이 붙는 형태)
    if (/^결론/.test(line)) {
      result.push(`<h2 class="sermon-section">${escapeHtml(line)}</h2>`)
      continue
    }

    // 1. 2. 3. 대항목
    if (/^[1-9]\d*\.[가-힣]/.test(line)) {
      result.push(`<h3 class="sermon-h3">${escapeHtml(line)}</h3>`)
      continue
    }

    // 1) 2) 3) 소항목
    if (/^[1-9]\d*\)[가-힣]/.test(line)) {
      result.push(`<p class="sermon-sub">${escapeHtml(line)}</p>`)
      continue
    }

    // 책명+장절 "인용" — 예: 딤후3:1-2 "...", 시145:1 "..."
    const refQuoteMatch = line.match(/^([가-힣]{1,4}\d+:\d+[\d\-,b]*)\s+([""\u201c].+)$/)
    if (refQuoteMatch) {
      result.push(`<p class="sermon-ref">${escapeHtml(refQuoteMatch[1])}</p>`)
      result.push(`<blockquote class="sermon-quote">${escapeHtml(refQuoteMatch[2])}</blockquote>`)
      continue
    }

    // 큰따옴표로 시작하는 인용 (책명 없이)
    if (/^[""\u201c]/.test(line)) {
      result.push(`<blockquote class="sermon-quote">${escapeHtml(line)}</blockquote>`)
      continue
    }

    // - 설명문
    if (/^-[가-힣]/.test(line)) {
      result.push(`<p class="sermon-desc">${escapeHtml(line)}</p>`)
      continue
    }

    // 일반 단락
    result.push(`<p class="sermon-p">${escapeHtml(line)}</p>`)
  }

  return result.join('\n')
}

// ─── PDF 다운로드 핸들러 ───────────────────────────────────────────
async function handlePdfDownload(apiPath, filename = '설교원고.pdf') {
  try {
    await downloadByPath(apiPath, filename)
  } catch {
    toast.error('PDF 다운로드에 실패했습니다.')
  }
}

// ─── 메인 페이지 ───────────────────────────────────────────────────
export default function NewYearServicePage() {
  const queryClient = useQueryClient()
  const { isAdminOrOperator: isAdminOrOperatorFn } = useAuthStore()
  const isAdmin = isAdminOrOperatorFn()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['worship', 'newyear'],
    queryFn: fetchNewYear,
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
    <main className="pt-page pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-red-600 font-medium mb-2">데이터 로딩 실패</p>
        <p className="text-slate-600">{error?.message ?? '알 수 없는 오류'}</p>
      </div>
    </main>
  )

  return (
    <main>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section
        className="pt-page pb-20 text-white px-6 relative"
        style={{
          backgroundImage: 'url(/newYearPage.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-900/65 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-xs tracking-[0.4em] text-eyebrow uppercase mb-4">
            New Year Worship Service
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-5">{title}</h1>
          <div className="w-12 h-px bg-slate-400 mx-auto mb-5" />
          <p className="text-lg text-slate-300 font-light">{description}</p>
        </div>
      </section>

      {/* ── 관리자 컨트롤 ──────────────────────────────────────── */}
      {isAdmin && (
        <section className="py-3 bg-amber-50 border-b border-amber-200 px-6">
          <div className="max-w-5xl mx-auto flex justify-end gap-3">
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
              onClick={() => { if (window.confirm('YouTube에서 최신 영상을 불러오시겠습니까?')) updateVideoMutation.mutate() }}
              disabled={updateVideoMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-60"
            >
              {updateVideoMutation.isPending ? '불러오는 중...' : '최신 영상 불러오기'}
            </button>
          </div>
        </section>
      )}

      {/* ── 예배 영상 ───────────────────────────────────────────── */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-3">Worship Video</p>
            <h2 className="text-3xl font-light text-slate-900">예배 영상</h2>
            {latestVideoTitle && <p className="mt-3 text-base text-slate-500">{latestVideoTitle}</p>}
          </div>
          {latestVideoId ? (
            <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden shadow-xl">
              <iframe
                src={`https://www.youtube.com/embed/${latestVideoId}`}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen title={latestVideoTitle || '예배 영상'}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-xl border border-slate-200">
              <svg className="w-14 h-14 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-slate-500 text-sm">아직 등록된 영상이 없습니다</p>
              {isAdmin && <p className="text-xs text-slate-400 mt-2">관리자 페이지에서 YouTube 재생목록을 설정하고 영상을 불러오세요</p>}
            </div>
          )}
        </div>
      </section>

      {/* ── 설교 자료 ─────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#faf9f7' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-3">Sermon Material</p>
            <h2 className="text-3xl font-light text-slate-900">설교 자료</h2>
          </div>

          {/* PDF 다운로드 카드 (있을 때만 표시) */}
          {pdfUrl && (
            <div className="mb-8 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-6 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">설교 원고 PDF</p>
                  <p className="text-xs text-slate-400 mt-0.5">클릭하여 다운로드</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handlePdfDownload(pdfUrl, `${title}_설교원고.pdf`)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 transition font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                다운로드
              </button>
            </div>
          )}

          {/* 녹취록 본문 */}
          {!isEmptyTranscript(transcript) ? (
            <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-300" />
              <div className="px-8 md:px-10 py-10">
                <svg className="w-10 h-10 text-slate-200 mb-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <div
                  className="sermon-body"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatTranscript(transcript)) }}
                />
              </div>
            </article>
          ) : (
            !pdfUrl && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
                <svg className="w-14 h-14 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-500 text-sm">아직 등록된 설교 자료가 없습니다</p>
                {isAdmin && <p className="text-xs text-slate-400 mt-2">PDF 업로드 또는 녹취록 수정 버튼으로 자료를 등록할 수 있습니다</p>}
              </div>
            )
          )}
        </div>
      </section>

      {/* ── 녹취록 편집 모달 ────────────────────────────────────── */}
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
