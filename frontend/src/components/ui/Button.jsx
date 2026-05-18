/**
 * Button 디자인 시스템
 *
 * variant:
 *   primary   — bg-slate-900 (기본 CTA)
 *   secondary — border outline (보조 액션)
 *   ghost     — 텍스트 전용 (취소, 뒤로가기)
 *   danger    — red (삭제 전용)
 *
 * size:
 *   sm   — px-4 py-2  text-sm
 *   md   — px-6 py-3  text-base  (기본)
 *   lg   — px-8 py-4  text-lg
 */

const VARIANTS = {
  primary:
    'bg-slate-900 text-white hover:bg-slate-700 active:bg-slate-950 disabled:bg-slate-300',
  secondary:
    'border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white active:bg-slate-950 disabled:border-slate-300 disabled:text-slate-300',
  ghost:
    'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 disabled:text-slate-300',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
}

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

const Button = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  isLoading = false,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-colors duration-200 disabled:cursor-not-allowed select-none'

  return (
    <button
      className={`${base} ${VARIANTS[variant] ?? VARIANTS.primary} ${SIZES[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
          처리 중...
        </>
      ) : children}
    </button>
  )
}

export default Button
