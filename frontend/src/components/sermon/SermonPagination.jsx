/**
 * 설교 목록 페이지네이션
 */
const SermonPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null

  // 최대 5개 페이지 버튼 표시
  const getPageNumbers = () => {
    const delta = 2
    const range = []
    const left = Math.max(0, currentPage - delta)
    const right = Math.min(totalPages - 1, currentPage + delta)
    for (let i = left; i <= right; i++) range.push(i)
    return range
  }

  return (
    <div className="mt-16 flex justify-center items-center gap-2">
      <button
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-4 py-2 border border-slate-300 hover:border-slate-900 transition text-slate-700 hover:text-slate-900 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      >
        이전
      </button>

      <div className="flex gap-1">
        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-4 py-2 border transition font-medium ${
              pageNum === currentPage
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
            }`}
          >
            {pageNum + 1}
          </button>
        ))}
      </div>

      <button
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-4 py-2 border border-slate-300 hover:border-slate-900 transition text-slate-700 hover:text-slate-900 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      >
        다음
      </button>
    </div>
  )
}

export default SermonPagination
