import { create } from 'zustand'

/**
 * 인증 전역 상태 (Zustand)
 *
 * user: 현재 로그인한 사용자 정보 (null = 비로그인)
 * isInitialized: 앱 초기화(토큰 검증) 완료 여부
 *   → false 동안은 로딩 스피너 표시, 라우트 가드 판단 보류
 *
 * 토큰 관리: HttpOnly 쿠키 방식
 *   - 클라이언트에서 토큰을 직접 읽거나 삭제하지 않음
 *   - 로그아웃 시 서버가 쿠키를 만료 처리 (Set-Cookie maxAge=0)
 *
 * role 정규화:
 *   백엔드 UserAuthResponse: role = "ADMIN" | "USER"  (enum.name())
 *   백엔드 UserDetailResponse: role = "ADMIN" | "USER"  (enum 직렬화)
 *   → isAdmin()에서 두 형태 모두 처리
 */
const useAuthStore = create((set) => ({
  user: null,
  isInitialized: false,
  permissions: [], // 영역별 작성 권한 목록 ex) ['NOTICE', 'BULLETIN']

  // 로그인 성공 후 호출
  setUser: (user) => set({ user }),

  // 앱 초기화 완료 표시
  setInitialized: () => set({ isInitialized: true }),

  // 권한 목록 설정
  setPermissions: (permissions) => set({ permissions }),

  // 로그아웃 — 서버가 쿠키 삭제, 클라이언트는 상태만 초기화
  clearAuth: () => {
    set({ user: null, permissions: [] })
  },

  // 현재 로그인 유저 ID 조회
  getUserId: () => {
    const { user } = useAuthStore.getState()
    return user?.id ?? null
  },

  // 관리자 여부 — "ADMIN" / "ROLE_ADMIN" 두 형태 모두 처리
  isAdmin: () => {
    const { user } = useAuthStore.getState()
    if (!user?.role) return false
    return user.role === 'ADMIN' || user.role === 'ROLE_ADMIN'
  },

  // 운영자 여부
  isOperator: () => {
    const { user } = useAuthStore.getState()
    if (!user?.role) return false
    return user.role === 'OPERATOR' || user.role === 'ROLE_OPERATOR'
  },

  // 관리자 또는 운영자 여부
  isAdminOrOperator: () => {
    const { user } = useAuthStore.getState()
    if (!user?.role) return false
    const role = user.role
    return role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'OPERATOR' || role === 'ROLE_OPERATOR'
  },

  // 특정 영역 작성 권한 보유 여부 (관리자/운영자는 항상 true)
  canWrite: (area) => {
    const state = useAuthStore.getState()
    if (state.isAdminOrOperator()) return true
    return state.permissions.includes(area)
  },
}))

export default useAuthStore
