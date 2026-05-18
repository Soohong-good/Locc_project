import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '@/stores/authStore'
import { getDashboard } from '@/api/dashboard'
import { getNotices } from '@/api/notices'
import { getSundayMorningData, getSundayAfternoonData, getWeekdayData, getTrainingMessageData } from '@/api/sermons'
import { getBulletins } from '@/api/bulletins'
import { getRecentGallery } from '@/api/departments'

// ── 유틸 ──────────────────────────────────────────────────────────────────

const fmt = (n) => (n ?? 0).toLocaleString()

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// ── SVG 라인 차트 ─────────────────────────────────────────────────────────

const LineChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-gray-400">
        데이터가 없습니다
      </div>
    )
  }

  const W = 560
  const H = 140
  const PAD = { top: 10, right: 16, bottom: 28, left: 36 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const maxVal = Math.max(...data.map((d) => d.count), 1)
  const minVal = 0

  const xScale = (i) => PAD.left + (data.length > 1 ? (i / (data.length - 1)) * innerW : innerW / 2)
  const yScale = (v) => PAD.top + innerH - ((v - minVal) / (maxVal - minVal)) * innerH

  const points = data.map((d, i) => `${xScale(i)},${yScale(d.count)}`).join(' ')

  // Y축 눈금 (0, max/2, max)
  const yTicks = [0, Math.round(maxVal / 2), maxVal]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
      {/* 그리드 */}
      {yTicks.map((tick, ti) => (
        <line
          key={`grid-${ti}`}
          x1={PAD.left}
          x2={W - PAD.right}
          y1={yScale(tick)}
          y2={yScale(tick)}
          stroke="#f0f0f0"
          strokeWidth="1"
        />
      ))}

      {/* Y축 레이블 */}
      {yTicks.map((tick, ti) => (
        <text
          key={`ylabel-${ti}`}
          x={PAD.left - 4}
          y={yScale(tick) + 4}
          textAnchor="end"
          fontSize="10"
          fill="#9ca3af"
        >
          {tick}
        </text>
      ))}

      {/* X축 레이블 */}
      {data.map((d, i) => (
        <text
          key={`xlabel-${i}`}
          x={xScale(i)}
          y={H - 6}
          textAnchor="middle"
          fontSize="10"
          fill="#9ca3af"
        >
          {d.date}
        </text>
      ))}

      {/* 면적 채우기 */}
      <polygon
        points={`${PAD.left},${PAD.top + innerH} ${points} ${W - PAD.right},${PAD.top + innerH}`}
        fill="#3b82f6"
        fillOpacity="0.08"
      />

      {/* 라인 */}
      <polyline
        points={points}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* 데이터 포인트 */}
      {data.map((d, i) => (
        <g key={`pt-${i}`}>
          <circle cx={xScale(i)} cy={yScale(d.count)} r="4" fill="#3b82f6" />
          <title>{`${d.date}: ${d.count}명`}</title>
        </g>
      ))}
    </svg>
  )
}

// ── 스켈레톤 ─────────────────────────────────────────────────────────────

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
)

// ── 통계 카드 ─────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color = 'text-gray-900', to }) => {
  const inner = (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow h-full">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{fmt(value)}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
  return to ? <Link to={to} className="block">{inner}</Link> : inner
}

// ── 콘텐츠 카드 ──────────────────────────────────────────────────────────

const ContentCard = ({ label, total, recent, to }) => (
  <Link
    to={to}
    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow block"
  >
    <div className="flex items-start justify-between mb-3">
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      <span className="text-xs text-blue-600 font-medium">전체 보기 →</span>
    </div>
    <div className="flex items-end gap-4">
      <div>
        <p className="text-xs text-gray-400">전체</p>
        <p className="text-2xl font-bold text-gray-900">{fmt(total)}</p>
      </div>
      <div className="mb-0.5">
        <p className="text-xs text-gray-400">최근 7일</p>
        <p className="text-lg font-semibold text-green-600">+{fmt(recent)}</p>
      </div>
    </div>
  </Link>
)

// ── 게시물 탭 목록 ────────────────────────────────────────────────────────

const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const RecentItemRow = ({ title, sub, date, to }) => (
  <Link
    to={to}
    className="flex items-center justify-between py-2.5 px-1 hover:bg-gray-50 rounded-lg transition-colors group"
  >
    <div className="flex-1 min-w-0 mr-4">
      <span className="text-sm text-gray-700 truncate block group-hover:text-blue-600 transition-colors">
        {title}
      </span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
    <span className="text-xs text-gray-400 shrink-0">{date}</span>
  </Link>
)

const EmptyRow = () => (
  <div className="py-8 text-center text-sm text-gray-400">게시물이 없습니다</div>
)

const ListSkeleton = () => (
  <div className="space-y-1">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="animate-pulse flex justify-between items-center py-2.5 px-1">
        <div className="h-4 bg-gray-200 rounded w-3/5" />
        <div className="h-3 bg-gray-200 rounded w-16" />
      </div>
    ))}
  </div>
)

// ── 설교 서브패널 (2단 탭 유지) ─────────────────────────────────────────

const SERMON_MAIN_TABS = [
  {
    key: 'sunday_morning', label: '주일 오전',
    subs: [
      { key: 'sunday_morning_1', label: '1부' },
      { key: 'sunday_morning_2', label: '2부' },
    ],
  },
  {
    key: 'weekday', label: '기타예배',
    subs: [
      { key: 'weekday_wednesday', label: '수요예배' },
      { key: 'weekday_friday',    label: '금요기도회' },
    ],
  },
  { key: 'training', label: '훈련용예배' },
]

const SERMON_VIEW_ALL = {
  sunday_morning_1:  '/worship/sermon/sunday-morning',
  sunday_morning_2:  '/worship/sermon/sunday-morning',
  weekday_wednesday: '/worship/sermon/weekday',
  weekday_friday:    '/worship/sermon/weekday',
  training:          '/worship/sermon/training-message',
}

const SermonSubPanel = () => {
  const [activeMain, setActiveMain] = useState('sunday_morning')
  const [activeSub,  setActiveSub]  = useState('sunday_morning_1')

  const handleMainTab = (tab) => {
    setActiveMain(tab.key)
    setActiveSub(tab.subs ? tab.subs[0].key : tab.key)
  }

  const activeLeaf = (() => {
    const main = SERMON_MAIN_TABS.find(t => t.key === activeMain)
    return main?.subs ? activeSub : activeMain
  })()

  const sm1Q = useQuery({ queryKey: ['dash','sermon','sm1'], queryFn: () => getSundayMorningData({ serviceNumber:1, page:0, size:10 }), staleTime: 60 * 1000 })
  const sm2Q = useQuery({ queryKey: ['dash','sermon','sm2'], queryFn: () => getSundayMorningData({ serviceNumber:2, page:0, size:10 }), staleTime: 60 * 1000 })
  const wedQ = useQuery({ queryKey: ['dash','sermon','wed'], queryFn: () => getWeekdayData({ type:'wednesday', page:0, size:10 }), staleTime: 60 * 1000 })
  const friQ = useQuery({ queryKey: ['dash','sermon','fri'], queryFn: () => getWeekdayData({ type:'friday',    page:0, size:10 }), staleTime: 60 * 1000 })
  const trnQ = useQuery({ queryKey: ['dash','sermon','trn'], queryFn: () => getTrainingMessageData({ page:0, size:10 }), staleTime: 60 * 1000 })

  const QMAP = { sunday_morning_1: sm1Q, sunday_morning_2: sm2Q, weekday_wednesday: wedQ, weekday_friday: friQ, training: trnQ }
  const current   = QMAP[activeLeaf]
  const items     = (current?.data?.sermons ?? []).slice(0, 10)
  const currentMain = SERMON_MAIN_TABS.find(t => t.key === activeMain)

  return (
    <div>
      {/* 2차 탭 — 예배 카테고리 */}
      <div className="flex items-center justify-between border-b border-gray-100 mb-1">
        <div className="flex overflow-x-auto">
          {SERMON_MAIN_TABS.map((tab) => (
            <button key={tab.key} onClick={() => handleMainTab(tab)}
              className={`shrink-0 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeMain === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >{tab.label}</button>
          ))}
        </div>
        <Link to={SERMON_VIEW_ALL[activeLeaf]} className="text-xs text-blue-500 hover:underline shrink-0 ml-2">전체 보기 →</Link>
      </div>

      {/* 3차 서브탭 — 1부/2부, 수요/금요 */}
      {currentMain?.subs && (
        <div className="flex gap-1 mb-2">
          {currentMain.subs.map((sub) => (
            <button key={sub.key} onClick={() => setActiveSub(sub.key)}
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full transition-colors ${
                activeSub === sub.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >{sub.label}</button>
          ))}
        </div>
      )}

      {current?.isLoading ? <ListSkeleton /> : items.length === 0 ? <EmptyRow /> : (
        <div className="divide-y divide-gray-50">
          {items.map((item, idx) => (
            <RecentItemRow key={item.id ?? idx} title={item.title}
              date={formatDateShort(item.sermonDate ?? item.createdAt)}
              to={`/worship/sermon/${item.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── 공지사항 서브패널 ────────────────────────────────────────────────────

const NoticeSubPanel = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dash', 'notices'],
    queryFn: () => getNotices({ page: 0, size: 10 }),
    staleTime: 60 * 1000,
  })
  const items = (data?.content ?? []).slice(0, 10)
  return (
    <div>
      <div className="flex justify-end mb-1">
        <Link to="/notices" className="text-xs text-blue-500 hover:underline">전체 보기 →</Link>
      </div>
      {isLoading ? <ListSkeleton /> : items.length === 0 ? <EmptyRow /> : (
        <div className="divide-y divide-gray-50">
          {items.map((item, idx) => (
            <RecentItemRow key={item.id ?? idx} title={item.title}
              date={formatDateShort(item.createdAt)}
              to={`/notices/${item.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── 주보 서브패널 ────────────────────────────────────────────────────────

const BulletinSubPanel = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dash', 'bulletins'],
    queryFn: () => getBulletins({ page: 0, size: 10 }),
    staleTime: 60 * 1000,
  })
  const items = (data?.content ?? []).slice(0, 10)
  return (
    <div>
      <div className="flex justify-end mb-1">
        <Link to="/bulletin" className="text-xs text-blue-500 hover:underline">전체 보기 →</Link>
      </div>
      {isLoading ? <ListSkeleton /> : items.length === 0 ? <EmptyRow /> : (
        <div className="divide-y divide-gray-50">
          {items.map((item, idx) => (
            <RecentItemRow key={item.id ?? idx} title={item.title}
              date={formatDateShort(item.createdAt)}
              to={`/bulletin/${item.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── 갤러리 서브패널 ──────────────────────────────────────────────────────

const GallerySubPanel = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dash', 'gallery'],
    queryFn: () => getRecentGallery({ page: 0, size: 10 }),
    staleTime: 60 * 1000,
  })
  const items = (data?.content ?? []).slice(0, 10)
  return (
    <div>
      <div className="flex justify-end mb-1">
        <span className="text-xs text-gray-400">부서 갤러리 전체</span>
      </div>
      {isLoading ? <ListSkeleton /> : items.length === 0 ? <EmptyRow /> : (
        <div className="divide-y divide-gray-50">
          {items.map((item, idx) => (
            <RecentItemRow key={item.id ?? idx}
              title={item.title ?? '(제목 없음)'}
              sub={item.departmentName}
              date={formatDateShort(item.createdAt)}
              to={`/department/${item.departmentCode}/gallery/${item.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── 게시물 탭 패널 (1차: 설교/공지/주보/갤러리) ──────────────────────────

const POST_TABS = [
  { key: 'sermon',  label: '설교' },
  { key: 'notice',  label: '공지사항' },
  { key: 'bulletin',label: '주보' },
  { key: 'gallery', label: '갤러리' },
]

const RecentPostsPanel = () => {
  const [activeTab, setActiveTab] = useState('sermon')

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* 1차 탭 */}
      <div className="flex border-b border-gray-100 px-5 pt-4">
        {POST_TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {/* 서브패널 */}
      <div className="px-5 py-3 min-h-[300px]">
        {activeTab === 'sermon'   && <SermonSubPanel />}
        {activeTab === 'notice'   && <NoticeSubPanel />}
        {activeTab === 'bulletin' && <BulletinSubPanel />}
        {activeTab === 'gallery'  && <GallerySubPanel />}
      </div>
    </div>
  )
}

// ── 메인 페이지 ──────────────────────────────────────────────────────────

const AdminDashboardPage = () => {
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getDashboard,
    staleTime: 60 * 1000,
  })

  // 주간 차트 데이터 가공
  const weeklyChart = (data?.visitorStatistics?.weeklyData ?? [])
    .map((p) => ({ date: formatDate(p.date), count: p.count ?? 0 }))
    .sort((a, b) => (a.date > b.date ? 1 : -1))

  const now = new Date()
  const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <div className="p-8 space-y-8">

      {/* 헤더 */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
          <p className="text-sm text-gray-500 mt-0.5">안녕하세요, {user?.name}님</p>
        </div>
        <p className="text-xs text-gray-400">{timeStr} 기준</p>
      </div>

      {/* ── 방문자 통계 ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">방문자 현황</h2>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <StatCard label="오늘 방문자" value={data?.visitorStatistics?.todayCount} color="text-blue-600" />
            <StatCard label="어제 방문자" value={data?.visitorStatistics?.yesterdayCount} />
            <StatCard label="주간 방문자" value={data?.visitorStatistics?.weekCount} sub="최근 7일 합계" />
          </div>
        )}

        {/* 주간 추이 그래프 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 mb-4">주간 방문자 추이</p>
          {isLoading
            ? <Skeleton className="h-40" />
            : <LineChart data={weeklyChart} />
          }
        </div>
      </section>

      {/* ── 회원 / 도움문의 통계 ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">주요 현황</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="전체 회원" value={data?.totalUsers} sub={`승인 완료 ${fmt(data?.approvedUsers)}명`} to="/admin/users" />
            <StatCard
              label="승인 대기"
              value={data?.pendingUsers}
              sub="승인이 필요한 회원"
              color={data?.pendingUsers > 0 ? 'text-red-500' : 'text-gray-900'}
              to="/admin/users"
            />
            <StatCard label="도움문의 전체" value={data?.totalHelpRequests} to="/admin/help-requests" />
            <StatCard
              label="미처리 문의"
              value={data?.pendingHelpRequests}
              sub={`처리중 ${fmt(data?.inProgressHelpRequests)}건 포함`}
              color={data?.pendingHelpRequests > 0 ? 'text-amber-500' : 'text-gray-900'}
              to="/admin/help-requests"
            />
          </div>
        )}
      </section>

      {/* ── 최근 게시물 ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">최근 게시물</h2>
        <RecentPostsPanel />
      </section>

      {/* ── 빠른 이동 ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">빠른 이동</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { to: '/admin/notices',       label: '공지사항' },
            { to: '/admin/sermons',       label: '설교' },
            { to: '/admin/users',         label: '회원 관리' },
            { to: '/admin/popups',        label: '팝업' },
            { to: '/admin/youtube',       label: 'YouTube' },
            { to: '/admin/help-requests', label: '도움문의' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-center px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}

export default AdminDashboardPage
