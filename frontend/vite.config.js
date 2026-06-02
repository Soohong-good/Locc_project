import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['title_icon.png', 'title_icon.ico'],
      manifest: {
        name: '그리스도 사랑교회',
        short_name: '사랑교회',
        description: '그리스도 사랑교회 공식 앱',
        theme_color: '#1e3a5f',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'ko',
        icons: [
          {
            src: '/title_icon.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/title_icon.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/title_icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // 새 SW가 활성화되면 즉시 모든 탭 제어 (구 청크 404 방지)
        clientsClaim: true,
        // API, OAuth 요청은 캐시 안 함
        navigateFallbackDenylist: [/^\/api\//, /^\/oauth2\//, /^\/login\/oauth2\//],
        runtimeCaching: [
          {
            // API 응답: NetworkFirst (항상 최신 데이터 우선)
            urlPattern: /^https?:\/\/.*\/api\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 10 },
          },
          {
            // 유튜브 썸네일: CacheFirst (변하지 않는 외부 이미지)
            urlPattern: /^https:\/\/img\.youtube\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'youtube-thumbs',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Google Fonts: CacheFirst
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
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
