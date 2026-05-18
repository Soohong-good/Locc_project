import DOMPurify from 'dompurify'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
    <div className="sticky top-6">
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

// ── 메인 페이지 ─────────────────────────────────────────────────────────────
const AdminPopupFormPage = () => {
  const { id }      = useParams()
  const isEdit      = Boolean(id)
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const [form,        setForm]        = useState(INITIAL_FORM)
  const [errors,      setErrors]      = useState({})
  const [previewHtml, setPreviewHtml] = useState('')  // 미리보기용 HTML (폴링)

  // Quill 준비 전에 detail이 먼저 도착한 경우를 위한 대기 content
  const pendingContentRef = useRef(null)

  // ── 수정 모드: 기존 데이터 로드 ──
  const { data: detail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['admin', 'popups', id],
    queryFn:  () => getPopupDetail(id),
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

  const { containerRef, getHTML, setHTML, LinkTooltip } = useQuillEditor({
    onImageUpload: handleUpload,
    onReady: handleReady,
  })

  // Quill 내용 → 미리보기 폴링 (500ms)
  useEffect(() => {
    const id = setInterval(() => {
      setPreviewHtml(getHTML())
    }, 500)
    return () => clearInterval(id)
  }, [getHTML])

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
      isEdit ? updatePopup({ id, formData: params }) : createPopup(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'popups'] })
      navigate('/admin/popups')
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
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) =>
          setForm((f) => ({ ...f, [name]: type === 'number' ? Number(e.target.value) : e.target.value }))
        }
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[name] ? 'border-red-400' : 'border-gray-300'
        }`}
        {...extra}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  )

  if (isEdit && isDetailLoading) {
    return <div className="p-8 text-sm text-gray-400">불러오는 중...</div>
  }

  return (
    <div className="p-8">
      <LinkTooltip />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{isEdit ? '팝업 수정' : '팝업 등록'}</h1>
      </div>

      {/* ── 2컬럼 레이아웃: 폼 + 미리보기 ── */}
      <div className="flex gap-8 items-start">

        {/* 좌측: 폼 */}
        <div className="flex-1 min-w-0 max-w-xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

            {/* 제목 */}
            {field('제목', 'title')}

            {/* 내용 — Quill 에디터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                내용 <span className="text-red-500">*</span>
              </label>
              <div className={`border rounded-lg overflow-hidden ${errors.content ? 'border-red-400' : 'border-gray-300'}`}>
                <div ref={containerRef} style={{ minHeight: '200px' }} className="text-sm" />
              </div>
              {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
            </div>

            {/* 노출 기간 */}
            <div className="grid grid-cols-2 gap-4">
              {field('노출 시작일', 'displayStartDate', 'datetime-local')}
              {field('노출 종료일', 'displayEndDate', 'datetime-local')}
            </div>

            {/* 노출 대상 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">노출 대상</label>
              <select
                value={form.targetType}
                onChange={(e) => setForm((f) => ({ ...f, targetType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TARGET_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* 우선순위 */}
            {field('우선순위 (숫자가 클수록 위에 노출)', 'priority', 'number', { min: 0 })}

            {/* 팝업 크기 / 위치 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">팝업 크기 / 위치 (px)</p>
              <div className="grid grid-cols-2 gap-4">
                {field('너비', 'popupWidth',  'number', { min: 100 })}
                {field('높이', 'popupHeight', 'number', { min: 100 })}
                {field('X 위치', 'positionX', 'number', { min: 0 })}
                {field('Y 위치', 'positionY', 'number', { min: 0 })}
              </div>
            </div>

            {/* 이미지 URL / 링크 URL */}
            {field('이미지 URL (선택)', 'imageUrl')}
            {field('링크 URL (선택)',   'linkUrl')}
          </div>

          {/* 에러 */}
          {mutation.error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
              저장 중 오류가 발생했습니다.
            </p>
          )}

          {/* 버튼 */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? '저장 중...' : isEdit ? '수정 완료' : '등록'}
            </button>
            <button
              onClick={() => navigate('/admin/popups')}
              className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
          </div>
        </div>

        {/* 우측: 미리보기 */}
        <div className="w-[520px] shrink-0">
          <PopupPreview form={form} contentHtml={previewHtml} />
        </div>

      </div>
    </div>
  )
}

export default AdminPopupFormPage
