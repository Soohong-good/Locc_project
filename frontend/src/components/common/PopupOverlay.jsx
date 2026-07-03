import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import DOMPurify from 'dompurify'
import { getActivePopups } from '@/api/popups'

const STORAGE_KEY_TODAY = 'popup_closed_today'  // localStorage — 오늘 하루 닫기

/** javascript: 등 위험한 프로토콜 주입 방지 */
const safeUrl = (url) => {
  if (!url) return null
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

/** 날짜 → YYYY.MM.DD */
const fmtDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

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
  } catch { /* localStorage 접근 실패 시 무시 */ }
}

// ── 클래식 모달 팝업 (Design 01) ─────────────────────────────────────────────
const SliderPopup = ({ popups, onClose, onCloseToday }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sliding,      setSliding]      = useState(false)
  const [direction,    setDirection]    = useState('next')
  const [dontShowToday, setDontShowToday] = useState(false)

  const safeIndex = Math.min(currentIndex, popups.length - 1)
  const popup     = popups[safeIndex]
  const total     = popups.length

  // 첫 번째 팝업 기준으로 크기/위치 고정
  const firstPopup = popups[0]
  const w  = firstPopup.popupWidth  ?? 500
  const h  = firstPopup.popupHeight ?? 400
  const px = firstPopup.positionX   ?? 100
  const py = firstPopup.positionY   ?? 100
  const bodyMax = Math.max(120, h - 112) // 헤더(약 56) + 푸터(56) 제외

  const goTo = (nextIndex, dir) => {
    if (sliding || nextIndex === safeIndex) return
    setDirection(dir)
    setSliding(true)
    setTimeout(() => {
      setCurrentIndex(nextIndex)
      setSliding(false)
    }, 240)
  }

  const handlePrev = () => { if (safeIndex > 0)         goTo(safeIndex - 1, 'prev') }
  const handleNext = () => { if (safeIndex < total - 1) goTo(safeIndex + 1, 'next') }
  // 확인: "오늘 하루 보지 않기" 체크 시 오늘 하루 닫기, 아니면 일반 닫기
  const handleConfirm = () => { dontShowToday ? onCloseToday() : onClose() }

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

  const dateStr = fmtDate(popup.displayStartDate ?? popup.createdAt)

  return (
    <div
      style={{ position: 'fixed', top: py, left: px, width: w, zIndex: 9000 }}
      className="bg-[#FAF9F6] border border-[#E5E5E5] shadow-xl flex flex-col overflow-hidden"
    >
      {/* ── 헤더: 검은 바 ── */}
      <div className="bg-[#171717] px-5 py-4 flex justify-between items-center text-[#FAF9F6] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-bold tracking-wide">공지사항</span>
          {total > 1 && (
            <span className="text-xs font-mono text-[#737373]">{safeIndex + 1} / {total}</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-[#737373] hover:text-white transition-colors"
          aria-label="닫기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── 본문 (이미지 + 날짜 + 제목 + 내용) ── */}
      <div className="relative flex-shrink-0">
        <div
          style={{ maxHeight: bodyMax, overflowY: 'auto' }}
          className={`transition-all duration-[240ms] ease-in-out ${slideClass}`}
        >
          {popup.imageUrl && (
            safeUrl(popup.linkUrl) ? (
              <a href={safeUrl(popup.linkUrl)} target="_blank" rel="noopener noreferrer">
                <img src={popup.imageUrl} alt={popup.title} loading="lazy" className="w-full object-cover" />
              </a>
            ) : (
              <img src={popup.imageUrl} alt={popup.title} loading="lazy" className="w-full object-cover" />
            )
          )}
          <div className="p-6">
            {dateStr && <span className="font-mono text-xs text-[#737373] mb-2 block">{dateStr}</span>}
            <h2 className="text-xl font-bold text-[#171717] mb-4 tracking-tight">{popup.title}</h2>
            {popup.content && (
              <div
                className="text-sm text-[#737373] leading-relaxed ql-editor"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(popup.content) }}
                style={{ padding: 0 }}
              />
            )}
          </div>
        </div>

        {/* 좌/우 화살표 (팝업 2개 이상) */}
        {total > 1 && (
          <>
            <button
              onClick={handlePrev}
              disabled={safeIndex === 0 || sliding}
              className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center disabled:opacity-0 transition-opacity"
              aria-label="이전 팝업"
            >
              <span className="flex items-center justify-center w-8 h-8 bg-[#171717]/70 hover:bg-[#171717] transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </span>
            </button>
            <button
              onClick={handleNext}
              disabled={safeIndex === total - 1 || sliding}
              className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center disabled:opacity-0 transition-opacity"
              aria-label="다음 팝업"
            >
              <span className="flex items-center justify-center w-8 h-8 bg-[#171717]/70 hover:bg-[#171717] transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </>
        )}
      </div>

      {/* 도트 인디케이터 */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-2 py-2 border-t border-[#E5E5E5] flex-shrink-0">
          {popups.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > safeIndex ? 'next' : 'prev')}
              className={`transition-all duration-200 ${
                i === safeIndex ? 'w-5 h-1.5 bg-[#171717]' : 'w-1.5 h-1.5 bg-[#E5E5E5] hover:bg-[#737373]'
              }`}
              aria-label={`${i + 1}번 팝업으로 이동`}
            />
          ))}
        </div>
      )}

      {/* ── 푸터: 오늘 하루 보지 않기(체크박스) + 확인 ── */}
      <div className="flex border-t border-[#E5E5E5] h-14 flex-shrink-0">
        <label className="flex-1 flex items-center px-4 cursor-pointer group hover:bg-[#E5E5E5]/30 transition-colors select-none">
          <span className="relative w-4 h-4 border border-[#737373] group-hover:border-[#171717] bg-white flex items-center justify-center mr-3">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="peer absolute opacity-0 w-full h-full cursor-pointer"
            />
            <svg className="w-3 h-3 text-[#171717] opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </span>
          <span className="text-xs text-[#737373] group-hover:text-[#171717]">오늘 하루 보지 않기</span>
        </label>
        <div className="w-[1px] bg-[#E5E5E5] h-full" />
        <button
          onClick={handleConfirm}
          className="w-28 bg-[#171717] text-[#FAF9F6] text-sm font-bold hover:bg-black transition-colors focus:outline-none"
        >
          확인
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
