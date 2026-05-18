import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'

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
