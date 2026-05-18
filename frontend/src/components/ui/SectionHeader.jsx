/**
 * SectionHeader — eyebrow + 제목 + 구분선 패턴 통일
 *
 * Props:
 *   eyebrow   — 상단 소문자 레이블 (ex. "About Church")
 *   title     — 메인 제목
 *   subtitle  — 선택적 부제목
 *   divider   — 하단 구분선 표시 여부 (기본 true)
 *   center    — 가운데 정렬 여부 (기본 false)
 *   light     — 다크 배경용 흰색 텍스트 (기본 false)
 *   className — 외부 추가 클래스
 */

const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  divider = true,
  center = false,
  light = false,
  className = '',
}) => {
  const align        = center ? 'text-center' : ''
  const titleColor   = light ? 'text-white' : 'text-slate-900'
  const subtitleColor = light ? 'text-slate-300' : 'text-slate-500'
  const dividerAlign = center ? 'mx-auto' : ''

  return (
    <div className={`mb-12 ${align} ${className}`}>
      {eyebrow && (
        <p className={`text-xs font-medium tracking-[0.3em] uppercase mb-3 ${light ? 'text-slate-400' : 'text-eyebrow'}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`text-3xl md:text-4xl lg:text-5xl font-light tracking-tight ${titleColor}`}>
        {title}
      </h2>
      {divider && (
        <div className={`h-[2px] w-10 mt-5 bg-slate-200 ${dividerAlign}`} />
      )}
      {subtitle && (
        <p className={`text-base font-light mt-5 leading-relaxed ${subtitleColor}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default SectionHeader
