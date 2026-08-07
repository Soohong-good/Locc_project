import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CaretRight, CaretLeft, Eye, Images, Stack,
} from '@phosphor-icons/react'
import toast from '@/utils/toast'
import { getGalleryList } from '@/api/gallery'
import { deleteGalleryImage } from '@/api/departments'
import { CHURCH_GALLERY_CODE } from '@/constants/departments'
import useAuthStore from '@/stores/authStore'
import Button from '@/components/ui/Button'
import GalleryUploadModal from '@/components/gallery/GalleryUploadModal'
import GalleryEditModal from '@/components/gallery/GalleryEditModal'
import { getPageRange } from '@/utils/pagination'
import { formatDateDot as fmtDate } from '@/utils/dateFormat'

/* ── 히어로 ─────────────────────────────────────────────────── */
const HeroSection = ({ canWrite, onUpload }) => (
  <section className="pt-12 pb-16 border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24 border-x border-[#E5E5E5]">
      <div className="flex items-center gap-4 mb-6">
        <span className="w-8 h-px bg-[#171717]" />
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono">Church Gallery</span>
      </div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-[#171717]">갤러리</h1>
          <p className="text-[#737373] font-light text-sm mt-3">그리스도사랑교회의 예배와 행사 사진</p>
        </div>
        {canWrite && (
          <Button variant="primary" size="sm" onClick={onUpload}>
            + 이미지 업로드
          </Button>
        )}
      </div>
    </div>
  </section>
)

/* ── 메인 ───────────────────────────────────────────────────── */
const ChurchGalleryPage = () => {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const { isAdminOrOperator } = useAuthStore()
  // 교회 공식 갤러리이므로 관리자/운영자만 등록·수정·삭제 가능 (백엔드도 동일하게 제한)
  const canWrite = isAdminOrOperator?.() ?? false

  const [page,       setPage]       = useState(0)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [editImage,  setEditImage]  = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['galleries', CHURCH_GALLERY_CODE, page],
    queryFn:  () => getGalleryList({ departmentCode: CHURCH_GALLERY_CODE, page }),
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

  const goPage = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // PageResponse 구조: { content, pageInfo: { page, size, totalElements, totalPages } }
  const images      = data?.content   ?? []
  const pageInfo    = data?.pageInfo  ?? {}
  const totalPages  = pageInfo.totalPages ?? 0
  const currentPage = pageInfo.page       ?? 0

  return (
    <main className="pt-20 bg-[#FAF9F6]">
      <HeroSection canWrite={canWrite} onUpload={() => setUploadOpen(true)} />

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
                        onClick={() => navigate(`/church/gallery/${image.id}`)}
                      >
                        <img
                          src={`/uploads/gallery/${image.thumbnailFilename || image.storedFilename}`}
                          alt={image.title}
                          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => { e.target.src = '/images/no-image.png' }}
                        />

                        {/* 모바일: 하단 그라디언트에 제목만 항상 표시 (호버가 없어 하단 정보 오버레이를 못 보므로) */}
                        <div className="md:hidden absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#171717]/80 to-transparent p-4 pt-10">
                          <h3 className="text-[#FAF9F6] font-bold text-base break-keep truncate">{image.title}</h3>
                        </div>

                        {/* 데스크탑: 호버 시 상세 정보 오버레이 */}
                        <div className="hidden md:flex absolute inset-0 bg-[#171717]/40 opacity-0 group-hover:opacity-100 transition-opacity flex-col justify-end p-6">
                          <span className="text-[10px] font-mono text-[#FAF9F6]/80 uppercase tracking-widest mb-1">
                            {fmtDate(image.createdAt)}
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

                        {/* 수정/삭제 버튼 — 모바일은 항상 표시, 데스크탑은 호버 시 표시 */}
                        {canWrite && (
                          <div className="absolute top-3 right-3 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
              교회 사진이나 영상 자료에 대한 문의는 사무실(<a href="tel:053-962-8948" className="underline hover:text-[#171717]">053-962-8948</a>)로 연락 바랍니다.
            </p>
          </div>
        </div>
      </section>

      {uploadOpen && (
        <GalleryUploadModal
          deptCode={CHURCH_GALLERY_CODE}
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
          deptCode={CHURCH_GALLERY_CODE}
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

export default ChurchGalleryPage
