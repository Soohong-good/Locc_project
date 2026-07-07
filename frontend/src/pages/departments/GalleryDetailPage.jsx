import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  List, Trash, User, CalendarBlank, Folder, Eye, FileText, HardDrive,
} from '@phosphor-icons/react'
import { getGalleryDetail, getGalleryGroupImages } from '@/api/gallery'
import { deleteGalleryImage } from '@/api/departments'
import useAuthStore from '@/stores/authStore'
import useNoIndex from '@/hooks/useNoIndex'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import toast from '@/utils/toast'

/* ── 날짜 포맷: 원본 yyyy. MM. dd ───────────────────────────────── */
const fmtDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  const y  = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}. ${mm}. ${dd}`
}

const fmtFileSize = (bytes) => {
  if (!bytes) return '0 KB'
  return (bytes / 1024).toFixed(2) + ' KB'
}

/* ── 삭제 확인 모달 ───────────────────────────────────────────────── */
const DeleteModal = ({ title, onClose, onConfirm, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white w-full max-w-md overflow-hidden shadow-2xl">
      <div className="px-8 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-medium text-slate-900">이미지 삭제</h2>
            <p className="text-sm text-slate-500 mt-0.5 font-light">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>
      </div>
      <div className="px-8 py-6">
        <p className="text-slate-600 mb-3 font-light">이 이미지를 삭제하시겠습니까?</p>
        <p className="font-medium text-slate-900 bg-slate-50 px-4 py-3 rounded">{title}</p>
      </div>
      <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
        <button onClick={onClose}
          className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
          취소
        </button>
        <button onClick={onConfirm} disabled={deleting}
          className="px-8 py-2.5 bg-red-600 text-white hover:bg-red-700 font-medium transition-all disabled:opacity-60">
          {deleting ? '삭제 중...' : '삭제하기'}
        </button>
      </div>
    </div>
  </div>
)

/* ── 메인 컴포넌트 ──────────────────────────────────────────────── */
const GalleryDetailPage = () => {
  const { imageId } = useParams()
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()

  const { canWrite: canWriteFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const isAdmin  = isAdminFn()
  const canWrite = canWriteFn('DEPARTMENT')
  const userId   = getUserId()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const { data: image, isLoading, isError } = useQuery({
    queryKey: ['gallery-detail', imageId],
    queryFn:  () => getGalleryDetail(imageId),
    retry: false,
  })

  // 존재하지 않는 이미지 id도 SPA 특성상 200 OK가 나가므로 색인에서 제외
  useNoIndex(!isLoading && (isError || !image))

  const { data: groupImages } = useQuery({
    queryKey: ['gallery-group-images', imageId],
    queryFn:  () => getGalleryGroupImages(imageId),
    enabled:  !!image,
  })

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteGalleryImage(image.departmentCode, imageId)
      queryClient.invalidateQueries({ queryKey: ['galleries'] })
      navigate('/department/gallery')
    } catch {
      toast.error('이미지 삭제 중 오류가 발생했습니다.')
      setDeleting(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

  if (isError || !image) return (
    <main className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] min-h-screen pt-20 px-6">
      <div className="text-red-500">이미지를 찾을 수 없습니다.</div>
    </main>
  )

  const isGroup = groupImages && groupImages.length > 1

  return (
    <main className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] min-h-screen pt-20 bg-[#FAF9F6]">
      <article className="w-full max-w-[840px] mx-auto px-6 py-16 md:py-24">

        {/* 관리자 버튼 */}
        {canWrite && (isAdmin || image.uploaderId === userId) && (
          <div className="flex justify-end gap-5 font-mono text-[10px] text-[#737373] mb-8 tracking-[0.1em] uppercase">
            <button onClick={() => setDeleteOpen(true)} className="flex items-center gap-1 hover:text-red-600 transition-colors">
              <Trash size={14} />
              <span>삭제</span>
            </button>
          </div>
        )}

        {/* 헤더 */}
        <header className="mb-12">
          <div className="font-mono text-[#737373] text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#171717] block" />
            GALLERY
          </div>
          <h1 className="text-3xl md:text-[2.75rem] font-bold text-[#171717] leading-[1.3] mb-8 break-keep tracking-tight">
            {image.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-[11px] font-mono text-[#737373] tracking-widest uppercase">
            <span className="flex items-center gap-1.5"><User size={14} /> {image.uploaderName}</span>
            <span className="w-px h-3 bg-[#E5E5E5] block" />
            <span className="flex items-center gap-1.5"><CalendarBlank size={14} /> {fmtDate(image.createdAt)}</span>
            <span className="w-px h-3 bg-[#E5E5E5] block" />
            <span className="flex items-center gap-1.5"><Folder size={14} /> {image.departmentName}</span>
            <span className="w-px h-3 bg-[#E5E5E5] block" />
            <span className="flex items-center gap-1.5"><Eye size={14} /> {image.viewCount ?? 0}</span>
          </div>
        </header>

        <hr className="border-t border-[#E5E5E5] mb-16" />

        {/* 이미지 */}
        {isGroup ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            {groupImages.map((img) => (
              <div key={img.id} className="border border-[#E5E5E5] bg-[#F4F2EA]">
                <img
                  src={`/uploads/gallery/${img.storedFilename}`}
                  alt={img.title}
                  loading="lazy"
                  className="w-full h-auto"
                  onError={(e) => { e.target.src = '/images/no-image.png' }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-[#E5E5E5] bg-[#F4F2EA] mb-16">
            <img
              src={`/uploads/gallery/${image.storedFilename}`}
              alt={image.title}
              loading="lazy"
              className="w-full h-auto"
              onError={(e) => { e.target.src = '/images/no-image.png' }}
            />
          </div>
        )}

        {/* 설명 */}
        {image.description && (
          <div className="prose prose-lg max-w-none text-base md:text-lg leading-[1.8] text-[#2C2C2C] font-light tracking-[-0.01em] break-keep whitespace-pre-wrap mb-16">
            {image.description}
          </div>
        )}

        {/* 파일 정보 */}
        <div className="mt-24">
          <div className="flex items-end justify-between border-b border-[#171717] pb-3 mb-2">
            <h4 className="font-mono text-[11px] font-bold text-[#171717] tracking-widest uppercase">File Info</h4>
          </div>
          <div className="flex items-center gap-4 py-4 border-b border-[#E5E5E5] px-3 -mx-3">
            <FileText size={20} className="text-[#737373] shrink-0" />
            <span className="flex-1 text-sm md:text-base text-[#171717] truncate">{image.originalFilename ?? '-'}</span>
            <span className="font-mono text-[10px] text-[#737373] tracking-widest shrink-0">{fmtFileSize(image.fileSize)}</span>
          </div>
          {isGroup && (
            <div className="flex items-center gap-4 py-4 border-b border-[#E5E5E5] px-3 -mx-3">
              <HardDrive size={20} className="text-[#737373] shrink-0" />
              <span className="flex-1 text-sm md:text-base text-[#171717]">그룹 이미지</span>
              <span className="font-mono text-[10px] text-[#737373] tracking-widest shrink-0">{groupImages.length} FILES</span>
            </div>
          )}
        </div>

        {/* 목록으로 */}
        <div className="mt-20 flex justify-center pb-8">
          <button
            onClick={() => navigate('/department/gallery')}
            className="border border-[#E5E5E5] bg-transparent text-xs font-bold tracking-[0.1em] uppercase py-5 px-16 text-[#171717] hover:bg-[#171717] hover:text-[#FAF9F6] hover:border-[#171717] transition-all duration-300 flex items-center gap-3"
          >
            <List size={18} />
            <span>목록으로 돌아가기</span>
          </button>
        </div>
      </article>

      {/* 삭제 확인 모달 */}
      {deleteOpen && (
        <DeleteModal
          title={image.title}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </main>
  )
}

export default GalleryDetailPage
