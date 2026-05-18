import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import DOMPurify from 'dompurify'
import { getActivePopups } from '@/api/popups'

const STORAGE_KEY_TODAY = 'popup_closed_today'  // localStorage — 오늘 하루 닫기

const getClosedToday = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TODAY)
    if (!raw) return new Set()
    const { date, ids } = JSON.parse(raw)
    if (date !== new Date().toDateString()) return new Set()
    return new Set(ids)
  } catch {
    return new Set()
  }
}

const saveClosedToday = (idSet) => {
  try {
    localStorage.setItem(STORAGE_KEY_TODAY, JSON.stringify({
      date: new Date().toDateString(),
      ids:  Array.from(idSet),
    }))
  } catch {}
}

// ── 슬라이더 팝업 ────────────────────────────────────────────────────────────
const SliderPopup = ({ popups, onClose, onCloseToday }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sliding,      setSliding]      = useState(false)
  const [direction,    setDirection]    = useState('next')

  const safeIndex = Math.min(currentIndex, popups.length - 1)
  const popup     = popups[safeIndex]
  const total     = popups.length

  // 첫 번째 팝업 기준으로 크기/위치 고정
  const firstPopup = popups[0]
  const w  = firstPopup.popupWidth  ?? 500
  const h  = firstPopup.popupHeight ?? 400
  const px = firstPopup.positionX   ?? 100
  const py = firstPopup.positionY   ?? 100

  const goTo = (nextIndex, dir) => {
    if (sliding || nextIndex === safeIndex) return
    setDirection(dir)
    setSliding(true)
    setTimeout(() => {
      setCurrentIndex(nextIndex)
      setSliding(false)
    }, 240)
  }

  const handlePrev      = () => { if (safeIndex > 0)           goTo(safeIndex - 1, 'prev') }
  const handleNext      = () => { if (safeIndex < total - 1)   goTo(safeIndex + 1, 'next') }
  const handleClose      = () => { onClose() }
  const handleCloseToday = () => { onCloseToday() }

  useEffect(() => {
    if (currentIndex >= popups.length && popups.length > 0) {
      setCurrentIndex(popups.length - 1)
    }
  }, [popups.length, currentIndex])

  const slideClass = sliding
    ? direction === 'next'
      ? 'translate-x-[-10px] opacity-0'
      : 'translate-x-[10px] opacity-0'
    : 'translate-x-0 opacity-100'

  // 도트 인디케이터가 차지할 높이 (팝업 2개 이상일 때만)
  const DOT_AREA_H = total > 1 ? 36 : 0
  // 콘텐츠 영역 실제 높이 = 등록 높이 - 도트 영역
  const contentH = h - DOT_AREA_H

  return (
    <div
      style={{
        position: 'fixed',
        top:      py,
        left:     px,
        width:    w,
        zIndex:   9000,
      }}
      className="bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
    >
      {/* ── 헤더: 제목 + 닫기만 ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm font-medium text-gray-800 truncate">{popup.title}</span>
          {total > 1 && (
            <span className="flex-shrink-0 text-xs text-gray-400">
              {safeIndex + 1}/{total}
            </span>
          )}
        </div>
        <button
          onClick={handleClose}
          className="ml-2 p-1 text-gray-400 hover:text-gray-700 transition flex-shrink-0"
          aria-label="닫기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── 콘텐츠 영역 (화살표 오버레이 + 도트 포함) ── */}
      <div
        className="relative flex-shrink-0"
        style={{ maxHeight: h }}
      >
        {/* 슬라이드 콘텐츠 */}
        <div
          style={{ maxHeight: contentH, overflowY: 'auto' }}
          className={`transition-all duration-[240ms] ease-in-out ${slideClass}`}
        >
          {popup.imageUrl && (
            popup.linkUrl ? (
              <a href={popup.linkUrl} target="_blank" rel="noopener noreferrer">
                <img src={popup.imageUrl} alt={popup.title} loading="lazy" className="w-full object-cover" />
              </a>
            ) : (
              <img src={popup.imageUrl} alt={popup.title} loading="lazy" className="w-full object-cover" />
            )
          )}
          {popup.content && (
            <div
              className="text-sm text-gray-700 ql-editor"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(popup.content) }}
              style={{ padding: '1rem' }}
            />
          )}
        </div>

        {/* 도트 인디케이터 — 콘텐츠 영역 맨 아래 정중앙 */}
        {total > 1 && (
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2"
            style={{ height: DOT_AREA_H }}
          >
            {popups.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > safeIndex ? 'next' : 'prev')}
                className={`rounded-full transition-all duration-200 ${
                  i === safeIndex
                    ? 'w-5 h-2 bg-gray-700'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-500'
                }`}
                aria-label={`${i + 1}번 팝업으로 이동`}
              />
            ))}
          </div>
        )}

        {/* 좌측 화살표 — 세로 중앙, 콘텐츠 영역 왼쪽 사이드 */}
        {total > 1 && (
          <button
            onClick={handlePrev}
            disabled={safeIndex === 0 || sliding}
            className="absolute left-0 top-0 bottom-0 flex items-center justify-center
                       w-14 disabled:opacity-0 transition-all duration-150"
            style={{ marginBottom: DOT_AREA_H }}
            aria-label="이전 팝업"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 transition">
              <svg className="w-6 h-6 drop-shadow-lg text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </span>
          </button>
        )}

        {/* 우측 화살표 — 세로 중앙, 콘텐츠 영역 오른쪽 사이드 */}
        {total > 1 && (
          <button
            onClick={handleNext}
            disabled={safeIndex === total - 1 || sliding}
            className="absolute right-0 top-0 bottom-0 flex items-center justify-center
                       w-14 disabled:opacity-0 transition-all duration-150"
            style={{ marginBottom: DOT_AREA_H }}
            aria-label="다음 팝업"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 transition">
              <svg className="w-6 h-6 drop-shadow-lg text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        )}
      </div>

      {/* ── 하단 베젤: 오늘 하루 보지 않기 + 닫기 ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={handleCloseToday}
          className="text-xs text-gray-500 hover:text-gray-700 transition"
        >
          오늘 하루 보지 않기
        </button>
        <button
          onClick={handleClose}
          className="text-xs text-gray-500 hover:text-gray-700 transition"
        >
          닫기
        </button>
      </div>
    </div>
  )
}

// ── 팝업 오버레이 (최상위) ────────────────────────────────────────────────────
const PopupOverlay = () => {
  const [closedTodayIds, setClosedTodayIds] = useState(() => getClosedToday())
  const [closedNowIds,   setClosedNowIds]   = useState(new Set())  // 닫기 — 메모리만 (새로고침 시 초기화)

  const { data: popups = [] } = useQuery({
    queryKey: ['popups', 'active'],
    queryFn:  getActivePopups,
    staleTime: 60 * 1000,
  })

  useEffect(() => { saveClosedToday(closedTodayIds) }, [closedTodayIds])

  const visiblePopups = popups.filter(
    (p) => !closedTodayIds.has(p.id) && !closedNowIds.has(p.id)
  )

  // 일반 닫기 — React state만 (새로고침하면 다시 표시)
  const handleClose = () => {
    setClosedNowIds((prev) => new Set([...prev, ...visiblePopups.map((p) => p.id)]))
  }

  // 오늘 하루 보지 않기 — localStorage에 저장 (오늘 자정까지)
  const handleCloseToday = () => {
    setClosedTodayIds((prev) => new Set([...prev, ...visiblePopups.map((p) => p.id)]))
  }

  if (visiblePopups.length === 0) return null

  return (
    <SliderPopup
      popups={visiblePopups}
      onClose={handleClose}
      onCloseToday={handleCloseToday}
    />
  )
}

export default PopupOverlay
