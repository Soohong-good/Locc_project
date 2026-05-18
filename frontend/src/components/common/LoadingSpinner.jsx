/**
 * LoadingSpinner — 디자인 시스템 통일
 *
 * fullScreen=true  → 페이지 전체 중앙 (초기 로딩)
 * fullScreen=false → 섹션 내 인라인 (부분 로딩)
 * size: sm | md | lg
 */
const LoadingSpinner = ({ fullScreen = true, size = 'md' }) => {
  const sizeClass = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-2',
  }[size] ?? 'w-7 h-7 border-2'

  const spinner = (
    <div
      className={`${sizeClass} rounded-full border-slate-200 border-t-slate-700 animate-spin`}
    />
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-xs text-slate-400 tracking-[0.15em]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-16">
      {spinner}
    </div>
  )
}

export default LoadingSpinner
