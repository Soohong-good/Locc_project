import { Routes, Route } from 'react-router-dom'
import AuthInitializer from '@/components/common/AuthInitializer'
import PrivateRoute from '@/components/common/PrivateRoute'
import OAuth2Callback from '@/components/common/OAuth2Callback'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/pages/auth/LoginPage'
import MainPage from '@/pages/MainPage'
import NotFoundPage from '@/pages/NotFoundPage'

/**
 * 라우트 구조
 *
 * 공통 레이아웃 (Header 포함):
 *   /              → MainPage
 *
 * 레이아웃 없음 (전체 화면):
 *   /login         → LoginPage
 *   /oauth2/callback → OAuth2Callback
 *
 * 인증 필요 (Layout 포함):
 *   /mypage        → PrivateRoute > MyPage  (추후 추가)
 *
 * 관리자 전용 (Layout 포함):
 *   /admin/**      → PrivateRoute adminOnly  (Step 6에서 추가)
 */
const App = () => {
  return (
    <>
      {/* 앱 시작 시 토큰 검증 — 렌더링 없는 컴포넌트 */}
      <AuthInitializer />

      <Routes>
        {/* 레이아웃 없는 페이지 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />

        {/* 공통 레이아웃 (Header 포함) */}
        <Route element={<Layout />}>
          <Route index element={<MainPage />} />

          {/* 인증 필요 라우트 */}
          {/* <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} /> */}

          {/* 관리자 전용 라우트 — Step 6에서 추가 */}
          {/* <Route path="/admin/*" element={<PrivateRoute adminOnly><AdminLayout /></PrivateRoute>} /> */}
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
