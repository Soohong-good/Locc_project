import { useQuery } from '@tanstack/react-query'
import { getPendingCount } from '@/api/users'
import { Link } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'

/**
 * 관리자 대시보드
 * - 승인 대기 회원 수 표시
 * - 각 관리 영역 바로가기
 */
const AdminDashboardPage = () => {
  const { user } = useAuthStore()

  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['admin', 'users', 'pending', 'count'],
    queryFn: getPendingCount,
  })

  const cards = [
    { to: '/admin/notices', label: '공지사항 관리', desc: '공지사항 작성·수정·삭제·고정', color: 'bg-blue-50 border-blue-200' },
    { to: '/admin/sermons', label: '설교 관리', desc: '설교 등록·수정·삭제', color: 'bg-green-50 border-green-200' },
    {
      to: '/admin/users',
      label: '회원 관리',
      desc: `승인 대기 ${pendingCount}명`,
      color: pendingCount > 0 ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200',
      badge: pendingCount > 0 ? pendingCount : null,
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">안녕하세요, {user?.name}님</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ to, label, desc, color, badge }) => (
          <Link
            key={to}
            to={to}
            className={`block border rounded-xl p-5 hover:shadow-md transition-shadow ${color}`}
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              {badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboardPage
