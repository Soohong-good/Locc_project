import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['zustand', 'date-fns'],
        },
      },
    },
  },
  server: {
    port: 3000,
    // ngrok 등 외부 터널링 도구 사용 시 호스트 허용
    allowedHosts: true,
    // 개발 환경: /api/** 요청을 Spring Boot(8080)으로 프록시
    // 이렇게 하면 CORS 없이 같은 오리진처럼 동작
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 업로드 파일 (이미지, PDF 등) 서빙
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 소셜 로그인 시작 요청 (카카오/네이버)
      '/oauth2/authorization': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Spring Security OAuth2 내부 콜백 처리 경로 (정규식으로 정확히 한정)
      '^/login/oauth2/.*': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
