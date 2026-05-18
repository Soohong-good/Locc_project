/**
 * 설교 삭제 확인 모달
 */
const SermonDeleteModal = ({ target, onCancel, onConfirm, isDeleting }) => {
  if (!target) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-md overflow-hidden shadow-2xl">

        <div className="px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-medium text-slate-900">설교 삭제</h2>
              <p className="text-sm text-slate-500 mt-0.5 font-light">이 작업은 되돌릴 수 없습니다</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          <p className="text-slate-600 mb-3 font-light">다음 설교를 삭제하시겠습니까?</p>
          <p className="font-medium text-slate-900 bg-slate-50 px-4 py-3">{target.title}</p>
        </div>

        <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-8 py-2.5 bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300 font-medium transition-all shadow-sm"
          >
            {isDeleting ? '삭제 중...' : '삭제하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SermonDeleteModal
