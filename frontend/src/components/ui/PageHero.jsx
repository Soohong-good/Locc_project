/**
 * PageHero — 서브 페이지 상단 Hero 통일 컴포넌트
 *
 * Props:
 *   eyebrow   — 상단 영문 레이블
 *   title     — 페이지 제목 (한글)
 *   subtitle  — 선택적 설명
 *   dark      — 다크 배경 여부 (기본 true = bg-slate-900)
 *   bgImage   — 배경 이미지 URL (선택). 지정 시 이미지 + 오버레이로 렌더링
 *   bgSize    — background-size 값 (기본 'cover'). 이미지가 너무 확대될 때 조절
 *               예) 'cover' | 'contain' | '80%' | 'auto 100%'
 *   bgPosition — background-position 값 (기본 'center')
 *               예) 'center' | 'top' | 'center 30%'
 *   children  — 추가 UI (버튼, 탭 등)
 */

const PageHero = ({ eyebrow, title, subtitle, dark = true, bgImage, bgSize = 'cover', bgPosition = 'center', children }) => {
  const hasBg = Boolean(bgImage)

  /* 배경 이미지가 없을 때 기존 단색 배경 */
  const solidBg = dark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'

  /* 배경 이미지가 있을 때 — 이미지 + 어두운 오버레이 */
  const sectionStyle = hasBg
    ? {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: bgSize,
        backgroundPosition: bgPosition,
        backgroundRepeat: 'no-repeat',
      }
    : undefined

  return (
    <section
      className={`pt-page pb-12 md:pb-16 px-6 relative ${hasBg ? 'text-white' : solidBg}`}
      style={sectionStyle}
    >
      {/* 배경 이미지 오버레이 — 텍스트 가독성 확보 */}
      {hasBg && (
        <div className="absolute inset-0 bg-slate-900/65 pointer-events-none" />
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="animate-fade-in-up">
          {eyebrow && (
            <p className="text-xs font-medium tracking-[0.3em] uppercase mb-3 text-eyebrow">
              {eyebrow}
            </p>
          )}
          <h1 className="text-4xl md:text-5xl font-light leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className={`mt-4 text-lg font-light ${dark || hasBg ? 'text-slate-300' : 'text-slate-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  )
}

export default PageHero
