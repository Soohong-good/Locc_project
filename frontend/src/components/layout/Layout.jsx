import Header from './Header'

/**
 * 공통 레이아웃
 * - Header + main 콘텐츠 영역
 * - 페이지 컴포넌트를 children으로 전달
 *
 * 사용:
 *   <Route element={<Layout />}>
 *     <Route index element={<MainPage />} />
 *   </Route>
 */
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
