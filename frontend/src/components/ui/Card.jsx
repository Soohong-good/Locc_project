/**
 * Card 디자인 시스템
 *
 * variant:
 *   default  — white + border, hover 시 border-slate-900 + shadow
 *   flat     — slate-50 배경, hover 시 white + shadow-sm
 *   dark     — slate-800 다크 섹션 내부용
 */

const VARIANTS = {
  default:
    'bg-white border border-slate-200 hover:border-slate-900 hover:shadow-md',
  flat:
    'bg-slate-50 hover:bg-white hover:shadow-sm',
  dark:
    'bg-slate-800 text-white hover:bg-slate-700',
}

const Card = ({ variant = 'default', className = '', children, onClick, ...props }) => {
  const base = 'transition-all duration-200'
  const interactive = onClick ? 'cursor-pointer' : ''

  return (
    <div
      className={`${base} ${VARIANTS[variant]} ${interactive} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
