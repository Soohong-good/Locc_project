import { useNavigate } from 'react-router-dom'
import Badge from '@/components/ui/Badge'

/**
 * 설교 목록 카드 컴포넌트
 * - isAdmin: 총관리자 여부 (전체 수정/삭제 가능)
 * - canWrite: ADMIN 또는 OPERATOR 여부 (버튼 노출 여부 판단)
 * - userId: 현재 로그인 유저 ID (본인 게시물 판단용)
 * - 핸들러 전달 시 수정/삭제 버튼 표시
 */
const SermonCard = ({ sermon, isAdmin, canWrite, userId, onEdit, onDelete, detailBasePath = '/worship/sermon' }) => {
  const navigate = useNavigate()

  // 수정/삭제 버튼 노출 조건: 총관리자 OR 본인 게시물인 운영자
  const canEdit = canWrite && (isAdmin || sermon.authorId === userId)

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return String(dateStr).replace(/-/g, '.')
  }

  const extractVideoId = (url) => {
    if (!url) return null
    try {
      const u = new URL(url)
      if (u.hostname === 'youtu.be') return u.pathname.slice(1)
      return u.searchParams.get('v') || null
    } catch {
      return null
    }
  }

  const videoId = extractVideoId(sermon.videoUrl)
  const thumbUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : null

  const handleNavigate = () => navigate(`${detailBasePath}/${sermon.id}`)

  return (
    <article
      className="group bg-white border border-slate-200 hover:border-slate-800 hover:shadow-lg transition-all duration-250 relative flex flex-col overflow-hidden cursor-pointer"
      onClick={handleNavigate}
    >
      {/* 관리자 버튼 */}
      {canEdit && (
        <div
          className="absolute top-3 right-3 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit?.(sermon)}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:border-slate-700 hover:text-slate-900 shadow-sm transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => onDelete?.(sermon)}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-red-200 text-red-500 hover:border-red-500 hover:text-red-600 shadow-sm transition-colors"
          >
            삭제
          </button>
        </div>
      )}

      {/* 썸네일 (영상이 있을 때만) */}
      {thumbUrl && (
        <div className="relative overflow-hidden aspect-video bg-slate-100">
          <img
            src={thumbUrl}
            alt={sermon.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-250" />
          {/* 재생 힌트 아이콘 */}
          <div className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg className="w-4 h-4 text-slate-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* 카드 본문 */}
      <div className="p-6 flex-1 flex flex-col">
        {/* 날짜 + NEW 배지 */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            {formatDate(sermon.sermonDate)}
          </p>
          {sermon.isNew && <Badge variant="new">NEW</Badge>}
        </div>

        {/* 제목 */}
        <h3 className="text-lg font-medium text-slate-900 leading-snug mb-2 line-clamp-2 group-hover:text-slate-600 transition-colors duration-200 flex-1">
          {sermon.title}
        </h3>

        {/* 성경 본문 */}
        {sermon.scripture && (
          <p className="text-sm text-slate-500 mb-1">{sermon.scripture}</p>
        )}

        {/* 설교자 */}
        {sermon.preacher && (
          <p className="text-xs text-slate-400 mt-auto pt-3 border-t border-slate-100">
            {sermon.preacher}
          </p>
        )}
      </div>

      {/* 카드 하단 CTA 바 */}
      <div className="px-6 py-3.5 bg-slate-50 group-hover:bg-slate-900 transition-colors duration-250 border-t border-slate-100 group-hover:border-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 group-hover:text-slate-300 transition-colors">
            설교 보기
          </span>
          <svg
            className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-200"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </article>
  )
}

export default SermonCard
