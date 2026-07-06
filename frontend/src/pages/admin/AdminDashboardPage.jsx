import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { YoutubeLogo, Images, Plus } from '@phosphor-icons/react'
import useAuthStore from '@/stores/authStore'
import { getDashboard } from '@/api/dashboard'
import { getNotices } from '@/api/notices'
import { getSundayMorningGroupedData, getWeekdayData, getTrainingMessageData } from '@/api/sermons'
import { getBulletins } from '@/api/bulletins'
import { getRecentGallery } from '@/api/departments'
import { getAdminApplications } from '@/api/applications'

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
        fillOpacity="0.12"
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

// ── 알림 배너 ─────────────────────────────────────────────────────────────

const AlertBanner = ({ pendingUsers = 0, pendingHelpRequests = 0 }) => {
  const alerts = [
    pendingUsers > 0 && {
      message: `승인 대기 중인 회원이 ${pendingUsers}명 있습니다`,
      to: '/admin/users',
      label: '회원 관리로 이동',
    },
    pendingHelpRequests > 0 && {
      message: `미처리 도움문의가 ${pendingHelpRequests}건 있습니다`,
      to: '/admin/help-requests',
      label: '도움문의로 이동',
    },
  ].filter(Boolean)

  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            {alert.message}
          </div>
          <Link
            to={alert.to}
            className="shrink-0 ml-4 text-sm font-medium text-blue-600 hover:underline"
          >
            {alert.label} →
          </Link>
        </div>
      ))}
    </div>
  )
}

// ── 스켈레톤 ─────────────────────────────────────────────────────────────

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
)

// ── 통계 카드 ─────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color = 'text-gray-900', pulse = false, to }) => {
  const inner = (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow h-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">{label}</p>
        {pulse && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />}
      </div>
      <p className={`text-3xl font-extrabold ${color}`}>{fmt(value)}</p>
      {sub && <p className="text-xs text-gray-400 mt-1 truncate">{sub}</p>}
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

// ── 게시물 테이블 공통 컴포넌트 ──────────────────────────────────────────

const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

/** 테이블 행: tag(선택) + 제목 링크 + 날짜 */
const PostTableRow = ({ tag, title, date, to }) => (
  <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
    {tag !== undefined && (
      <td className="py-2.5 pr-3 w-24 shrink-0">
        <span className="text-[11px] text-gray-400 whitespace-nowrap">{tag}</span>
      </td>
    )}
    <td className="py-2.5 pr-4">
      <Link
        to={to}
        className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors line-clamp-1 block"
      >
        {title}
      </Link>
    </td>
    <td className="py-2.5 w-24 text-right whitespace-nowrap">
      <span className="text-xs text-gray-400">{date}</span>
    </td>
  </tr>
)

/** 빈 상태 */
const PostTableEmpty = ({ colSpan = 2 }) => (
  <tr>
    <td colSpan={colSpan} className="py-8 text-center text-sm text-gray-400">
      게시물이 없습니다
    </td>
  </tr>
)

/** 스켈레톤 */
const PostTableSkeleton = ({ rows = 6, cols = 2 }) => (
  <>
    {[...Array(rows)].map((_, i) => (
      <tr key={i} className="border-b border-gray-50">
        {cols === 3 && (
          <td className="py-2.5 pr-3 w-24">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-14" />
          </td>
        )}
        <td className="py-2.5 pr-4">
          <div className="h-3.5 bg-gray-200 rounded animate-pulse w-2/3" />
        </td>
        <td className="py-2.5 w-24 text-right">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-12 ml-auto" />
        </td>
      </tr>
    ))}
  </>
)

/** 테이블 래퍼: hasTag=true이면 구분 컬럼 포함 */
const PostTable = ({ hasTag = false, viewAllTo, viewAllLabel = '전체 보기 →', children }) => (
  <div>
    {viewAllTo && (
      <div className="flex justify-end mb-2">
        <Link to={viewAllTo} className="text-xs text-blue-500 hover:underline">{viewAllLabel}</Link>
      </div>
    )}
    <table className="w-full table-fixed">
      <colgroup>
        {hasTag && <col className="w-24" />}
        <col />
        <col className="w-24" />
      </colgroup>
      <thead>
        <tr className="border-b border-gray-100">
          {hasTag && (
            <th className="pb-2.5 text-left text-[11px] font-medium text-gray-400">구분</th>
          )}
          <th className="pb-2.5 text-left text-[11px] font-medium text-gray-400">제목</th>
          <th className="pb-2.5 text-right text-[11px] font-medium text-gray-400">작성일</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
)

// ── 설교 서브패널 (2단 탭 유지) ─────────────────────────────────────────

// 주일오전: 사용자단·설교관리와 동일하게 1부/2부 통합 (날짜 그룹)
const SERMON_MAIN_TABS = [
  { key: 'sunday_morning', label: '주일 오전' },
  {
    key: 'weekday', label: '수요·금요예배',
    subs: [
      { key: 'weekday_wednesday', label: '수요예배' },
      { key: 'weekday_friday',    label: '금요기도회' },
    ],
  },
  { key: 'training', label: '훈련용예배' },
]

const SERMON_VIEW_ALL = {
  sunday_morning:    '/worship/sermon/sunday-morning',
  weekday_wednesday: '/worship/sermon/weekday',
  weekday_friday:    '/worship/sermon/weekday',
  training:          '/worship/sermon/training-message',
}

const LEAF_LABEL = {
  sunday_morning:    '주일오전',
  weekday_wednesday: '수요예배',
  weekday_friday:    '금요기도회',
  training:          '훈련예배',
}

const SermonSubPanel = () => {
  const [activeMain, setActiveMain] = useState('sunday_morning')
  const [activeSub,  setActiveSub]  = useState('sunday_morning')

  const handleMainTab = (tab) => {
    setActiveMain(tab.key)
    setActiveSub(tab.subs ? tab.subs[0].key : tab.key)
  }

  const activeLeaf = (() => {
    const main = SERMON_MAIN_TABS.find(t => t.key === activeMain)
    return main?.subs ? activeSub : activeMain
  })()

  const smQ  = useQuery({ queryKey: ['dash','sermon','sm'],  queryFn: () => getSundayMorningGroupedData({ page:0, size:10 }), staleTime: 60 * 1000 })
  const wedQ = useQuery({ queryKey: ['dash','sermon','wed'], queryFn: () => getWeekdayData({ type:'wednesday', page:0, size:10 }), staleTime: 60 * 1000 })
  const friQ = useQuery({ queryKey: ['dash','sermon','fri'], queryFn: () => getWeekdayData({ type:'friday',    page:0, size:10 }), staleTime: 60 * 1000 })
  const trnQ = useQuery({ queryKey: ['dash','sermon','trn'], queryFn: () => getTrainingMessageData({ page:0, size:10 }), staleTime: 60 * 1000 })

  const QMAP    = { sunday_morning: smQ, weekday_wednesday: wedQ, weekday_friday: friQ, training: trnQ }
  const current = QMAP[activeLeaf]
  // 주일오전은 날짜 그룹 응답(groups) → 행 단위 표시용으로 변환 (날짜 상세 링크)
  const items = activeLeaf === 'sunday_morning'
    ? (current?.data?.groups ?? []).slice(0, 10).map((g) => ({
        id:         g.sermonDate,
        title:      g.representativeTitle ?? g.part1?.title ?? g.part2?.title,
        sermonDate: g.sermonDate,
        to:         `/worship/sermon/sunday-morning/${g.sermonDate}`,
      }))
    : (current?.data?.sermons ?? []).slice(0, 10)
  const currentMain = SERMON_MAIN_TABS.find(t => t.key === activeMain)

  return (
    <div>
      {/* 2차 탭 — 예배 카테고리 */}
      <div className="flex items-center justify-between border-b border-gray-100 mb-3">
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
        <div className="flex gap-1 mb-3">
          {currentMain.subs.map((sub) => (
            <button key={sub.key} onClick={() => setActiveSub(sub.key)}
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full transition-colors ${
                activeSub === sub.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >{sub.label}</button>
          ))}
        </div>
      )}

      {/* 테이블 */}
      <PostTable hasTag>
        {current?.isLoading
          ? <PostTableSkeleton cols={3} />
          : items.length === 0
            ? <PostTableEmpty colSpan={3} />
            : items.map((item, idx) => (
                <PostTableRow
                  key={item.id ?? idx}
                  tag={LEAF_LABEL[activeLeaf]}
                  title={item.title}
                  date={formatDateShort(item.sermonDate ?? item.createdAt)}
                  to={item.to ?? `/worship/sermon/${item.id}`}
                />
              ))
        }
      </PostTable>
    </div>
  )
}

// ── 공지사항 서브패널 ────────────────────────────────────────────────────

const NoticeSubPanel = ({ onLoad }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['dash', 'notices'],
    queryFn: () => getNotices({ page: 0, size: 10 }),
    staleTime: 60 * 1000,
  })
  const items = (data?.content ?? []).slice(0, 10)

  useEffect(() => {
    if (data?.totalElements !== undefined) onLoad?.(data.totalElements)
  }, [data?.totalElements])

  return (
    <PostTable viewAllTo="/notices">
      {isLoading
        ? <PostTableSkeleton />
        : items.length === 0
          ? <PostTableEmpty />
          : items.map((item, idx) => (
              <PostTableRow key={item.id ?? idx} title={item.title}
                date={formatDateShort(item.createdAt)} to={`/notices/${item.id}`} />
            ))
      }
    </PostTable>
  )
}

// ── 주보 서브패널 ────────────────────────────────────────────────────────

const BulletinSubPanel = ({ onLoad }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['dash', 'bulletins'],
    queryFn: () => getBulletins({ page: 0, size: 10 }),
    staleTime: 60 * 1000,
  })
  const items = (data?.content ?? []).slice(0, 10)

  useEffect(() => {
    if (data?.totalElements !== undefined) onLoad?.(data.totalElements)
  }, [data?.totalElements])

  return (
    <PostTable viewAllTo="/bulletin">
      {isLoading
        ? <PostTableSkeleton />
        : items.length === 0
          ? <PostTableEmpty />
          : items.map((item, idx) => (
              <PostTableRow key={item.id ?? idx} title={item.title}
                date={formatDateShort(item.createdAt)} to={`/bulletin/${item.id}`} />
            ))
      }
    </PostTable>
  )
}

// ── 갤러리 서브패널 ──────────────────────────────────────────────────────

const GallerySubPanel = ({ onLoad }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['dash', 'gallery'],
    queryFn: () => getRecentGallery({ page: 0, size: 10 }),
    staleTime: 60 * 1000,
  })
  const items = (data?.content ?? []).slice(0, 10)

  useEffect(() => {
    if (data?.totalElements !== undefined) onLoad?.(data.totalElements)
  }, [data?.totalElements])

  return (
    <PostTable hasTag viewAllLabel="부서 갤러리 전체">
      {isLoading
        ? <PostTableSkeleton cols={3} />
        : items.length === 0
          ? <PostTableEmpty colSpan={3} />
          : items.map((item, idx) => (
              <PostTableRow
                key={item.id ?? idx}
                tag={item.departmentName}
                title={item.title ?? '(제목 없음)'}
                date={formatDateShort(item.createdAt)}
                to={`/department/gallery/${item.id}`}
              />
            ))
      }
    </PostTable>
  )
}

// ── 게시물 탭 패널 (1차: 설교/공지/주보/갤러리) ──────────────────────────

const RecentPostsPanel = () => {
  const [activeTab, setActiveTab] = useState('sermon')
  const [counts, setCounts] = useState({})

  const updateCount = (key) => (total) =>
    setCounts((prev) => ({ ...prev, [key]: total }))

  const POST_TABS = [
    { key: 'sermon',   label: '설교' },
    { key: 'notice',   label: '공지사항' },
    { key: 'bulletin', label: '주보' },
    { key: 'gallery',  label: '갤러리' },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* 1차 탭 */}
      <div className="flex border-b border-gray-100 px-5 pt-4">
        {POST_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {counts[tab.key] !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal ${
                activeTab === tab.key
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {counts[tab.key].toLocaleString()}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 서브패널 */}
      <div className="px-5 py-4 min-h-[300px]">
        {activeTab === 'sermon'   && <SermonSubPanel />}
        {activeTab === 'notice'   && <NoticeSubPanel   onLoad={updateCount('notice')} />}
        {activeTab === 'bulletin' && <BulletinSubPanel onLoad={updateCount('bulletin')} />}
        {activeTab === 'gallery'  && <GallerySubPanel  onLoad={updateCount('gallery')} />}
      </div>
    </div>
  )
}

// ── 한눈에 보기 위젯 (설교/공지/갤러리/신청현황 동시 표시) ────────────────

const WidgetCard = ({ title, icon, viewAllTo, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col">
    <div className="flex items-center justify-between mb-3">
      <h5 className="text-sm font-bold text-gray-900">{title}</h5>
      {viewAllTo
        ? <Link to={viewAllTo} className="text-[11px] text-blue-600 hover:underline shrink-0">전체보기</Link>
        : icon}
    </div>
    <div className="flex-1">{children}</div>
  </div>
)

const WidgetEmpty = ({ children = '등록된 항목이 없습니다' }) => (
  <p className="text-xs text-gray-400 text-center py-8">{children}</p>
)

const WidgetSkeleton = ({ rows = 3, className = 'h-10' }) => (
  <div className="space-y-2">
    {[...Array(rows)].map((_, i) => <div key={i} className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />)}
  </div>
)

const RecentSermonWidget = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dash', 'widget', 'sermon'],
    queryFn: () => getSundayMorningGroupedData({ page: 0, size: 3 }),
    staleTime: 60 * 1000,
  })
  const items = (data?.groups ?? []).slice(0, 3)

  return (
    <WidgetCard title="최근 설교" icon={<YoutubeLogo size={18} className="text-gray-300" />}>
      {isLoading ? <WidgetSkeleton /> : items.length === 0 ? <WidgetEmpty /> : (
        <div className="space-y-1">
          {items.map((g) => (
            <Link key={g.sermonDate} to={`/worship/sermon/sunday-morning/${g.sermonDate}`}
              className="block p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-[13px] font-medium text-gray-800 truncate">
                {g.representativeTitle ?? g.part1?.title ?? g.part2?.title ?? '(제목 없음)'}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">주일오전 · {formatDateShort(g.sermonDate)}</p>
            </Link>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}

const RecentNoticeWidget = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dash', 'widget', 'notice'],
    queryFn: () => getNotices({ page: 0, size: 3 }),
    staleTime: 60 * 1000,
  })
  const items = (data?.content ?? []).slice(0, 3)

  return (
    <WidgetCard title="공지사항" viewAllTo="/admin/notices">
      {isLoading ? <WidgetSkeleton /> : items.length === 0 ? <WidgetEmpty /> : (
        <div className="space-y-3">
          {items.map((n) => {
            const d = new Date(n.createdAt)
            return (
              <Link key={n.id} to={`/notices/${n.id}`} className="flex items-center gap-3 group">
                <div className="flex flex-col items-center justify-center w-10 h-10 shrink-0 bg-blue-50 text-blue-700 rounded-lg">
                  <span className="text-[9px] leading-none">{String(d.getMonth() + 1).padStart(2, '0')}월</span>
                  <span className="text-sm font-bold leading-none mt-0.5">{d.getDate()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors">{n.title}</p>
                  {n.isPinned && <span className="text-[10px] text-amber-600 font-medium">고정 공지</span>}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </WidgetCard>
  )
}

const RecentGalleryWidget = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dash', 'widget', 'gallery'],
    queryFn: () => getRecentGallery({ page: 0, size: 3 }),
    staleTime: 60 * 1000,
  })
  const items = (data?.content ?? []).slice(0, 3)

  return (
    <WidgetCard title="갤러리 업데이트" icon={<Images size={18} className="text-gray-300" />}>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : items.length === 0 ? <WidgetEmpty /> : (
        <div className="grid grid-cols-2 gap-2">
          {items.map((img) => (
            <Link key={img.id} to={`/department/gallery/${img.id}`}
              className="aspect-square rounded-lg overflow-hidden relative group bg-gray-100">
              <img
                src={`/uploads/gallery/${img.thumbnailFilename || img.storedFilename}`}
                alt={img.title ?? '갤러리 이미지'}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => { e.currentTarget.src = '/images/no-image.png' }}
              />
            </Link>
          ))}
          <Link to="/admin/gallery"
            className="aspect-square rounded-lg bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <Plus size={18} />
            <span className="text-[9px] mt-0.5">더보기</span>
          </Link>
        </div>
      )}
    </WidgetCard>
  )
}

const APPLICATION_BORDER = { PENDING: 'border-red-400', COMPLETED: 'border-gray-200', CANCELLED: 'border-gray-200' }
const APPLICATION_TEXT   = { PENDING: 'text-red-600',   COMPLETED: 'text-gray-500',   CANCELLED: 'text-gray-400' }

const RecentApplicationWidget = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dash', 'widget', 'application'],
    queryFn: () => getAdminApplications({ page: 0, size: 3 }),
    staleTime: 60 * 1000,
  })
  const items = (data?.content ?? []).slice(0, 3)

  return (
    <WidgetCard title="신청 현황 (공간/차량)" viewAllTo="/admin/applications">
      {isLoading ? <WidgetSkeleton /> : items.length === 0 ? <WidgetEmpty /> : (
        <div className="space-y-2">
          {items.map((a) => (
            <Link key={a.id} to={`/admin/applications/${a.id}`}
              className={`block p-2.5 pl-3 border-l-4 ${APPLICATION_BORDER[a.status] ?? 'border-gray-200'} bg-gray-50 hover:bg-gray-100 rounded-r-lg transition-colors`}>
              <p className="text-[13px] font-semibold text-gray-800 truncate">{a.categoryName}</p>
              <p className="text-[11px] text-gray-400 truncate">{a.useDate} {a.useStartTime?.slice(0, 5)}~{a.useEndTime?.slice(0, 5)}</p>
              <p className={`text-[10px] mt-0.5 font-medium ${APPLICATION_TEXT[a.status] ?? 'text-gray-400'}`}>{a.statusLabel}</p>
            </Link>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}

// ── 게시물 작성 드롭다운 버튼 ────────────────────────────────────────────

const CREATE_ITEMS = [
  { label: '공지사항 작성', to: '/admin/notices/new' },
  { label: '설교 작성',    to: '/admin/sermons/new' },
  { label: '주보 업로드',  to: '/admin/bulletins' },
]

const CreateDropdown = () => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        게시물 작성
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-10">
          {CREATE_ITEMS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
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
    <div className="h-full overflow-y-auto p-4 md:p-8 space-y-8">

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            안녕하세요, {user?.name}님
            <span className="ml-3 text-xs text-gray-400">{timeStr} 기준</span>
          </p>
        </div>
        <CreateDropdown />
      </div>

      {/* ── 알림 배너 (승인 대기 / 미처리 문의) ── */}
      {!isLoading && (
        <AlertBanner
          pendingUsers={data?.pendingUsers}
          pendingHelpRequests={data?.pendingHelpRequests}
        />
      )}

      {/* ── 방문자 통계 ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">방문자 현황</h2>
        {isLoading ? (
          <Skeleton className="h-56" />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex flex-col lg:flex-row gap-8">

              {/* 좌: 라인 차트 */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-3">주간 방문자 추이</p>
                <LineChart data={weeklyChart} />
              </div>

              {/* 우: 기간별 수치 테이블 */}
              <div className="w-full lg:w-48 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                <p className="text-xs font-medium text-gray-500 mb-3">기간별 현황</p>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-2 text-left text-[11px] font-normal text-gray-400">일자</th>
                      <th className="pb-2 text-right text-[11px] font-normal text-gray-400">방문자</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...weeklyChart].reverse().map((row, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-1.5 text-xs text-gray-500">{row.date}</td>
                        <td className="py-1.5 text-xs text-right font-medium text-gray-800">
                          {row.count.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td className="pt-2.5 pb-1 text-xs text-gray-500">오늘</td>
                      <td className="pt-2.5 pb-1 text-xs text-right font-bold text-blue-600">
                        {fmt(data?.visitorStatistics?.todayCount)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-xs text-gray-500">어제</td>
                      <td className="py-1 text-xs text-right text-gray-700">
                        {fmt(data?.visitorStatistics?.yesterdayCount)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-xs text-gray-500">7일 합계</td>
                      <td className="py-1 text-xs text-right font-bold text-gray-900">
                        {fmt(data?.visitorStatistics?.weekCount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

            </div>
          </div>
        )}
      </section>

      {/* ── 회원 / 도움문의 통계 ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">주요 현황</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="전체 회원" value={data?.totalUsers} sub={`승인 완료 ${fmt(data?.approvedUsers)}명`} to="/admin/users" />
            <StatCard
              label="승인 대기"
              value={data?.pendingUsers}
              sub="승인이 필요한 회원"
              color={data?.pendingUsers > 0 ? 'text-red-500' : 'text-gray-900'}
              pulse={data?.pendingUsers > 0}
              to="/admin/users"
            />
            <StatCard label="도움문의 전체" value={data?.totalHelpRequests} to="/admin/help-requests" />
            <StatCard
              label="미처리 문의"
              value={data?.pendingHelpRequests}
              sub={`처리중 ${fmt(data?.inProgressHelpRequests)}건 포함`}
              color={data?.pendingHelpRequests > 0 ? 'text-amber-500' : 'text-gray-900'}
              pulse={data?.pendingHelpRequests > 0}
              to="/admin/help-requests"
            />
          </div>
        )}
      </section>

      {/* ── 한눈에 보기 (설교/공지/갤러리/신청현황 동시 표시) ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">한눈에 보기</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RecentSermonWidget />
          <RecentNoticeWidget />
          <RecentGalleryWidget />
          <RecentApplicationWidget />
        </div>
      </section>

      {/* ── 최근 게시물 (상세 탐색용) ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">최근 게시물</h2>
        <RecentPostsPanel />
      </section>

    </div>
  )
}

export default AdminDashboardPage
