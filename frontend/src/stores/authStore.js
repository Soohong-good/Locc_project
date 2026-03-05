import { create } from 'zustand'
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants'

/**
 * 인증 전역 상태 (Zustand)
 *
 * user: 현재 로그인한 사용자 정보 (null = 비로그인)
 * isInitialized: 앱 초기화(토큰 검증) 완료 여부
 *   → false 동안은 로딩 스피너 표시, 라우트 가드 판단 보류
 */
const useAuthStore = create((set) => ({
  user: null,
  isInitialized: false,

  // 로그인 성공 후 호출
  setUser: (user) => set({ user }),

  // 앱 초기화 완료 표시
  setInitialized: () => set({ isInitialized: true }),

  // 로그아웃 — 토큰 삭제 + 상태 초기화
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    set({ user: null })
  },

  // 편의 getter: 관리자 여부
  isAdmin: () => {
    const { user } = useAuthStore.getState()
    return user?.role === 'ROLE_ADMIN'
  },
}))

export default useAuthStore
