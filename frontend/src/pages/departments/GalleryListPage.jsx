import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CaretRight, CaretLeft, Eye, Images, Stack,
} from '@phosphor-icons/react'
import toast from '@/utils/toast'
import { getGalleryList } from '@/api/gallery'
import { deleteGalleryImage } from '@/api/departments'
import { DEPARTMENTS } from '@/constants/departments'
import useAuthStore from '@/stores/authStore'
import Button from '@/components/ui/Button'
import GalleryUploadModal from '@/components/gallery/GalleryUploadModal'
import GalleryEditModal from '@/components/gallery/GalleryEditModal'
import { getPageRange } from '@/utils/pagination'
import { formatDateDot as fmtDate } from '@/utils/dateFormat'

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
                          loading="lazy"
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
