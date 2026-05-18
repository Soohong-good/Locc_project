/**
 * Badge — 상태 배지 컴포넌트
 *
 * variant:
 *   new    — 빨간 NEW 배지
 *   pin    — 고정 핀 배지 (amber)
 *   admin  — 관리자 표시 (blue)
 *   info   — 정보성 (slate)
 */

const VARIANTS = {
  new:   'bg-red-500 text-white',
  pin:   'bg-amber-100 text-amber-700 border border-amber-200',
  admin: 'bg-blue-50 text-blue-600 border border-blue-100',
  info:  'bg-slate-100 text-slate-600',
}

const Badge = ({ variant = 'info', children, className = '' }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${VARIANTS[variant]} ${className}`}
  >
    {children}
  </span>
)

export default Badge
