import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CaretRight, CaretLeft, Eye, Images, Stack,
} from '@phosphor-icons/react'
import toast from '@/utils/toast'
import { getGalleryList } from '@/api/gallery'
import {
  getGalleryImagesByTitle,
  uploadGalleryImages,
  deleteGalleryImage,
  deleteSingleGalleryImage,
  updateGalleryGroup,
  addImagesToGalleryGroup,
} from '@/api/departments'
import { DEPARTMENTS } from '@/constants/departments'
import useAuthStore from '@/stores/authStore'
import Button from '@/components/ui/Button'

const PAGE_WINDOW = 5

// ── 날짜 포맷 (yyyy.mm.dd) ──────────────────────────────────────────────────
const fmtDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const getPageRange = (current, total) => {
  if (total <= PAGE_WINDOW) return Array.from({ length: total }, (_, i) => i)
  let start = Math.max(0, current - Math.floor(PAGE_WINDOW / 2))
  const end = Math.min(total, start + PAGE_WINDOW)
  start = Math.max(0, end - PAGE_WINDOW)
  return Array.from({ length: PAGE_WINDOW }, (_, i) => start + i)
}

// ────────────────────────────────────────────────────────────────────────────
// 갤러리 업로드 모달
// ────────────────────────────────────────────────────────────────────────────
const GalleryUploadModal = ({ deptCode, onClose, onSaved }) => {
  const [title,  setTitle]  = useState('')
  const [desc,   setDesc]   = useState('')
  const [files,  setFiles]  = useState([])
  const [preview, setPreview] = useState(null)   // { src, count }
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files)
    const ALLOWED_IMG_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const invalidType = selected.find((f) => !ALLOWED_IMG_TYPES.includes(f.type))
    if (invalidType) { setError(`이미지 파일(JPG, PNG, GIF, WEBP)만 업로드 가능합니다: ${invalidType.name}`); return }
    const over = selected.find((f) => f.size > 10 * 1024 * 1024)
    if (over) { setError('파일 1개당 10MB를 초과할 수 없습니다.'); return }
    setError('')
    setFiles(selected)

    // 첫 번째 이미지 미리보기
    if (selected.length > 0) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview({ src: ev.target.result, count: selected.length })
      reader.readAsDataURL(selected[0])
    } else {
      setPreview(null)
    }
  }

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
                  {files.length > 0 ? `${files.length}장 선택됨` : '이미지 추가'}
                </p>
                <p className="text-xs text-slate-400">JPG, PNG, GIF, WEBP · 최대 10MB · 여러 장 선택 가능</p>
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
          <Button variant="primary" size="md" onClick={handleSave} isLoading={saving}>
            {saving ? '업로드 중...' : '업로드'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 갤러리 제목 수정 모달
// ────────────────────────────────────────────────────────────────────────────
const GalleryEditModal = ({ image, deptCode, onClose, onSaved }) => {
  const queryClient = useQueryClient()

  const [title,    setTitle]    = useState(image.title ?? '')
  const [desc,     setDesc]     = useState(image.description ?? '')
  const [newFiles, setNewFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [saving,   setSaving]   = useState(false)
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setNewFiles(files)
    setPreviews(files.map((f) => URL.createObjectURL(f)))
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
              <div className="grid grid-cols-4 gap-2">
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
                        className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
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
                {newFiles.length > 0 ? `${newFiles.length}장 선택됨` : '파일 선택 (여러 장 가능)'}
              </span>
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </label>
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
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
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-sm bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50 transition">
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 페이지
// ────────────────────────────────────────────────────────────────────────────
const GalleryListPage = () => {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const { canWrite: canWriteFn } = useAuthStore()
  const canWrite = canWriteFn('DEPARTMENT')

  const [selectedCode, setSelectedCode] = useState(null) // null = 전체
  const [page,         setPage]         = useState(0)
  const [uploadOpen,   setUploadOpen]   = useState(false)
  const [editImage,    setEditImage]    = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['galleries', selectedCode, page],
    queryFn:  () => getGalleryList({ departmentCode: selectedCode ?? undefined, page }),
  })

  const deleteMutation = useMutation({
    mutationFn: (image) => deleteGalleryImage(image.departmentCode, image.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['galleries'] }),
    onError: () => toast.error('삭제에 실패했습니다.'),
  })

  const handleDelete = (image) => {
    if (!window.confirm(`"${image.title}" 이미지를 삭제하시겠습니까?\n같은 그룹의 모든 이미지가 삭제됩니다.`)) return
    deleteMutation.mutate(image)
  }

  const handleSelectTab = (code) => {
    setSelectedCode(code)
    setPage(0)
  }

  const goPage = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // PageResponse 구조: { content, pageInfo: { page, size, totalElements, totalPages } }
  const images      = data?.content   ?? []
  const pageInfo    = data?.pageInfo  ?? {}
  const totalPages  = pageInfo.totalPages ?? 0
  const currentPage = pageInfo.page       ?? 0
  const selectedLabel = selectedCode ? DEPARTMENTS.find((d) => d.code === selectedCode)?.label : null

  return (
    <main className="pt-20 bg-[#FAF9F6]">
      {/* ── 헤더 + 부서 필터 탭 ──────────────────────────────────── */}
      <section className="pt-12 pb-16 border-b border-[#E5E5E5]">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24 border-x border-[#E5E5E5]">
          <div className="flex items-center gap-4 mb-6">
            <span className="w-8 h-px bg-[#171717]" />
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono">Archive &amp; Record</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <h1 className="text-5xl font-bold tracking-tight text-[#171717]">부서 갤러리</h1>
              <p className="text-[#737373] font-light text-sm mt-3">
                {selectedLabel ? `${selectedLabel} 활동 사진` : '전체 부서 활동 사진'}
              </p>
            </div>
            {canWrite && selectedCode && (
              <Button variant="primary" size="sm" onClick={() => setUploadOpen(true)}>
                + 이미지 업로드
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 border-t border-[#E5E5E5] pt-8">
            <button
              onClick={() => handleSelectTab(null)}
              className={`text-sm pb-2 border-b-2 transition-colors ${
                selectedCode === null
                  ? 'font-bold text-[#171717] border-[#171717]'
                  : 'font-medium text-[#737373] border-transparent hover:text-[#171717]'
              }`}
            >
              전체
            </button>
            {DEPARTMENTS.map((d) => (
              <button
                key={d.code}
                onClick={() => handleSelectTab(d.code)}
                className={`text-sm pb-2 border-b-2 transition-colors ${
                  selectedCode === d.code
                    ? 'font-bold text-[#171717] border-[#171717]'
                    : 'font-medium text-[#737373] border-transparent hover:text-[#171717]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 매소너리 포토 그리드 ─────────────────────────────────── */}
      <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
        <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] py-12 px-6">

          {/* 로딩 */}
          {isLoading && (
            <div className="columns-1 md:columns-2 xl:columns-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="break-inside-avoid p-3">
                  <div className="aspect-[4/5] skeleton-shimmer" />
                </div>
              ))}
            </div>
          )}

          {/* 목록 없음 */}
          {!isLoading && images.length === 0 && (
            <div className="text-center py-32 px-8">
              <Images size={56} className="mx-auto text-[#E5E5E5] mb-4" />
              <p className="text-[#737373] font-light">등록된 이미지가 없습니다.</p>
            </div>
          )}

          {/* 포토 그리드 */}
          {!isLoading && images.length > 0 && (
            <>
              <div className="columns-1 md:columns-2 xl:columns-3">
                {images.map((image) => {
                  const count = image.imageCount ?? 1
                  return (
                    <div key={image.id} className="break-inside-avoid p-3">
                      <div
                        className="relative overflow-hidden bg-[#F4F2EA] group cursor-pointer"
                        onClick={() => navigate(`/department/gallery/${image.id}`)}
                      >
                        <img
                          src={`/uploads/gallery/${image.thumbnailFilename || image.storedFilename}`}
                          alt={image.title}
                          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => { e.target.src = '/images/no-image.png' }}
                        />

                        {/* 호버 시 정보 오버레이 */}
                        <div className="absolute inset-0 bg-[#171717]/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                          <span className="text-[10px] font-mono text-[#FAF9F6]/80 uppercase tracking-widest mb-1">
                            {image.departmentName} · {fmtDate(image.createdAt)}
                          </span>
                          <h3 className="text-[#FAF9F6] font-bold text-lg break-keep">{image.title}</h3>
                          {image.description ? (
                            <p className="text-[#FAF9F6]/70 text-xs font-light mt-1 line-clamp-2 break-keep">{image.description}</p>
                          ) : (
                            <p className="text-[#FAF9F6]/70 text-xs font-light mt-1 flex items-center gap-1">
                              <Eye size={12} /> {image.viewCount ?? 0}
                            </p>
                          )}
                        </div>

                        {/* 장수 배지 */}
                        {count > 1 && (
                          <span className="absolute top-3 left-3 flex items-center gap-1 bg-[#171717]/80 text-white text-xs font-medium px-2 py-0.5">
                            <Stack size={12} />
                            {count}
                          </span>
                        )}

                        {/* 수정/삭제 버튼 — canWrite 시 hover에 표시 */}
                        {canWrite && (
                          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditImage(image) }}
                              className="px-2 py-1 text-xs font-medium bg-white/90 text-[#2C2C2C] hover:bg-white transition"
                            >
                              수정
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(image) }}
                              disabled={deleteMutation.isPending}
                              className="px-2 py-1 text-xs font-medium bg-red-600/90 text-white hover:bg-red-600 transition disabled:opacity-50"
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goPage(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="w-10 h-10 border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:bg-[#171717] hover:text-[#FAF9F6] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#737373] disabled:cursor-not-allowed"
                    >
                      <CaretLeft size={16} />
                    </button>
                    {getPageRange(currentPage, totalPages).map((p) => (
                      <button
                        key={p}
                        onClick={() => goPage(p)}
                        className={`w-10 h-10 border flex items-center justify-center font-mono transition-colors ${
                          p === currentPage
                            ? 'border-[#171717] bg-[#171717] text-[#FAF9F6]'
                            : 'border-[#E5E5E5] text-[#737373] hover:bg-[#171717] hover:text-[#FAF9F6]'
                        }`}
                      >
                        {p + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => goPage(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="w-10 h-10 border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:bg-[#171717] hover:text-[#FAF9F6] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#737373] disabled:cursor-not-allowed"
                    >
                      <CaretRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 문의 안내 */}
          <div className="mt-16 max-w-xl mx-auto text-center">
            <p className="text-xs text-[#737373] leading-relaxed font-light break-keep">
              부서 활동의 사진이나 영상 자료에 대한 문의는 사무실(<a href="tel:053-962-8948" className="underline hover:text-[#171717]">053-962-8948</a>)로 연락 바랍니다.
            </p>
          </div>
        </div>
      </section>

      {uploadOpen && selectedCode && (
        <GalleryUploadModal
          deptCode={selectedCode}
          onClose={() => setUploadOpen(false)}
          onSaved={() => {
            setUploadOpen(false)
            queryClient.invalidateQueries({ queryKey: ['galleries'] })
          }}
        />
      )}

      {editImage && (
        <GalleryEditModal
          image={editImage}
          deptCode={editImage.departmentCode}
          onClose={() => setEditImage(null)}
          onSaved={() => {
            setEditImage(null)
            queryClient.invalidateQueries({ queryKey: ['galleries'] })
          }}
        />
      )}
    </main>
  )
}

export default GalleryListPage
