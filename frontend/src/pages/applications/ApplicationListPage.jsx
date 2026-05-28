import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMyApplications } from '@/api/applications'
import useAuthStore from '@/stores/authStore'

const NAV_BG = '#1e3a5f'

const STATUS_LABEL = {
  PENDING:   '검토중',
  COMPLETED: '완료',
  CANCELLED: '취소',
}

const STATUS_STYLE = {
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-400 border border-slate-200',
}

const ApplicationListPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['applications', 'my', page],
    queryFn:  () => getMyApplications({ page, size: 15 }),
    placeholderData: (prev) => prev,
    enabled: !!user,
  })

  const list       = data?.content          ?? []
  const pageInfo   = data?.pageInfo         ?? {}
  const totalPages = pageInfo.totalPages    ?? 1
  const totalCount = pageInfo.totalElements ?? 0

  return (
    <div className="min-h-screen bg-slate-50">

      {/* 상단 배너 */}
      <div style={{ background: NAV_BG }} className="pt-[95px]">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Applications
          </p>
          <h1 className="text-2xl font-bold text-white">신청양식</h1>
          <p className="mt-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            시설 및 차량 사용 신청 내역을 확인하고 새로운 신청을 할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* 비로그인 */}
        {!user ? (
          <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <p className="text-slate-600 font-medium mb-1">로그인이 필요한 서비스입니다</p>
            <p className="text-sm text-slate-400 mb-6">로그인 후 신청 내역을 확인하실 수 있습니다.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 text-sm font-medium text-white rounded-lg transition hover:opacity-90"
              style={{ background: NAV_BG }}
            >
              로그인하기
            </button>
          </div>
        ) : (
          <>
            {/* 툴바 */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                전체 <span className="font-semibold text-slate-800">{totalCount}</span>건
              </p>
              <Link
                to="/applications/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg transition hover:opacity-90"
                style={{ background: NAV_BG }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                신청하기
              </Link>
            </div>

            {/* 게시판 */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

              {/* 테이블 헤더 */}
              <div
                className="hidden md:grid text-xs font-semibold tracking-wide"
                style={{
                  background: NAV_BG,
                  color: 'rgba(255,255,255,0.7)',
                  gridTemplateColumns: '64px 120px 1fr 108px 126px 60px 84px',
                }}
              >
                <div className="px-4 py-3 text-center whitespace-nowrap">번호</div>
                <div className="px-4 py-3">카테고리</div>
                <div className="px-4 py-3">목적</div>
                <div className="px-4 py-3">사용 날짜</div>
                <div className="px-4 py-3">시간</div>
                <div className="px-4 py-3 text-center">인원</div>
                <div className="px-4 py-3 text-center">상태</div>
              </div>

              {/* 바디 */}
              {isLoading ? (
                <div className="py-20 text-center text-sm text-slate-400">불러오는 중...</div>
              ) : list.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-slate-500 font-medium mb-1">신청 내역이 없습니다</p>
                  <p className="text-sm text-slate-400 mb-5">시설 또는 차량 사용이 필요하신 경우 신청해 주세요.</p>
                  <Link
                    to="/applications/new"
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white rounded-lg transition hover:opacity-90"
                    style={{ background: NAV_BG }}
                  >
                    신청하기
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {list.map((item, idx) => {
                    const rowNo = totalCount - page * 15 - idx
                    return (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/applications/${item.id}`)}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        {/* 데스크탑 */}
                        <div
                          className="hidden md:grid items-center text-sm"
                          style={{ gridTemplateColumns: '64px 120px 1fr 108px 126px 60px 84px' }}
                        >
                          <div className="px-4 py-4 text-center text-xs text-slate-400">{rowNo}</div>
                          <div className="px-4 py-4 font-medium text-slate-800 truncate">{item.categoryName}</div>
                          <div className="px-4 py-4 text-slate-600 truncate">{item.purpose}</div>
                          <div className="px-4 py-4 text-xs text-slate-500">{item.useDate}</div>
                          <div className="px-4 py-4 text-xs text-slate-500">
                            {item.useStartTime?.slice(0, 5)} ~ {item.useEndTime?.slice(0, 5)}
                          </div>
                          <div className="px-4 py-4 text-center text-sm text-slate-600">{item.headCount}명</div>
                          <div className="px-4 py-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[item.status] ?? 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                              {STATUS_LABEL[item.status] ?? item.statusLabel}
                            </span>
                          </div>
                        </div>

                        {/* 모바일 카드 */}
                        <div className="md:hidden px-4 py-4 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-800">{item.categoryName}</span>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[item.status] ?? 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                              {STATUS_LABEL[item.status] ?? item.statusLabel}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 truncate">{item.purpose}</p>
                          <p className="text-xs text-slate-400">
                            {item.useDate} &nbsp;·&nbsp;
                            {item.useStartTime?.slice(0, 5)} ~ {item.useEndTime?.slice(0, 5)} &nbsp;·&nbsp;
                            {item.headCount}명
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-6">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(0)}
                  className="w-8 h-8 flex items-center justify-center text-xs border border-slate-200 rounded text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-30 transition"
                >«</button>
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 h-8 flex items-center text-xs border border-slate-200 rounded text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-30 transition"
                >이전</button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(0, Math.min(page - 2, totalPages - 5))
                  const p = start + i
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-8 h-8 text-xs rounded border transition font-medium"
                      style={p === page
                        ? { background: NAV_BG, borderColor: NAV_BG, color: '#fff' }
                        : { background: '#fff', borderColor: '#e2e8f0', color: '#475569' }}
                    >
                      {p + 1}
                    </button>
                  )
                })}

                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 h-8 flex items-center text-xs border border-slate-200 rounded text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-30 transition"
                >다음</button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(totalPages - 1)}
                  className="w-8 h-8 flex items-center justify-center text-xs border border-slate-200 rounded text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-30 transition"
                >»</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ApplicationListPage
