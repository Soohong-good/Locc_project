import DOMPurify from 'dompurify'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from '@phosphor-icons/react'
import { getPopupDetail, createPopup, updatePopup, uploadPopupImage } from '@/api/popups'
import useQuillEditor from '@/hooks/useQuillEditor.jsx'

const TARGET_TYPES = [
  { value: 'ALL',         label: '전체' },
  { value: 'MEMBER_ONLY', label: '회원만' },
  { value: 'GUEST_ONLY',  label: '비회원만' },
]

const toInputValue = (dateStr) => (!dateStr ? '' : dateStr.slice(0, 16))

const INITIAL_FORM = {
  title:            '',
  displayStartDate: '',
  displayEndDate:   '',
  priority:         0,
  popupWidth:       500,
  popupHeight:      400,
  positionX:        100,
  positionY:        100,
  targetType:       'ALL',
  imageUrl:         '',
  linkUrl:          '',
}

// ── 팝업 미리보기 컴포넌트 ──────────────────────────────────────────────────
// 실제 팝업과 동일한 구조를 축소 비율로 렌더링
// PREVIEW_CANVAS: 미리보기 영역의 가상 화면 크기 (1280x720 기준)
const CANVAS_W = 1280
const CANVAS_H = 720

const PopupPreview = ({ form, contentHtml }) => {
  const previewRef = useRef(null)
  const [scale, setScale] = useState(1)

  // 컨테이너 크기에 맞게 scale 계산
  useEffect(() => {
    const el = previewRef.current
    if (!el) return
    const obs = new ResizeObserver(() => {
      const w = el.clientWidth
      setScale(w / CANVAS_W)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const w  = Math.max(100, form.popupWidth)
  const h  = Math.max(100, form.popupHeight)
  const px = Math.max(0,   form.positionX)
  const py = Math.max(0,   form.positionY)

  // 팝업이 캔버스 밖으로 나가면 클램프
  const clampedX = Math.min(px, Math.max(0, CANVAS_W - w))
  const clampedY = Math.min(py, Math.max(0, CANVAS_H - h))

  const hasContent = contentHtml && contentHtml !== '<p><br></p>'
  const hasImage   = form.imageUrl && form.imageUrl.trim()

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        미리보기 <span className="font-normal text-gray-400">(1280×720 기준)</span>
      </p>

      {/* 가상 화면 캔버스 */}
      <div
        ref={previewRef}
        className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
        style={{ paddingBottom: `${(CANVAS_H / CANVAS_W) * 100}%` }}
      >
        {/* 배경 — 실제 사이트처럼 보이도록 흐리게 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-300 text-xs select-none">사이트 화면 영역</div>
        </div>

        {/* 격자선 (위치 감각) */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width={CANVAS_W * scale} height={CANVAS_H * scale} patternUnits="userSpaceOnUse">
              <path
                d={`M ${80 * scale} 0 L 0 0 0 ${80 * scale}`}
                fill="none" stroke="#64748b" strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* 팝업 박스 */}
        <div
          className="absolute shadow-2xl overflow-hidden"
          style={{
            left:    clampedX * scale,
            top:     clampedY * scale,
            width:   w * scale,
            height:  h * scale,
            background: '#fff',
            borderRadius: 6 * scale,
            border: `${1 * scale}px solid #e2e8f0`,
          }}
        >
          {/* 닫기 버튼 (장식) */}
          <div
            className="absolute flex items-center justify-center bg-gray-700 text-white cursor-pointer z-10"
            style={{
              top:    4 * scale,
              right:  4 * scale,
              width:  18 * scale,
              height: 18 * scale,
              borderRadius: 3 * scale,
              fontSize: 10 * scale,
              lineHeight: 1,
            }}
          >
            ✕
          </div>

          {/* 이미지 */}
          {hasImage && (
            <div className="w-full" style={{ maxHeight: h * scale * 0.45, overflow: 'hidden' }}>
              <img
                src={form.imageUrl}
                alt=""
                className="w-full object-cover"
                style={{ maxHeight: h * scale * 0.45 }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
          )}

          {/* 내용 */}
          <div
            className="ql-editor overflow-hidden"
            style={{
              padding:  `${8 * scale}px`,
              fontSize: `${12 * scale}px`,
              lineHeight: 1.5,
              height: hasImage ? `${(h - h * 0.45) * scale}px` : `${h * scale}px`,
              boxSizing: 'border-box',
            }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(hasContent ? contentHtml : '<p style="color:#94a3b8">내용을 입력하면 여기에 표시됩니다</p>' )}}
          />
        </div>

        {/* 치수 라벨 */}
        <div
          className="absolute text-white rounded px-1"
          style={{
            left:       clampedX * scale,
            top:        (clampedY + h + 4) * scale,
            fontSize:   9 * scale,
            background: 'rgba(30,41,59,0.7)',
            whiteSpace: 'nowrap',
          }}
        >
          {w}×{h}px @ ({px},{py})
        </div>
      </div>

      {/* 실제 크기 정보 */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <span className="text-gray-400">크기</span>
          <p className="font-medium text-gray-700">{w} × {h} px</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <span className="text-gray-400">위치</span>
          <p className="font-medium text-gray-700">X:{px} / Y:{py}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <span className="text-gray-400">노출 대상</span>
          <p className="font-medium text-gray-700">
            {TARGET_TYPES.find(t => t.value === form.targetType)?.label ?? '-'}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <span className="text-gray-400">우선순위</span>
          <p className="font-medium text-gray-700">{form.priority}</p>
        </div>
      </div>
    </div>
  )
}

// ── 폼 모달 (팝업 등록/수정) ────────────────────────────────────────────────
// AdminPopupPage에서 등록/수정 버튼 클릭 시 오버레이로 렌더된다 (라우트 아님)
const AdminPopupFormPage = ({ popupId, onClose }) => {
  const isEdit      = Boolean(popupId)
  const queryClient = useQueryClient()

  const [form,        setForm]        = useState(INITIAL_FORM)
  const [errors,      setErrors]      = useState({})
  const [previewHtml, setPreviewHtml] = useState('')  // 미리보기용 HTML (Quill onChange로 즉시 갱신)

  // Quill 준비 전에 detail이 먼저 도착한 경우를 위한 대기 content
  const pendingContentRef = useRef(null)

  // ESC 키 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // ── 수정 모드: 기존 데이터 로드 ──
  const { data: detail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['admin', 'popups', popupId],
    queryFn:  () => getPopupDetail(popupId),
    enabled:  isEdit,
  })

  // ── Quill 에디터 ──
  const handleUpload = useCallback((file) => uploadPopupImage(file), [])

  // Quill 초기화 완료 콜백 — 대기 중인 content를 주입
  const handleReady = useCallback(() => {
    if (pendingContentRef.current !== null) {
      // containerRef.current 안의 .ql-editor에 직접 주입 (setHTML ref 안정성 보장)
      const editor = containerRef.current?.querySelector('.ql-editor')
      if (editor) {
        editor.innerHTML = DOMPurify.sanitize(pendingContentRef.current || '')
        setPreviewHtml(pendingContentRef.current)
      }
      pendingContentRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { containerRef, getHTML, LinkTooltip } = useQuillEditor({
    onImageUpload: handleUpload,
    onReady: handleReady,
    onChange: setPreviewHtml,  // 내용 변경 시 즉시 미리보기 갱신 (폴링 제거)
  })

  // 수정 모드: 데이터 로드 후 폼 + 에디터 초기값 세팅
  useEffect(() => {
    if (!detail) return
    setForm({
      title:            detail.title            ?? '',
      displayStartDate: toInputValue(detail.displayStartDate),
      displayEndDate:   toInputValue(detail.displayEndDate),
      priority:         detail.priority         ?? 0,
      popupWidth:       detail.popupWidth        ?? 500,
      popupHeight:      detail.popupHeight       ?? 400,
      positionX:        detail.positionX         ?? 100,
      positionY:        detail.positionY         ?? 100,
      targetType:       detail.targetType        ?? 'ALL',
      imageUrl:         detail.imageUrl          ?? '',
      linkUrl:          detail.linkUrl           ?? '',
    })

    const content = detail.content ?? ''

    // setHTML 즉시 시도 — Quill이 이미 초기화된 경우 (페이지 재방문 등)
    const editor = containerRef.current?.querySelector('.ql-editor')
    if (editor) {
      editor.innerHTML = DOMPurify.sanitize(content || '')
      setPreviewHtml(content)
    } else {
      // Quill 미초기화 상태 → onReady 콜백에서 주입
      pendingContentRef.current = content
    }
  }, [detail])

  // ── 뮤테이션 ──
  const mutation = useMutation({
    mutationFn: (params) =>
      isEdit ? updatePopup({ id: popupId, formData: params }) : createPopup(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'popups'] })
      onClose()
    },
  })

  // ── 유효성 검사 ──
  const validate = (html) => {
    const errs = {}
    if (!form.title.trim())       errs.title = '제목을 입력해주세요'
    if (!html)                    errs.content = '내용을 입력해주세요'
    if (!form.displayStartDate)   errs.displayStartDate = '노출 시작일을 선택해주세요'
    if (!form.displayEndDate)     errs.displayEndDate = '노출 종료일을 선택해주세요'
    if (form.displayStartDate && form.displayEndDate && form.displayStartDate >= form.displayEndDate) {
      errs.displayEndDate = '종료일은 시작일 이후여야 합니다'
    }
    return errs
  }

  // ── 제출 ──
  const handleSubmit = () => {
    const html = getHTML()
    const errs = validate(html)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})

    const params = new URLSearchParams()
    Object.entries({ ...form, content: html }).forEach(([key, val]) => {
      if (val !== '' && val !== null && val !== undefined) {
        params.append(key, val)
      }
    })
    mutation.mutate(params)
  }

  const field = (label, name, type = 'text', extra = {}) => (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-[#45474c]">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) =>
          setForm((f) => ({ ...f, [name]: type === 'number' ? Number(e.target.value) : e.target.value }))
        }
        className={`w-full h-11 px-3 bg-[#eff4ff] border rounded-lg text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#091426] focus:border-transparent transition-all ${
          errors[name] ? 'border-[#ba1a1a]' : 'border-[#c5c6cd]'
        }`}
        {...extra}
      />
      {errors[name] && <p className="text-xs text-[#ba1a1a]">{errors[name]}</p>}
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <LinkTooltip />

      <div className="bg-white w-full max-w-[1200px] max-h-[90vh] rounded-xl shadow-xl overflow-hidden flex flex-col border border-[#c5c6cd]">

        {/* 헤더 */}
        <header className="flex justify-between items-center px-6 py-4 border-b border-[#c5c6cd] shrink-0">
          <h1 className="text-lg font-semibold text-[#0b1c30]">{isEdit ? '팝업 수정' : '팝업 등록'}</h1>
          <button onClick={onClose} className="p-1.5 text-[#45474c] hover:bg-[#eff4ff] rounded-full transition-colors">
            <X size={20} />
          </button>
        </header>

        {isEdit && isDetailLoading ? (
          <div className="p-16 text-sm text-[#45474c] text-center">불러오는 중...</div>
        ) : (
          <>
            {/* 본문: 폼 + 미리보기 (각각 독립 스크롤 — 미리보기가 폼 스크롤에 밀려 사라지지 않도록) */}
            <div className="flex-1 min-h-0 flex flex-col lg:flex-row">

              {/* 좌측: 폼 */}
              <section className="flex-1 min-h-0 overflow-y-auto p-6 pb-12 space-y-5 border-r border-[#c5c6cd]">

                {field('제목', 'title')}

                {/* 내용 — Quill 에디터 */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#45474c]">
                    내용 <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className={`border rounded-lg overflow-hidden bg-white ${errors.content ? 'border-[#ba1a1a]' : 'border-[#c5c6cd]'}`}>
                    <div ref={containerRef} style={{ minHeight: '200px' }} className="text-sm" />
                  </div>
                  {errors.content && <p className="text-xs text-[#ba1a1a]">{errors.content}</p>}
                </div>

                {/* 노출 기간 */}
                <div className="grid grid-cols-2 gap-4">
                  {field('노출 시작일', 'displayStartDate', 'datetime-local')}
                  {field('노출 종료일', 'displayEndDate', 'datetime-local')}
                </div>

                {/* 노출 대상 / 우선순위 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[#45474c]">노출 대상</label>
                    <select
                      value={form.targetType}
                      onChange={(e) => setForm((f) => ({ ...f, targetType: e.target.value }))}
                      className="w-full h-11 px-3 bg-[#eff4ff] border border-[#c5c6cd] rounded-lg text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#091426] focus:border-transparent transition-all"
                    >
                      {TARGET_TYPES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  {field('우선순위 (숫자가 클수록 우선)', 'priority', 'number', { min: 0 })}
                </div>

                {/* 팝업 크기 / 위치 */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#45474c]">팝업 크기 / 위치 (px)</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {field('너비', 'popupWidth',  'number', { min: 100 })}
                    {field('높이', 'popupHeight', 'number', { min: 100 })}
                    {field('X 위치', 'positionX', 'number', { min: 0 })}
                    {field('Y 위치', 'positionY', 'number', { min: 0 })}
                  </div>
                </div>

                {/* 이미지 URL / 링크 URL */}
                {field('이미지 URL (선택)', 'imageUrl')}
                {field('링크 URL (선택)',   'linkUrl')}

                {mutation.error && (
                  <p className="text-sm text-[#ba1a1a] bg-[#ffdad6] rounded-lg px-4 py-3">
                    저장 중 오류가 발생했습니다.
                  </p>
                )}
              </section>

              {/* 우측: 미리보기 — 폼과 별도 스크롤 컨테이너라 항상 그대로 보임 */}
              <aside className="w-full lg:w-[400px] min-h-0 overflow-y-auto p-6 bg-[#eff4ff] flex flex-col gap-6">
                <PopupPreview form={form} contentHtml={previewHtml} />
              </aside>
            </div>

            {/* 푸터 */}
            <footer className="px-6 py-4 bg-white border-t border-[#c5c6cd] flex justify-end gap-3 shrink-0">
              <button
                onClick={onClose}
                className="px-6 h-11 text-sm font-semibold text-[#0b1c30] border border-[#c5c6cd] rounded-lg hover:bg-[#eff4ff] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="px-6 h-11 text-sm font-semibold rounded-lg bg-[#091426] text-white hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
              >
                {mutation.isPending ? '저장 중...' : isEdit ? '수정 완료' : '등록'}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminPopupFormPage
