import axios from 'axios'
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants'

/**
 * Axios 인스턴스
 *
 * 개발 환경: vite.config.js proxy 설정으로 /api → localhost:8080 포워딩
 * 운영 환경: 같은 도메인이므로 baseURL 불필요
 */
const client = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,  // JWT Bearer 방식 사용, 쿠키 불필요
})

// ───── 요청 인터셉터: Authorization 헤더 자동 주입 ─────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ───── 응답 인터셉터: 토큰 만료 시 자동 갱신 ─────
let isRefreshing = false
let refreshQueue = []  // 갱신 중 대기 중인 요청들

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  refreshQueue = []
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 401 + 토큰 만료 → 자동 갱신 시도
    const isTokenExpired =
      error.response?.status === 401 &&
      !originalRequest._retry

    if (!isTokenExpired) {
      return Promise.reject(error)
    }

    // 이미 갱신 중이면 큐에 대기
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return client(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

    if (!refreshToken) {
      // 리프레시 토큰 없음 → 로그아웃 처리
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post('/api/auth/refresh', { refreshToken })
      const newToken = data.data.accessToken
      const newRefresh = data.data.refreshToken

      localStorage.setItem(TOKEN_KEY, newToken)
      if (newRefresh) localStorage.setItem(REFRESH_TOKEN_KEY, newRefresh)

      client.defaults.headers.common.Authorization = `Bearer ${newToken}`
      originalRequest.headers.Authorization = `Bearer ${newToken}`

      processQueue(null, newToken)
      return client(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export default client
