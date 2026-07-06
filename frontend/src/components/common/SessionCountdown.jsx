import { useEffect, useState } from 'react'
import { Clock } from '@phosphor-icons/react'

// 관리자/운영자 세션(refreshToken) 남은 시간 — 1초마다 갱신, rotation 성공 시마다 expiresAt이 늘어남
const SessionCountdown = ({ expiresAt, className = '' }) => {
  const [now, setNow] = useState(null)

  useEffect(() => {
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!expiresAt || now === null) return null
  const remainingMs = expiresAt - now
  if (remainingMs <= 0) return null

  const totalSec = Math.floor(remainingMs / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const label = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
  const isLow = remainingMs < 5 * 60 * 1000

  return (
    <span className={`inline-flex items-center gap-1 font-mono whitespace-nowrap ${isLow ? 'text-[#ba1a1a]' : ''} ${className}`}>
      <Clock size={12} weight={isLow ? 'fill' : 'regular'} />
      {label}
    </span>
  )
}

export default SessionCountdown
