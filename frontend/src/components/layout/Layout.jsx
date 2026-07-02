import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

/** 자체 마무리 섹션이 있어 공용 Footer를 제외할 페이지 */
const NO_FOOTER_ROUTES = [
  '/worship/newyear',
  '/worship/sermon/training-message',
  '/worship/training-intro',
]

const Layout = () => {
  const { pathname } = useLocation()
  const showFooter = !NO_FOOTER_ROUTES.includes(pathname)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  )
}

export default Layout
