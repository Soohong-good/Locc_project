import { useEffect, useRef, useState } from 'react'

/**
 * Intersection Observer 기반 스크롤 진입 애니메이션 훅
 *
 * 사용법:
 *   const { ref, isVisible } = useScrollAnimation()
 *   <div ref={ref} className={isVisible ? 'animate-fade-in-up' : 'opacity-0'}>
 *
 * @param {number} threshold - 요소가 이 비율만큼 보일 때 트리거 (기본 0.1)
 * @param {string} rootMargin - 뷰포트 마진 (기본 '0px 0px -60px 0px')
 * @param {boolean} once - 한 번만 트리거할지 여부 (기본 true)
 */
const useScrollAnimation = ({
  threshold = 0.1,
  rootMargin = '0px 0px -60px 0px',
  once = true,
} = {}) => {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, isVisible }
}

export default useScrollAnimation
