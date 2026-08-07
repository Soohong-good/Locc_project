import { useState } from 'react'
import { uploadGalleryImages } from '@/api/departments'
import { resizeImageFiles, formatFileSize } from '@/utils/imageResize'
import Button from '@/components/ui/Button'

/**
 * 갤러리 이미지 업로드 모달
 * 부서 갤러리(GalleryListPage)와 교회 갤러리(ChurchGalleryPage)가 공용으로 사용한다.
 * deptCode에 부서 코드 또는 교회 갤러리 코드('church')를 넘긴다.
 */
const GalleryUploadModal = ({ deptCode, onClose, onSaved }) => {
  const [title,  setTitle]  = useState('')
  const [desc,   setDesc]   = useState('')
  const [files,  setFiles]  = useState([])
  const [preview, setPreview] = useState(null)   // { src, count }
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)
  const [preparing, setPreparing] = useState(false)

  // 원본 파일 허용 상한 — 전송 전에 1920px로 줄이므로 카메라 원본도 그대로 선택 가능
  const MAX_SOURCE_SIZE = 30 * 1024 * 1024

  const handleFiles = async (e) => {
    const selected = Array.from(e.target.files)
    if (selected.length === 0) { setFiles([]); setPreview(null); return }

    const ALLOWED_IMG_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const invalidType = selected.find((f) => !ALLOWED_IMG_TYPES.includes(f.type))
    if (invalidType) { setError(`이미지 파일(JPG, PNG, GIF, WEBP)만 업로드 가능합니다: ${invalidType.name}`); return }
    const over = selected.find((f) => f.size > MAX_SOURCE_SIZE)
    if (over) { setError(`파일 1개당 30MB를 초과할 수 없습니다: ${over.name}`); return }

    setError('')
    setPreparing(true)
    try {
      // 전송 전 1920px로 축소 — 서버 저장 화질(1920px)과 동일하므로 손실 없음
      const resized = await resizeImageFiles(selected)
      setFiles(resized)

      const reader = new FileReader()
      reader.onload = (ev) => setPreview({ src: ev.target.result, count: resized.length })
      reader.readAsDataURL(resized[0])
    } catch {
      setError('이미지를 준비하는 중 오류가 발생했습니다.')
    } finally {
      setPreparing(false)
    }
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  const handleSave = async () => {
    setError('')
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    if (files.length === 0) { setError('이미지를 선택해주세요.'); return }
    setSaving(true)
    const fd = new FormData()
    fd.append('title', title.trim())
    if (desc.trim()) fd.append('description', desc.trim())
    files.forEach((f) => fd.append('imageFiles', f))
    try {
      await uploadGalleryImages(deptCode, fd)
      onSaved()
    } catch (e) {
      setError(e?.response?.data?.message ?? '업로드에 실패했습니다.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <h2 className="text-2xl font-light text-slate-900">이미지 업로드</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2024 여름수련회"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">같은 제목의 이미지들이 하나의 그룹으로 표시됩니다</p>
          </div>
          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">설명</label>
            <textarea
              value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
              placeholder="이미지에 대한 설명을 입력하세요"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none transition-all resize-none"
            />
          </div>
          {/* 파일 선택 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              이미지 파일 <span className="text-red-500">*</span>
            </label>
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition group">
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center flex-shrink-0 transition">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {preparing
                    ? '이미지 준비 중...'
                    : files.length > 0
                      ? `${files.length}장 선택됨 · 전송 용량 ${formatFileSize(totalSize)}`
                      : '이미지 추가'}
                </p>
                <p className="text-xs text-slate-400">
                  JPG, PNG, GIF, WEBP · 여러 장 선택 가능 · 업로드 전 자동으로 1920px로 축소됩니다
                </p>
              </div>
              <input
                type="file" accept="image/*" multiple onChange={handleFiles}
                className="hidden"
              />
            </label>
          </div>
          {/* 미리보기 — 첫 장 카드 스택 */}
          {preview && (
            <div className="relative" style={{ width: 300, height: 220, margin: '0 auto' }}>
              {preview.count > 1 && (
                <>
                  <div className="absolute border border-slate-200 bg-white"
                    style={{ top: 12, left: 12, width: 280, height: 200, zIndex: 1 }} />
                  {preview.count > 2 && (
                    <div className="absolute border border-slate-200 bg-white"
                      style={{ top: 6, left: 6, width: 280, height: 200, zIndex: 2 }} />
                  )}
                </>
              )}
              <div className="absolute overflow-hidden border border-slate-200"
                style={{ top: 0, left: 0, width: 280, height: 200, zIndex: 3 }}>
                <img src={preview.src} alt="미리보기" className="w-full h-full object-cover" />
                {preview.count > 1 && (
                  <span className="absolute top-3 right-3 bg-slate-900/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {preview.count}장
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        {error && (
          <div className="px-8 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm font-light flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
          <Button variant="ghost" size="md" onClick={onClose}>취소</Button>
          <Button variant="primary" size="md" onClick={handleSave} isLoading={saving} disabled={preparing || saving}>
            {saving ? '업로드 중...' : preparing ? '준비 중...' : '업로드'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default GalleryUploadModal
