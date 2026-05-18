import axios from 'axios'

/**
 * Axios 인스턴스
 *
 * 개발 환경: vite.config.js proxy 설정으로 /api → localhost:8080 포워딩
 * 운영 환경: 같은 도메인이므로 baseURL 불필요
 *
 * 토큰 전달 방식: HttpOnly 쿠키 (withCredentials: true)
 * - 요청 인터셉터에서 토큰을 직접 주입하지 않음 (브라우저가 쿠키 자동 전송)
 * - CSRF: JWT + Stateless 구조이므로 /api/** 전체 비활성화 (SecurityConfig 참고)
 */
const client = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // HttpOnly 쿠키 자동 전송
  timeout: 15000,
})

// ───── 응답 인터셉터: 토큰 만료 시 자동 갱신 ─────
let isRefreshing = false
let refreshQueue = []  // 갱신 중 대기 중인 요청들

const processQueue = (error) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve()
  })
  refreshQueue = []
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 401 + 최초 시도 → 자동 갱신 시도
    // 아래 URL은 갱신 시도 제외
    //   - /api/auth/login    : 로그인 실패 401은 갱신 대상이 아님
    //   - /api/auth/me       : 비로그인 상태에서 401이 정상 응답 (AuthInitializer)
    //   - /api/auth/refresh  : 갱신 자체가 실패한 것 → 재시도 불필요
    const skipRefreshUrls = ['/api/auth/me', '/api/auth/refresh', '/api/auth/login']
    const isSkipUrl = skipRefreshUrls.some((url) => originalRequest.url?.includes(url))

    const isTokenExpired =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isSkipUrl

    if (!isTokenExpired) {
      return Promise.reject(error)
    }

    // 이미 갱신 중이면 큐에 대기
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then(() => client(originalRequest))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // refreshToken 쿠키는 브라우저가 자동 전송 — body 불필요
      await client.post('/api/auth/refresh', null)

      processQueue(null)
      return client(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)
      // window.location.href 강제 이동 제거
      // → 라우트 이동은 React Router(PrivateRoute)가 담당
      //   clearAuth()는 AuthInitializer의 isError 핸들러에서 처리됨
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default client
