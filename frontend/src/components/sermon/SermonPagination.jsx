/**
 * SermonPagination — 개선된 페이지네이션
 * - 현재 페이지 인디케이터
 * - 이전/다음 화살표 아이콘
 * - 많은 페이지 수 처리 (앞뒤 2개 + 생략 표시)
 */
const SermonPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null

  // 표시할 페이지 번호 계산 (최대 7개)
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)

    const pages = []
    const left  = Math.max(0, currentPage - 2)
    const right = Math.min(totalPages - 1, currentPage + 2)

    if (left > 0)              pages.push(0)
    if (left > 1)              pages.push('...')
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages - 2) pages.push('...')
    if (right < totalPages - 1) pages.push(totalPages - 1)

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="mt-14 flex justify-center items-center gap-1">
      {/* 이전 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="w-9 h-9 flex items-center justify-center border border-slate-200 text-slate-600
          hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed
          transition-colors duration-150"
        aria-label="이전 페이지"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* 페이지 번호 */}
      {pageNumbers.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 flex items-center justify-center text-sm font-medium
              border transition-colors duration-150
              ${page === currentPage
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900'
              }`}
          >
            {page + 1}
          </button>
        )
      )}

      {/* 다음 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="w-9 h-9 flex items-center justify-center border border-slate-200 text-slate-600
          hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed
          transition-colors duration-150"
        aria-label="다음 페이지"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 현재 페이지 표시 */}
      <span className="ml-3 text-xs text-slate-400">
        {currentPage + 1} / {totalPages}
      </span>
    </div>
  )
}

export default SermonPagination
