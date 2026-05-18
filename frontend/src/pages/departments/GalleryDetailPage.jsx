import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getGalleryImageDetail, getGalleryImagesByTitle, deleteGalleryImage } from '@/api/departments'
import useAuthStore from '@/stores/authStore'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import toast from '@/utils/toast'

const fmtDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`
}

const fmtFileSize = (bytes) => {
  if (!bytes) return '0 KB'
  return (bytes / 1024).toFixed(2) + ' KB'
}

// ── 삭제 확인 모달 ────────────────────────────────────────────────────────
const DeleteModal = ({ title, onClose, onConfirm, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white w-full max-w-md overflow-hidden shadow-2xl">
      {/* 헤더 */}
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
      {/* 내용 */}
      <div className="px-8 py-6">
        <p className="text-slate-600 mb-3 font-light">이 이미지를 삭제하시겠습니까?</p>
        <p className="font-medium text-slate-900 bg-slate-50 px-4 py-3 rounded">{title}</p>
      </div>
      {/* 푸터 */}
      <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
        <button onClick={onClose}
          className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
          취소
        </button>
        <button onClick={onConfirm} disabled={deleting}
          className="px-8 py-2.5 bg-red-600 text-white hover:bg-red-700 font-medium transition-all shadow-sm hover:shadow disabled:opacity-60">
          {deleting ? '삭제 중...' : '삭제하기'}
        </button>
      </div>
    </div>
  </div>
)

// ── 메인 ─────────────────────────────────────────────────────────────────
const GalleryDetailPage = () => {
  const { code, imageId } = useParams()
  const navigate          = useNavigate()
  const queryClient       = useQueryClient()
  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const isAdmin = isAdminFn()
  const canWrite = isAdminOrOperatorFn()
  const userId = getUserId()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  // 이미지 상세 (조회수 증가)
  const { data: image, isLoading, isError } = useQuery({
    queryKey: ['gallery-detail', code, imageId],
    queryFn:  () => getGalleryImageDetail(code, imageId),
    retry: false,
  })

  // 같은 제목 그룹 이미지
  const { data: groupImages } = useQuery({
    queryKey: ['gallery-group-images', code, image?.title],
    queryFn:  () => getGalleryImagesByTitle(code, image.title),
    enabled:  !!image?.title,
  })

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteGalleryImage(code, imageId)
      queryClient.invalidateQueries({ queryKey: ['gallery-list', code] })
      navigate(`/department/${code}`)
    } catch {
      toast.error('이미지 삭제 중 오류가 발생했습니다.')
      setDeleting(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

  if (isError || !image) return (
    <main className="pt-page pb-20 bg-slate-50 px-6 text-center">
      <p className="text-slate-500 mb-4">이미지를 찾을 수 없습니다.</p>
      <button onClick={() => navigate(`/department/${code}`)}
        className="px-6 py-3 bg-slate-900 text-white hover:bg-slate-800 transition">
        목록으로
      </button>
    </main>
  )

  const isGroup = groupImages && groupImages.length > 1

  return (
    <main>
      {/* Hero Section */}
      <section className="pt-page pb-20 bg-slate-50 px-6">
        <div className="max-w-4xl mx-auto">
          {/* 목록으로 */}
          <button
            onClick={() => navigate(`/department/${code}`)}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-12 group transition-all duration-300"
          >
            <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-light tracking-wide">목록으로</span>
          </button>

          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-4">Gallery</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-slate-900 leading-[1.3] tracking-tight mb-8">
              {image.title}
            </h1>
            <div className="h-px w-16 bg-slate-300 mb-8" />
          </div>

          {/* 메타 정보 */}
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 text-slate-500 font-light">
              {/* 날짜 */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{fmtDate(image.createdAt)}</span>
              </div>
              <span className="text-slate-300">•</span>
              {/* 조회수 */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{image.viewCount ?? 0}</span>
              </div>
            </div>

            {/* 관리자 삭제 버튼 */}
            {canWrite && (isAdmin || image?.uploaderId === userId) && (
              <button
                onClick={() => setDeleteOpen(true)}
                className="px-4 py-2 border-2 border-red-300 text-red-600 hover:border-red-600 transition font-medium"
              >
                삭제
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 이미지 섹션 */}
      <section className="py-24 bg-white px-6">
        <article className="max-w-5xl mx-auto">

          {/* 그룹 이미지 (2장 이상) */}
          {isGroup ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {groupImages.map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={`/uploads/gallery/${img.storedFilename}`}
                    alt={img.title}
                    loading="lazy"
                    className="w-full h-auto border border-slate-200 shadow-lg hover:shadow-xl transition-shadow"
                    onError={(e) => { e.target.src = '/images/no-image.png' }}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* 단일 이미지 */
            <div className="mb-12">
              <img
                src={`/uploads/gallery/${image.storedFilename}`}
                alt={image.title}
                loading="lazy"
                className="w-full h-auto border border-slate-200 shadow-lg"
                onError={(e) => { e.target.src = '/images/no-image.png' }}
              />
            </div>
          )}

          {/* 설명 */}
          {image.description && (
            <div className="prose prose-lg prose-slate max-w-none">
              <p className="text-slate-700 leading-[1.9] font-light text-lg whitespace-pre-wrap">
                {image.description}
              </p>
            </div>
          )}

          {/* 파일 정보 */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-sm tracking-[0.2em] text-eyebrow uppercase mb-6">File Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 파일명 */}
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-slate-500">파일명</p>
                  <p className="text-sm font-light text-slate-900">{image.originalFilename ?? '-'}</p>
                </div>
              </div>
              {/* 파일 크기 */}
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <div>
                  <p className="text-xs text-slate-500">파일 크기</p>
                  <p className="text-sm font-light text-slate-900">{fmtFileSize(image.fileSize)}</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-slate-50 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(`/department/${code}`)}
            className="group inline-flex items-center px-8 py-4 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 font-light tracking-wide"
          >
            <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            목록으로 돌아가기
          </button>
        </div>
      </section>

      {/* 삭제 모달 */}
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
