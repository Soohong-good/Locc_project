import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSundayMorningByDate, createSermon, updateSermon, uploadSermonImage } from '@/api/sermons'
import { downloadFile, deleteFile } from '@/api/files'
import { staffApi } from '@/api/staff'
import useQuillEditor from '@/hooks/useQuillEditor.jsx'
import { DateInput } from '@/components/ui/DateInput'
import { getErrorMessage } from '@/lib/apiError'
import toast from '@/utils/toast'

const extractVideoId = (url = '') => {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/)
  return m ? m[1] : null
}

const selectStyle = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: '28px',
}

// ── 내부 컴포넌트 (key 재마운트 대상) ─────────────────────────────────────
const SundayMorningModalInner = ({ onClose, onSaved, editGroup, ministers }) => {
  const isEdit = !!editGroup
  const queryClient = useQueryClient()

  const [fields, setFields] = useState({
    title: '', scripture: '', preacher: '',
    sermonDate: editGroup?.sermonDate ?? '',
    video1Url: '', video2Url: '',
  })
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [preacherReadOnly, setPreacherReadOnly] = useState(false)

  // 기존 첨부파일 (수정 모드 — 1부·2부 통합 표시)
  const [existingAttachments, setExistingAttachments] = useState([])
  const [deletingFileId, setDeletingFileId] = useState(null)

  const handleDeleteAttachment = async (fileId) => {
    if (!confirm('이 첨부파일을 삭제하시겠습니까?')) return
    setDeletingFileId(fileId)
    try {
      await deleteFile(fileId)
      setExistingAttachments((prev) => prev.filter((a) => a.id !== fileId))
    } catch {
      toast.error('파일 삭제에 실패했습니다.')
    } finally {
      setDeletingFileId(null)
    }
  }

  const set = (key) => (e) => setFields((p) => ({ ...p, [key]: e.target.value }))

  // 수정 모드: 날짜로 전체 상세(content 포함) 로드
  const { data: detail } = useQuery({
    queryKey: ['sermons', 'sunday-morning', 'date', editGroup?.sermonDate],
    queryFn: () => getSundayMorningByDate(editGroup.sermonDate),
    enabled: isEdit,
    staleTime: 0,
  })

  const { containerRef, getHTML, setHTML } = useQuillEditor({
    onImageUpload: uploadSermonImage,
  })

  useEffect(() => {
    if (!detail) return
    const base = detail.part1 ?? detail.part2
    setFields({
      title:      base?.title      ?? '',
      scripture:  base?.scripture  ?? '',
      preacher:   base?.preacher   ?? '',
      sermonDate: detail.sermonDate ?? editGroup?.sermonDate ?? '',
      video1Url:  detail.part1?.videoUrl ?? '',
      video2Url:  detail.part2?.videoUrl ?? '',
    })
    if (base?.content) setTimeout(() => setHTML(base.content), 150)

    // 기존 첨부파일 로드 (1부·2부 통합)
    setExistingAttachments([
      ...(detail.part1?.attachments ?? []),
      ...(detail.part2?.attachments ?? []),
    ])

    // 수정 모드에서 기존 설교자가 교역자 목록에 있으면 readOnly
    if (base?.preacher && ministers.some((m) => `${m.name} ${m.displayPosition}` === base.preacher)) {
      setPreacherReadOnly(true)
    }
  }, [detail])

  const buildFormData = (serviceNumber, videoUrl, withFiles) => {
    const fd = new FormData()
    fd.append('title',         fields.title.trim())
    fd.append('category',      '주일오전')
    fd.append('serviceNumber', serviceNumber)
    if (fields.scripture)  fd.append('scripture',  fields.scripture.trim())
    if (fields.preacher)   fd.append('preacher',   fields.preacher.trim())
    if (fields.sermonDate) fd.append('sermonDate', fields.sermonDate)
    if (videoUrl) {
      fd.append('videoUrl', videoUrl)
      const vid = extractVideoId(videoUrl)
      if (vid) fd.append('thumbnailUrl', `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`)
    }
    const html = getHTML()
    if (html) fd.append('content', html)
    if (withFiles) files.forEach((f) => fd.append('files', f))
    return fd
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const p1 = detail?.part1 ?? null
      const p2 = detail?.part2 ?? null
      const attachTo = (p1 || fields.video1Url || !isEdit) ? 1 : 2

      if (isEdit) {
        if (p1)                    await updateSermon({ id: p1.id, formData: buildFormData(1, fields.video1Url, attachTo === 1) })
        else if (fields.video1Url) await createSermon(buildFormData(1, fields.video1Url, attachTo === 1))
        if (p2)                    await updateSermon({ id: p2.id, formData: buildFormData(2, fields.video2Url, attachTo === 2) })
        else if (fields.video2Url) await createSermon(buildFormData(2, fields.video2Url, attachTo === 2))
      } else {
        await createSermon(buildFormData(1, fields.video1Url, true))
        if (fields.video2Url) await createSermon(buildFormData(2, fields.video2Url, false))
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermons', 'sunday-morning', 'grouped'] })
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
      onSaved?.()
      onClose()
    },
  })

  const handleSubmit = () => {
    setError('')
    if (!fields.title.trim())  return setError('제목을 입력해주세요.')
    if (!fields.sermonDate)    return setError('설교 날짜를 선택해주세요.')
    saveMutation.mutate()
  }

  const handlePreacherSelect = (e) => {
    const val = e.target.value
    e.target.value = ''
    if (val === '__DIRECT__') {
      setFields((p) => ({ ...p, preacher: '' }))
      setPreacherReadOnly(false)
    } else if (val) {
      setFields((p) => ({ ...p, preacher: val }))
      setPreacherReadOnly(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-medium text-slate-900">
              {isEdit ? '주일오전 설교 수정' : '주일오전 설교 등록'}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">1부·2부 공통 필드 + 부별 영상 URL</p>
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

          {/* 제목 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">제목 <span className="text-red-500">*</span></label>
            <input type="text" value={fields.title} onChange={set('title')} maxLength={200}
              placeholder="설교 제목"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 outline-none transition text-sm" />
          </div>

          {/* 날짜 / 성경구절 */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">날짜 <span className="text-red-500">*</span></label>
              <DateInput
                value={fields.sermonDate}
                onChange={(v) => setFields((p) => ({ ...p, sermonDate: v }))}
                placeholder="설교 날짜 선택"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 outline-none transition text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">성경 구절</label>
              <input type="text" value={fields.scripture} onChange={set('scripture')} maxLength={100}
                placeholder="예: 요한복음 3:16"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 outline-none transition text-sm" />
            </div>
          </div>

          {/* 설교자 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">설교자</label>
            <div className="flex gap-2">
              <input type="text" value={fields.preacher}
                onChange={preacherReadOnly ? undefined : set('preacher')}
                readOnly={preacherReadOnly}
                placeholder={preacherReadOnly ? '설교자 이름' : '이름 직접 입력'}
                className={`flex-1 px-3 py-2.5 border border-slate-200 focus:border-slate-800 outline-none transition text-sm ${preacherReadOnly ? 'bg-slate-100 cursor-default' : 'bg-slate-50 focus:bg-white'}`}
              />
              <select onChange={handlePreacherSelect} defaultValue="" style={selectStyle}
                className="w-36 px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 outline-none transition text-sm appearance-none">
                <option value="">교역자 선택</option>
                {ministers.map((m) => {
                  const text = `${m.name} ${m.displayPosition}`
                  return <option key={m.id} value={text}>{text}</option>
                })}
                <option value="__DIRECT__">직접 입력</option>
              </select>
            </div>
          </div>

          {/* 부별 영상 URL */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">1부 영상 URL</label>
              <input type="url" value={fields.video1Url} onChange={set('video1Url')}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 outline-none transition text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">2부 영상 URL</label>
              <input type="url" value={fields.video2Url} onChange={set('video2Url')}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 outline-none transition text-sm" />
            </div>
          </div>

          {/* Quill 에디터 */}
          <div className="space-y-1.5 [&_.ql-editor]:min-h-[280px]">
            <label className="text-sm font-medium text-slate-700">내용 (1·2부 공통)</label>
            <div ref={containerRef} />
          </div>

          {/* 첨부파일 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 tracking-wide">
              첨부파일 <span className="text-xs text-slate-500 font-normal ml-1">(PDF, HWP, JPG, PNG · 최대 20MB)</span>
            </label>

            {/* 기존 첨부파일 (수정 모드) */}
            {existingAttachments.length > 0 && (
              <div className="space-y-1.5 mb-2">
                <p className="text-xs text-slate-500">기존 첨부파일</p>
                {existingAttachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-200 text-sm">
                    <button
                      type="button"
                      onClick={() => downloadFile(att.id, att.originalFileName)}
                      className="truncate text-blue-700 hover:underline text-left min-w-0"
                    >
                      {att.originalFileName}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAttachment(att.id)}
                      disabled={deletingFileId === att.id}
                      className="ml-2 text-red-400 hover:text-red-600 transition flex-shrink-0 disabled:opacity-40"
                    >
                      {deletingFileId === att.id ? <span className="text-xs">삭제 중...</span> : '✕'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition group">
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center flex-shrink-0 transition">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">파일 추가</p>
                <p className="text-xs text-slate-400">PDF, HWP, JPG, PNG · 최대 20MB</p>
              </div>
              <input type="file" multiple accept=".pdf,.hwp,.jpg,.jpeg,.png"
                onChange={(e) => setFiles((p) => [...p, ...Array.from(e.target.files)])}
                className="hidden" />
            </label>
            {files.length > 0 && (
              <ul className="space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5">
                    <span className="truncate">✓ {f.name}</span>
                    <button type="button" onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                      className="ml-2 text-slate-400 hover:text-red-500 shrink-0">✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {(error || saveMutation.error) && (
          <div className="px-8 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">
            {error || getErrorMessage(saveMutation.error, '저장 중 오류가 발생했습니다.')}
          </div>
        )}

        {/* 푸터 */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 bg-slate-50 border-t border-slate-100">
          <button onClick={onClose}
            className="px-5 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
            취소
          </button>
          <button onClick={handleSubmit} disabled={saveMutation.isPending}
            className="px-6 py-2 bg-slate-900 text-white text-sm hover:bg-slate-700 disabled:bg-slate-300 font-medium transition-all">
            {saveMutation.isPending ? '저장 중...' : isEdit ? '수정 저장' : '등록'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 외부 래퍼 ─────────────────────────────────────────────────────────────
const SundayMorningModal = ({ isOpen, onClose, onSaved, editGroup }) => {
  const { data: ministers = [] } = useQuery({
    queryKey: ['staff', 'preachers'],
    queryFn: () => staffApi.getPreachers(),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  })

  if (!isOpen) return null

  const mountKey = editGroup ? `edit-${editGroup.sermonDate}` : 'new'

  return (
    <SundayMorningModalInner
      key={mountKey}
      onClose={onClose}
      onSaved={onSaved}
      editGroup={editGroup}
      ministers={ministers}
    />
  )
}

export default SundayMorningModal
