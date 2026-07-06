import { Link } from 'react-router-dom'
import { BookmarkSimple, Paperclip, Eye } from '@phosphor-icons/react'

export const PinnableListHeader = () => (
  <div className="hidden md:grid grid-cols-[60px_1fr_auto] gap-4 px-4 py-3 border-b border-[#E5E5E5] text-[11px] font-mono text-[#A3A3A3] uppercase tracking-widest">
    <div>No.</div>
    <div>Title</div>
    <div className="text-right w-32">Date</div>
  </div>
)

// 공지사항 · 찬양악보 목록에서 공유하는 "고정 가능한" 행 — No/제목/날짜 3열,
// 모바일에서는 grid를 세로 카드로 접는다 (원래 grid-cols-[60px_1fr_auto]가
// 375px에서 그대로 쓰이면 Date(w-32)+No(60px)만으로 폭이 부족해 제목이 심하게 잘렸음)
export const PinnableListRow = ({
  no,
  isPinned,
  title,
  titleHref,
  onTitleClick,
  hasAttachments,
  isNew,
  date,
  authorName,
  authorRole,
  viewCount,
  canManage,
  isAdmin,
  onTogglePin,
  pinPending,
  onDelete,
}) => {
  const authorLabel = (authorRole === 'ADMIN' || authorRole === 'OPERATOR') ? '관리자' : authorName

  return (
  <div
    className={`flex flex-col gap-1.5 md:grid md:grid-cols-[60px_1fr_auto] md:gap-4 px-4 py-4 md:py-5 border-b border-[#E5E5E5] hover:bg-[#F4F2EA] transition-colors md:items-center group ${
      isPinned ? 'bg-[#F4F2EA]' : ''
    }`}
  >
    <div className="hidden md:block font-mono text-sm text-[#737373]">
      {isPinned ? <BookmarkSimple size={16} weight="fill" className="text-[#171717]" /> : no}
    </div>
    <div className="flex items-center gap-2 min-w-0">
      {isPinned && <BookmarkSimple size={14} weight="fill" className="text-[#171717] md:hidden flex-shrink-0" />}
      {titleHref ? (
        <Link
          to={titleHref}
          className={`text-base truncate group-hover:text-[#171717] transition-colors ${
            isPinned ? 'font-bold text-[#171717]' : 'font-medium text-[#2C2C2C]'
          }`}
        >
          {title}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onTitleClick}
          className={`text-base truncate group-hover:text-[#171717] transition-colors text-left ${
            isPinned ? 'font-bold text-[#171717]' : 'font-medium text-[#2C2C2C]'
          }`}
        >
          {title}
        </button>
      )}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {hasAttachments && <Paperclip size={13} className="text-[#A3A3A3]" />}
        {isNew && (
          <span className="border border-[#171717] px-1.5 py-0.5 text-[10px] font-mono text-[#171717] uppercase tracking-wider leading-none">N</span>
        )}
      </div>
      {canManage && (
        <div className="flex gap-1.5 flex-shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {isAdmin && (
            <button
              onClick={onTogglePin}
              disabled={pinPending}
              className={`p-1.5 transition-colors text-xs border ${isPinned ? 'border-[#171717] bg-[#171717] text-[#FAF9F6]' : 'border-[#E5E5E5] text-[#737373] hover:border-[#171717]'}`}
            >
              <BookmarkSimple size={12} weight={isPinned ? 'fill' : 'regular'} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 border border-[#E5E5E5] text-red-500 hover:border-red-500 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
    {/* 모바일: 날짜·작성자·조회수 한 줄로 — 날짜만 덩그러니 있으면 게시판처럼 안 보여서 정보 보강 */}
    <div className="md:hidden flex items-center gap-2 flex-wrap font-mono text-xs text-[#A3A3A3]">
      <span>{date}</span>
      {authorLabel && <span>· {authorLabel}</span>}
      {viewCount != null && (
        <span className="inline-flex items-center gap-1">· <Eye size={12} />{viewCount}</span>
      )}
    </div>
    {/* 데스크탑: 날짜만 (테이블 컬럼) */}
    <div className="hidden md:block font-mono text-sm text-[#737373] text-right w-32">{date}</div>
  </div>
  )
}
