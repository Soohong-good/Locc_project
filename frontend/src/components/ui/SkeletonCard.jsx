/**
 * SkeletonCard — 로딩 상태 플레이스홀더
 *
 * variant:
 *   card    — 설교 카드, 부서 카드 등 grid 레이아웃용
 *   row     — 공지 목록 등 row 레이아웃용
 *   hero    — YouTube 영상 썸네일 스켈레톤
 */

const Skeleton = ({ className = '' }) => (
  <div className={`skeleton-shimmer rounded ${className}`} />
)

export const SkeletonCardItem = () => (
  <div className="bg-white border border-slate-200 p-8">
    <Skeleton className="h-3 w-1/4 mb-5" />
    <Skeleton className="h-6 w-3/4 mb-3" />
    <Skeleton className="h-5 w-2/4 mb-2" />
    <Skeleton className="h-4 w-1/3 mb-8" />
    <div className="border-t border-slate-100 pt-4 mt-4">
      <Skeleton className="h-4 w-1/4" />
    </div>
  </div>
)

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 py-5 px-4 border-b border-slate-200">
    <Skeleton className="h-4 w-6 flex-shrink-0" />
    <Skeleton className="h-5 flex-1" />
    <Skeleton className="h-4 w-24 flex-shrink-0" />
    <Skeleton className="h-4 w-20 flex-shrink-0" />
  </div>
)

export const SkeletonHero = () => (
  <div className="aspect-video w-full skeleton-shimmer rounded-lg" />
)

/** count개의 카드 스켈레톤 그리드 */
const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCardItem key={i} />
    ))}
  </div>
)

export default SkeletonGrid
