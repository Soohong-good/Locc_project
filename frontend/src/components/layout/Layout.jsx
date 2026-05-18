import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import PopupOverlay from '@/components/common/PopupOverlay'

const Layout = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <PopupOverlay />
    </div>
  )
}

export default Layout
