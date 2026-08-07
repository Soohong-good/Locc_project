import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from '@/utils/toast'
import {
  getGalleryImagesByTitle,
  deleteSingleGalleryImage,
  updateGalleryGroup,
  addImagesToGalleryGroup,
} from '@/api/departments'
import { resizeImageFiles, formatFileSize } from '@/utils/imageResize'

/**
 * 갤러리 제목·설명 수정 + 이미지 추가/개별 삭제 모달
 * 부서 갤러리(GalleryListPage)와 교회 갤러리(ChurchGalleryPage)가 공용으로 사용한다.
 */
const GalleryEditModal = ({ image, deptCode, onClose, onSaved }) => {
  const queryClient = useQueryClient()

  const [title,    setTitle]    = useState(image.title ?? '')
  const [desc,     setDesc]     = useState(image.description ?? '')
  const [newFiles, setNewFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [saving,   setSaving]   = useState(false)
  const [preparing, setPreparing] = useState(false)
  const [error,    setError]    = useState('')

  // 그룹 내 전체 이미지 불러오기
  const { data: groupImages = [], isLoading: loadingGroup, refetch } = useQuery({
    queryKey: ['gallery-group-edit', deptCode, image.title],
    queryFn:  () => getGalleryImagesByTitle(deptCode, image.title),
    enabled:  !!image.title,
  })

  // 개별 이미지 삭제
  const singleDeleteMutation = useMutation({
    mutationFn: (imgId) => deleteSingleGalleryImage(deptCode, imgId),
    onSuccess: () => refetch(),
    onError: () => toast.error('삭제에 실패했습니다.'),
  })

  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files)
    if (selected.length === 0) { setNewFiles([]); setPreviews([]); return }

    setPreparing(true)
    try {
      // 등록 모달과 동일하게 전송 전 1920px로 축소 (서버 저장 화질과 동일)
      const resized = await resizeImageFiles(selected)
      setNewFiles(resized)
      setPreviews(resized.map((f) => URL.createObjectURL(f)))
    } catch {
      setError('이미지를 준비하는 중 오류가 발생했습니다.')
    } finally {
      setPreparing(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    setSaving(true)
    try {
      // 1. 제목·설명 수정
      await updateGalleryGroup(deptCode, image.id, { title: title.trim(), description: desc.trim() })

      // 2. 새 이미지 추가
      if (newFiles.length > 0) {
        const fd = new FormData()
        fd.append('title', title.trim())
        fd.append('description', desc.trim())
        fd.append('groupId', image.groupId ?? '')
        newFiles.forEach((f) => fd.append('imageFiles', f))
        await addImagesToGalleryGroup(deptCode, fd)
      }

      queryClient.invalidateQueries({ queryKey: ['galleries'] })
      onSaved()
    } catch {
      setError('저장에 실패했습니다.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-lg font-medium text-slate-900">갤러리 수정</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-900 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 본문 (스크롤) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* 제목 */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none transition-all text-sm"
              placeholder="예: 2024 여름수련회"
            />
          </div>

          {/* 설명 */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">설명</label>
            <textarea
              value={desc} onChange={(e) => setDesc(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none transition-all text-sm resize-none"
              placeholder="이미지에 대한 설명을 입력하세요"
            />
          </div>

          {/* 현재 이미지 목록 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">
              현재 이미지 ({loadingGroup ? '...' : groupImages.length}장)
              <span className="text-xs text-slate-400 font-normal ml-2">X를 눌러 개별 삭제</span>
            </p>
            {loadingGroup ? (
              <div className="h-24 flex items-center justify-center text-slate-400 text-sm">불러오는 중...</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {groupImages.map((img) => (
                  <div key={img.id} className="relative group aspect-square bg-slate-100 overflow-hidden rounded">
                    <img
                      src={`/uploads/gallery/${img.thumbnailFilename || img.storedFilename}`}
                      alt={img.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/images/no-image.png' }}
                    />
                    {groupImages.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm('이 이미지를 삭제하시겠습니까?'))
                            singleDeleteMutation.mutate(img.id)
                        }}
                        disabled={singleDeleteMutation.isPending}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition hover:bg-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 이미지 추가 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">이미지 추가</label>
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm text-slate-600">
                {preparing
                  ? '이미지 준비 중...'
                  : newFiles.length > 0
                    ? `${newFiles.length}장 선택됨 · 전송 용량 ${formatFileSize(newFiles.reduce((s, f) => s + f.size, 0))}`
                    : '파일 선택 (여러 장 가능 · 자동으로 1920px 축소)'}
              </span>
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </label>
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="aspect-square bg-slate-100 overflow-hidden rounded">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm font-light flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* 푸터 */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition">취소</button>
          <button onClick={handleSave} disabled={saving || preparing}
            className="px-5 py-2 text-sm bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50 transition">
            {saving ? '저장 중...' : preparing ? '준비 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GalleryEditModal
