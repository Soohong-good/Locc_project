import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGalleryImageList, deleteGalleryImage } from '@/api/departments'
import { SkeletonRow } from '@/components/ui/SkeletonCard'

// ── 부서 탭 정의 (DB code 기준) ───────────────────────────────────────────
const DEPT_TABS = [
  { code: 'nursery',      label: '태영아부' },
  { code: 'preschool',    label: '유아유치부' },
  { code: 'children',     label: '초등부' },
  { code: 'youth',        label: '중고등부' },
  { code: 'young-adults', label: '청년부' },
  { code: 'newcomers',    label: '새가족부' },
  { code: 'multiethnic',  label: '다민족부' },
]

// ── 날짜 포맷 ─────────────────────────────────────────────────────────────
const fmtDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── 이미지 썸네일 ─────────────────────────────────────────────────────────
const GalleryThumb = ({ filename }) => {
  const src = filename ? `/uploads/gallery/${filename}` : null
  return src ? (
    <div className="w-14 h-14 rounded border border-gray-200 bg-cover bg-center shrink-0"
      style={{ backgroundImage: `url(${src})` }} />
  ) : (
    <div className="w-14 h-14 rounded border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  )
}

// ── 부서별 갤러리 목록 탭 콘텐츠 ──────────────────────────────────────────
const GalleryTabContent = ({ deptCode }) => {
  const [page, setPage] = useState(0)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'gallery', deptCode, page],
    queryFn:  () => getGalleryImageList(deptCode, page),
    staleTime: 30 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: ({ imageId }) => deleteGalleryImage(deptCode, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'gallery', deptCode] }),
  })

  const handleDelete = (imageId, title) => {
    if (!confirm(`"${title}" 갤러리를 삭제하시겠습니까?`)) return
    deleteMutation.mutate({ imageId })
  }

  // getGalleryImageList → PageResponse 구조
  const items      = data?.content ?? []
  const pageInfo   = data?.pageInfo ?? {}
  const totalPages = pageInfo.totalPages ?? 0
  const currentPage = pageInfo.page ?? 0

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
        {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    )
  }
  if (isError) {
    return <p className="text-center text-sm text-red-500 py-16">갤러리 목록을 불러올 수 없습니다.</p>
  }
  if (items.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-16">등록된 갤러리가 없습니다.</p>
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: '72px' }} />
            <col />
            <col style={{ width: '52px' }} />
            <col style={{ width: '96px' }} />
            <col style={{ width: '96px' }} />
            <col style={{ width: '44px' }} />
            <col style={{ width: '72px' }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">이미지</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">제목</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell whitespace-nowrap">장수</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell whitespace-nowrap">업로더</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell whitespace-nowrap">등록일</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell whitespace-nowrap">조회</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2">
                  <Link to={`/department/${deptCode}/gallery/${item.id}`}>
                    <GalleryThumb filename={item.thumbnailFilename ?? item.storedFilename} />
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/department/${deptCode}/gallery/${item.id}`}
                    className="text-gray-800 font-medium hover:text-blue-600 hover:underline block truncate max-w-[240px]"
                  >
                    {item.title ?? '(제목 없음)'}
                  </Link>
                  {item.description && (
                    <span className="text-xs text-gray-400 block truncate max-w-[240px]">{item.description}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell whitespace-nowrap">
                  {item.imageCount ?? 1}장
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                  {item.uploaderName ?? '-'}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell whitespace-nowrap">
                  {fmtDate(item.createdAt)}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell whitespace-nowrap">
                  {item.viewCount ?? 0}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/department/${deptCode}/gallery/${item.id}`}
                      className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      보기
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id, item.title ?? '(제목 없음)')}
                      disabled={deleteMutation.isPending}
                      className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-5">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                i === currentPage
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>{i + 1}</button>
          ))}
        </div>
      )}
    </>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────
const AdminGalleryPage = () => {
  const [activeTab, setActiveTab] = useState('nursery')

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">갤러리 관리</h1>
      </div>

      {/* 부서 탭 */}
      <div className="flex border-b border-gray-200 mb-5 overflow-x-auto">
        {DEPT_TABS.map((tab) => (
          <button key={tab.code} onClick={() => setActiveTab(tab.code)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.code
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 — key로 강제 리마운트 → 페이지 초기화 */}
      <GalleryTabContent key={activeTab} deptCode={activeTab} />
    </div>
  )
}

export default AdminGalleryPage
