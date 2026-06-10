import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffApi } from '@/api/staff'
import { uploadSermonImage } from '@/api/sermons'
import { downloadFile } from '@/api/files'
import client from '@/api/client'
import useQuillEditor from '@/hooks/useQuillEditor.jsx'
import { DateInput } from '@/components/ui/DateInput'
import toast from '@/utils/toast'

/**
 * 설교 등록/수정 공통 모달
 *
 * ※ Quill 초기화:
 *   isOpen=true 가 될 때마다 SermonModalInner 를 key로 재마운트 →
 *   useQuillEditor 의 useEffect([], mount 1회) 가 새 DOM에서 실행됨
 */

const DEFAULTS = {
  title: '',
  scripture: '',
  preacher: '',
  sermonDate: '',
  videoUrl: '',
  serviceNumber: '',
}

// ── 내부 컴포넌트 (key 재마운트 대상) ──────────────────────────────
const SermonModalInner = ({
  onClose, onSave, isSaving,
  editTarget, fixedCategory,
  serviceNumberOptions, defaultServiceNumber,
  ministers,
}) => {
  const [form, setForm]   = useState(() => {
    if (editTarget) {
      return {
        title:         editTarget.title         ?? '',
        scripture:     editTarget.scripture     ?? '',
        preacher:      editTarget.preacher      ?? '',
        sermonDate:    editTarget.sermonDate     ?? '',
        videoUrl:      editTarget.videoUrl      ?? '',
        serviceNumber: editTarget.serviceNumber ?? defaultServiceNumber ?? '',
      }
    }
    return { ...DEFAULTS, serviceNumber: defaultServiceNumber ?? '' }
  })
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  // 기존 첨부파일 상태 (수정 모드)
  const [existingAttachments, setExistingAttachments] = useState(
    editTarget?.attachments ?? []
  )
  const [deletingFileId, setDeletingFileId] = useState(null)

  const handleDeleteAttachment = async (fileId) => {
    if (!confirm('이 첨부파일을 삭제하시겠습니까?')) return
    setDeletingFileId(fileId)
    try {
      await client.delete(`/api/files/${fileId}`)
      setExistingAttachments((prev) => prev.filter((a) => a.id !== fileId))
    } catch {
      toast.error('파일 삭제에 실패했습니다.')
    } finally {
      setDeletingFileId(null)
    }
  }

  // 원본 setupPreacherSelect() 로직:
  // - 교역자 select로 선택 시 → readOnly + bg-slate-100
  // - 직접입력 선택 시 → 편집 가능 + bg-slate-50
  const [preacherReadOnly, setPreacherReadOnly] = useState(() => {
    if (!editTarget?.preacher) return false
    // 수정 모드: 기존 설교자가 교역자 목록에 있으면 readOnly 시작
    return ministers.some(
      (m) => `${m.name} ${m.displayPosition}` === editTarget.preacher
    )
  })

  const { containerRef, getHTML, setHTML, LinkTooltip } = useQuillEditor({
    onImageUpload: uploadSermonImage,
  })

  useEffect(() => {
    if (!editTarget?.content) return
    const timer = setTimeout(() => setHTML(editTarget.content), 150)
    return () => clearTimeout(timer)
  }, [editTarget, setHTML])

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  // 원본 setupPreacherSelect() 이벤트 핸들러 그대로 이식
  const handlePreacherSelect = (e) => {
    const val = e.target.value
    // select를 항상 초기값으로 리셋 (원본: this.value = '')
    e.target.value = ''

    if (val === '__DIRECT__') {
      // 직접입력 선택: input 비우고, 편집 가능, bg-slate-50
      setForm((p) => ({ ...p, preacher: '' }))
      setPreacherReadOnly(false)
    } else if (val) {
      // 교역자 선택: 이름+직분 표시, readOnly, bg-slate-100
      setForm((p) => ({ ...p, preacher: val }))
      setPreacherReadOnly(true)
    }
  }

  const handleSubmit = () => {
    setError('')
    const content = getHTML()
    if (!form.title.trim())    return setError('설교 제목을 입력해주세요.')
    if (!form.scripture.trim()) return setError('성경 구절을 입력해주세요.')
    if (!form.preacher.trim()) return setError('설교자를 입력해주세요.')
    if (!form.sermonDate)      return setError('설교 날짜를 선택해주세요.')
    if (!content)              return setError('설교 내용을 입력해주세요.')

    const fd = new FormData()
    fd.append('title',      form.title.trim())
    fd.append('scripture',  form.scripture.trim())
    fd.append('preacher',   form.preacher.trim())
    fd.append('sermonDate', form.sermonDate)
    fd.append('category',   fixedCategory)
    fd.append('content',    content)
    if (form.videoUrl.trim()) fd.append('videoUrl', form.videoUrl.trim())
    if (serviceNumberOptions && form.serviceNumber)
      fd.append('serviceNumber', form.serviceNumber)
    files.forEach((f) => fd.append('files', f))
    onSave(fd)
  }

  const handleFileChange = (e) => setFiles(Array.from(e.target.files))
  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const isEdit      = !!editTarget
  const labelPrefix = fixedCategory === '훈련용메시지' ? '메시지' : '설교'

  const selectStyle = {
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight: '28px',
  }

  return (
    <>
      {/* quill-custom CSS 인라인 주입 (타임리프 /css/common/quill-custom.css 동일) */}
      <style>{`
        .ql-snow .ql-picker.ql-size .ql-picker-label::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item::before { content: '16px'; }
        ${['10px','12px','14px','16px','18px','20px','24px','28px','32px','36px'].map(s => `
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="${s}"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="${s}"]::before { content: '${s}'; font-size: ${s} !important; }
        .ql-editor .ql-size-${s.replace('px','px')} { font-size: ${s}; }
        `).join('')}
        .ql-tooltip { display: none !important; }
        .ql-container { min-height: 280px; font-size: 16px; border-color: #e2e8f0 !important; }
        .ql-editor    { min-height: 280px; background-color: #f8fafc; font-family: inherit; }
        .ql-editor:focus { background-color: #fff; }
        .ql-toolbar   { background-color: #fff; border-color: #e2e8f0 !important; }
        .ql-editor a  { color: #2563eb !important; text-decoration: underline !important; }
        .ql-editor .ql-align-center { text-align: center !important; }
        .ql-editor .ql-align-right  { text-align: right  !important; }
        .ql-editor .ql-align-justify{ text-align: justify!important; }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

          {/* 헤더 */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-medium text-slate-900">
                {isEdit ? `${labelPrefix} 수정` : `새 ${labelPrefix} 등록`}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">{fixedCategory}</p>
            </div>
            <button onClick={onClose}
              className="text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-50 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">

            {/* 제목 / 성경구절 */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  {labelPrefix} 제목 <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.title} onChange={handleChange('title')}
                  placeholder="제목을 입력하세요"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 outline-none transition text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  성경 구절 <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.scripture} onChange={handleChange('scripture')}
                  placeholder="예: 요한복음 3:16"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 outline-none transition text-sm" />
              </div>
            </div>

            {/* 설교자 / 날짜 */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  {fixedCategory === '훈련용메시지' ? '강사' : '설교자'} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {/* 원본: readOnly + bg 전환 (populatePreacherSelect / setupPreacherSelect 로직) */}
                  <input
                    type="text"
                    value={form.preacher}
                    onChange={preacherReadOnly ? undefined : handleChange('preacher')}
                    readOnly={preacherReadOnly}
                    placeholder={preacherReadOnly ? '설교자 이름' : '이름 직접 입력'}
                    className={`flex-1 px-3 py-2.5 border border-slate-200 focus:border-slate-800 outline-none transition text-sm
                      ${preacherReadOnly
                        ? 'bg-slate-100 cursor-default'
                        : 'bg-slate-50 focus:bg-white'
                      }`}
                  />
                  {/* 원본: 이름 + displayPosition 조합, 선택 후 select 초기화 */}
                  <select
                    onChange={handlePreacherSelect}
                    defaultValue=""
                    style={selectStyle}
                    className="w-36 px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 outline-none transition text-sm appearance-none"
                  >
                    <option value="">교역자 선택</option>
                    {ministers.map((m) => {
                      const displayText = `${m.name} ${m.displayPosition}`
                      return <option key={m.id} value={displayText}>{displayText}</option>
                    })}
                    <option value="__DIRECT__">직접 입력</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  날짜 <span className="text-red-500">*</span>
                </label>
                <DateInput
                  value={form.sermonDate}
                  onChange={(v) => setForm((p) => ({ ...p, sermonDate: v }))}
                  placeholder="설교 날짜 선택"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* 카테고리 / 부 구분 */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">카테고리</label>
                <input type="text" value={fixedCategory} readOnly
                  className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 text-slate-500 text-sm cursor-not-allowed" />
              </div>
              {serviceNumberOptions && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    구분 <span className="text-red-500">*</span>
                  </label>
                  <select value={form.serviceNumber} onChange={handleChange('serviceNumber')}
                    style={selectStyle}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 outline-none transition text-sm appearance-none">
                    <option value="">선택하세요</option>
                    {serviceNumberOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 유튜브 URL */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">유튜브 영상 URL</label>
              <input type="url" value={form.videoUrl} onChange={handleChange('videoUrl')}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 outline-none transition text-sm" />
            </div>

            {/* Quill 에디터 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                {labelPrefix} 내용 <span className="text-red-500">*</span>
              </label>
              <div ref={containerRef} />
            </div>

            {/* 파일 첨부 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">파일 첨부</label>

              {/* 기존 첨부파일 (수정 모드) */}
              {existingAttachments.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  <p className="text-xs text-slate-500">기존 첨부파일</p>
                  {existingAttachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-200 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <button
                          type="button"
                          onClick={() => downloadFile(att.id, att.originalFileName)}
                          className="truncate text-blue-700 hover:underline text-left"
                        >
                          {att.originalFileName}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAttachment(att.id)}
                        disabled={deletingFileId === att.id}
                        className="ml-2 text-red-400 hover:text-red-600 transition flex-shrink-0 disabled:opacity-40"
                      >
                        {deletingFileId === att.id ? (
                          <span className="text-xs">삭제 중...</span>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 새 파일 추가 */}
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition group">
                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center flex-shrink-0 transition">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">새 파일 추가</p>
                  <p className="text-xs text-slate-400">PDF, HWP, JPG, PNG · 최대 10MB</p>
                </div>
                <input ref={fileRef} type="file" multiple accept=".pdf,.hwp,.jpg,.jpeg,.png"
                  onChange={handleFileChange} className="hidden" />
              </label>
              {files.length > 0 && (
                <ul className="space-y-1.5 mt-2">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="truncate text-slate-700">{f.name}</span>
                        <span className="text-slate-400 flex-shrink-0">({(f.size / 1024).toFixed(0)}KB)</span>
                      </div>
                      <button onClick={() => removeFile(i)}
                        className="ml-2 text-slate-400 hover:text-red-500 transition flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

          {error && (
            <div className="px-8 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm font-light flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* 푸터 */}
          <div className="flex items-center justify-end gap-3 px-8 py-5 bg-slate-50 border-t border-slate-100">
            <button onClick={onClose}
              className="px-5 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
              취소
            </button>
            <button onClick={handleSubmit} disabled={isSaving}
              className="px-6 py-2 bg-slate-900 text-white text-sm hover:bg-slate-700 disabled:bg-slate-300 font-medium transition-all">
              {isSaving ? '저장 중...' : isEdit ? '수정 저장' : '등록'}
            </button>
          </div>
        </div>
      </div>

      {/* 링크 툴팁 — fixed 포지션, getBoundingClientRect 기준 (원본 동일) */}
      <LinkTooltip />
    </>
  )
}

// ── 외부 래퍼 (isOpen 게이팅 + key 재마운트) ───────────────────────
const SermonModal = (props) => {
  const { isOpen, isLoadingDetail } = props

  // 원본 loadStaffList() → /api/staff/preachers (담임목사, 목사, 전도사)
  const { data: ministers = [] } = useQuery({
    queryKey: ['staff', 'preachers'],
    queryFn: () => staffApi.getPreachers(),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  })

  if (!isOpen) return null

  // 상세 데이터 fetch 중이면 로딩 표시
  if (isLoadingDetail) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative bg-white px-10 py-8 shadow-2xl flex flex-col items-center gap-3">
        <svg className="w-6 h-6 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-sm text-slate-500">설교 데이터를 불러오는 중...</p>
      </div>
    </div>
  )

  // key={Date.now()} 대신 editTarget.id or 'new' 를 사용해
  // 같은 항목을 두 번 열어도 재마운트되도록 보장
  const mountKey = props.editTarget ? `edit-${props.editTarget.id}` : 'new'

  return (
    <SermonModalInner
      key={mountKey}
      {...props}
      ministers={ministers}
    />
  )
}

export default SermonModal
