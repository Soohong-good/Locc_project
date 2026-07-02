import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useLogout } from '@/hooks/useAuth'
import useAuthStore from '@/stores/authStore'
import {
  Newspaper, AppWindow, YoutubeLogo, Microphone, Megaphone, Images, UsersThree,
  ClipboardText, ChatCircleDots, Gauge, House, SignOut,
} from '@phosphor-icons/react'

const NAV_ITEMS = [
  { label: '대시보드',         Icon: Gauge,          path: '/admin',               exact: true },
  { label: '주보 관리',        Icon: Newspaper,      path: '/admin/bulletins'                  },
  { label: '팝업 관리',        Icon: AppWindow,      path: '/admin/popups'                     },
  { label: '유튜브 관리',      Icon: YoutubeLogo,    path: '/admin/youtube'                    },
  { label: '설교 관리',        Icon: Microphone,     path: '/admin/sermons'                    },
  { label: '공지사항 관리',    Icon: Megaphone,      path: '/admin/notices'                    },
  { label: '갤러리 관리',      Icon: Images,         path: '/admin/gallery'                    },
  { label: '계정 및 가입 관리',Icon: UsersThree,     path: '/admin/users'                      },
  { label: '신청 관리',        Icon: ClipboardText,  path: '/admin/applications'               },
  { label: '도움문의 관리',    Icon: ChatCircleDots, path: '/admin/help-requests'              },
]

const AdminLayout = () => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useAuthStore()
  const { mutate: logout } = useLogout()

  const initials = (user?.name ?? 'A')[0].toUpperCase()

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path)

  return (
    <div className="h-screen bg-[#f8f9ff] text-[#0b1c30] flex overflow-hidden">

      {/* ── 사이드바 ── */}
      <aside className="h-screen w-72 fixed left-0 top-0 border-r border-[#c5c6cd] bg-white flex flex-col py-1 shadow-sm z-50">

        {/* 로고 */}
        <div className="px-6 py-8 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#1e293b] flex items-center justify-center border-2 border-[#d8e3fb]">
            <span className="text-white text-xl font-bold select-none">G</span>
          </div>
          <div className="text-center">
            <h1 className="text-[18px] font-bold text-[#0b1c30] leading-tight">그리스도사랑교회</h1>
            <p className="text-[11px] text-[#45474c] tracking-widest mt-0.5 uppercase">Church Admin</p>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, Icon, path, exact }) => {
            const active = isActive({ path, exact })
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-[calc(100%-16px)] mx-2 text-left rounded-lg px-4 py-3 flex items-center gap-3 transition-colors text-[12px] font-medium tracking-wide ${
                  active
                    ? 'bg-[#fea619] text-[#684000] scale-[0.98]'
                    : 'text-[#45474c] hover:bg-[#e5eeff]'
                }`}
              >
                <Icon size={20} weight={active ? 'fill' : 'regular'} />
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

        {/* 하단 */}
        <div className="px-4 py-4 border-t border-[#c5c6cd] space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-medium text-[#45474c] hover:bg-[#e5eeff] transition-colors"
          >
            <House size={18} />
            홈페이지로
          </button>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center text-white text-[12px] font-bold">
                {initials}
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#0b1c30] leading-tight">{user?.name ?? '관리자'}</p>
                <p className="text-[10px] text-[#45474c]">{user?.email ?? ''}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 text-[#45474c] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
              title="로그아웃"
            >
              <SignOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── 콘텐츠 영역 ── */}
      <div className="ml-72 flex-1 flex flex-col h-screen overflow-hidden">
        <Outlet />
      </div>

    </div>
  )
}

export default AdminLayout
