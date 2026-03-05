import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'

/**
 * 설교 카드 컴포넌트
 * - 목록 페이지에서 공통으로 사용
 */
const SermonCard = ({ sermon, backPath, onEdit, onDelete }) => {
  const navigate = useNavigate()
  const isAdmin = useAuthStore((s) => s.isAdmin())

  const formatDate = (date) => {
    if (!date) return ''
    return String(date).replace(/-/g, '.')
  }

  const handleCardClick = () => {
    navigate(`/worship/sermon/${sermon.id}`, { state: { backPath } })
  }

  return (
    <article className="group bg-white border border-slate-200 hover:border-slate-900 hover:shadow-lg transition-all duration-300 relative">
      {/* 관리자 버튼 */}
      {isAdmin && (
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(sermon) }}
            className="px-3 py-1 text-xs bg-white border border-slate-300 hover:border-slate-900 transition"
          >
            수정
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(sermon) }}
            className="px-3 py-1 text-xs bg-white border border-red-300 text-red-600 hover:border-red-600 transition"
          >
            삭제
          </button>
        </div>
      )}

      <div className="p-8 cursor-pointer" onClick={handleCardClick}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400 font-light tracking-wide">
            {formatDate(sermon.sermonDate)}
          </p>
          {sermon.isNew && (
            <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded">NEW</span>
          )}
        </div>
        <h3 className="text-2xl font-light text-slate-900 leading-tight mb-4 group-hover:text-slate-600 transition line-clamp-2">
          {sermon.title}
        </h3>
        <p className="text-base text-slate-600 mb-4 font-medium">{sermon.scripture}</p>
        <p className="text-sm text-slate-500">{sermon.preacher}</p>
      </div>

      <div
        className="px-8 py-4 bg-slate-50 group-hover:bg-slate-900 transition-colors cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 group-hover:text-white transition font-medium">
            설교 보기
          </span>
          <svg
            className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </article>
  )
}

export default SermonCard
