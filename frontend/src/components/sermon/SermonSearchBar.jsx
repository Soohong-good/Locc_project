import { useState } from 'react'
import Button from '@/components/ui/Button'

/**
 * 설교 검색 바
 * - keyword (제목/본문), preacher (설교자) 검색
 * - 검색 중 표시, 초기화 버튼
 * - onSearch(keyword, preacher) 콜백
 */
const SermonSearchBar = ({ initialKeyword = '', initialPreacher = '', onSearch, stickyTop = 'top-[95px]' }) => {
  const [keyword, setKeyword]   = useState(initialKeyword)
  const [preacher, setPreacher] = useState(initialPreacher)

  const hasFilter = keyword.trim() || preacher.trim()

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch?.(keyword.trim(), preacher.trim())
  }

  const handleClear = () => {
    setKeyword('')
    setPreacher('')
    onSearch?.('', '')
  }

  return (
    <section className={`sticky ${stickyTop} z-40 py-5 bg-white px-6 border-b border-slate-200 shadow-sm`}>
      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          {/* 제목 검색 */}
          <div className="relative flex-1 group">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-700 transition-colors"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="설교 제목, 성경 본문 검색"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 bg-slate-50
                focus:bg-white focus:border-slate-900 focus:outline-none transition-colors"
            />
          </div>

          {/* 설교자 검색 */}
          <div className="relative sm:w-44 group">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-700 transition-colors"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <input
              type="text"
              value={preacher}
              onChange={(e) => setPreacher(e.target.value)}
              placeholder="설교자"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 bg-slate-50
                focus:bg-white focus:border-slate-900 focus:outline-none transition-colors"
            />
          </div>

          {/* 검색 버튼 */}
          <Button type="submit" size="sm">검색</Button>

          {/* 초기화 버튼 — 필터 있을 때만 */}
          {hasFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-slate-500"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
              초기화
            </Button>
          )}
        </form>

        {/* 현재 검색 조건 표시 */}
        {hasFilter && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-slate-400">검색 조건:</span>
            {keyword && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                제목: {keyword}
              </span>
            )}
            {preacher && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                설교자: {preacher}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default SermonSearchBar
