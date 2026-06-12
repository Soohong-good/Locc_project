import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'

// PWA 제거 후속: 남아있는 서비스 워커/캐시 정리 (자폭 sw.js와 함께 이중 안전)
// 옛 SW가 옛 자산을 캐시 서빙하는 문제 방지 — 등록된 SW 해제 + 캐시 삭제
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((regs) => regs.forEach((reg) => reg.unregister()))
    .catch(() => {})
  if (window.caches?.keys) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {})
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 창 포커스 시 자동 재요청 비활성화 (교회 관리 시스템 특성상 불필요)
      refetchOnWindowFocus: false,
      // 네트워크 재연결 시 자동 재요청
      refetchOnReconnect: true,
      // 기본 staleTime: 1분
      staleTime: 60 * 1000,
      // 4xx 클라이언트 에러는 재시도하지 않고, 그 외는 최대 2회 재시도
      retry: (failureCount, error) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) return false
        return failureCount < 2
      },
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
