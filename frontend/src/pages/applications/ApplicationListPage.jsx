import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMyApplications } from '@/api/applications'
import useAuthStore from '@/stores/authStore'
import { CaretLeft, CaretRight, Plus } from '@phosphor-icons/react'
import { getPageRange } from '@/utils/pagination'

const PAGE_SIZE = 15

const STATUS_LABEL = {
  PENDING:   '검토중',
  COMPLETED: '완료',
  CANCELLED: '취소',
}

const STATUS_STYLE = {
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-[#F4F2EA] text-[#A3A3A3] border border-[#E5E5E5]',
}

const ApplicationListPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['applications', 'my', page],
    queryFn:  () => getMyApplications({ page, size: PAGE_SIZE }),
    placeholderData: (prev) => prev,
    enabled: !!user,
  })

  const list       = data?.content          ?? []
  const pageInfo   = data?.pageInfo         ?? {}
  const totalPages = pageInfo.totalPages    ?? 1
  const totalCount = pageInfo.totalElements ?? 0

  const goPage = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">

      {/* Hero */}
      <section className="pt-20 bg-[#171717] text-[#FAF9F6] border-b border-[#2C2C2C]">
        <div className="max-w-[1200px] mx-auto px-6 py-16 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <span className="font-mono text-xs tracking-[0.25em] uppercase text-[#737373] mb-4 block">Applications</span>
            <h1 className="text-5xl font-bold tracking-tight break-keep">신청양식</h1>
            <p className="mt-3 text-sm text-[#A3A3A3] break-keep">
              시설 및 차량 사용 신청 내역을 확인하고 새로운 신청을 할 수 있습니다.
            </p>
          </div>
          {user && (
            <Link
              to="/applications/new"
              className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase bg-[#FAF9F6] text-[#171717] px-6 py-2.5 hover:bg-white transition-colors"
            >
              <Plus size={14} weight="bold" />
              신청하기
            </Link>
          )}
        </div>
      </section>

      {/* 본문 */}
      <main className="max-w-[1200px] mx-auto px-6 pt-14 md:pt-20 pb-32">

        {/* 비로그인 */}
        {!user ? (
          <>
            <div className="h-px w-full bg-[#171717]" />
            <div className="py-32 text-center">
              <p className="text-[#2C2C2C] font-medium mb-1 break-keep">로그인이 필요한 서비스입니다</p>
              <p className="text-sm text-[#737373] mb-6 break-keep">로그인 후 신청 내역을 확인하실 수 있습니다.</p>
              <button
                onClick={() => navigate('/login')}
                className="text-xs font-bold tracking-[0.1em] uppercase bg-[#171717] text-[#FAF9F6] px-6 py-2.5 hover:opacity-90 transition-colors"
              >
                로그인하기
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="h-px w-full bg-[#171717]" />

            {/* 테이블 헤더 */}
            <div
              className="hidden md:grid px-4 py-3 border-b border-[#E5E5E5] text-[11px] font-mono text-[#A3A3A3] uppercase tracking-widest"
              style={{ gridTemplateColumns: '64px 120px 1fr 108px 130px 80px 100px' }}
            >
              <div className="text-center">No.</div>
              <div>카테고리</div>
              <div>목적</div>
              <div>사용 날짜</div>
              <div>시간</div>
              <div className="text-center">인원</div>
              <div className="text-center">상태</div>
            </div>

            {/* 바디 */}
            {isLoading ? (
              <div className="py-32 text-center font-mono text-sm text-[#737373] tracking-wider">불러오는 중...</div>
            ) : list.length === 0 ? (
              <div className="py-32 text-center">
                <p className="text-[#2C2C2C] font-medium mb-1 break-keep">신청 내역이 없습니다</p>
                <p className="text-sm text-[#737373] mb-6 break-keep">시설 또는 차량 사용이 필요하신 경우 신청해 주세요.</p>
                <Link
                  to="/applications/new"
                  className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase bg-[#171717] text-[#FAF9F6] px-6 py-2.5 hover:opacity-90 transition-colors"
                >
                  신청하기
                </Link>
              </div>
            ) : (
              list.map((item, idx) => {
                const rowNo = totalCount - page * PAGE_SIZE - idx
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/applications/${item.id}`)}
                    className="cursor-pointer hover:bg-[#F4F2EA] transition-colors border-b border-[#E5E5E5]"
                  >
                    {/* 데스크탑 */}
                    <div
                      className="hidden md:grid items-center text-sm"
                      style={{ gridTemplateColumns: '64px 120px 1fr 108px 130px 80px 100px' }}
                    >
                      <div className="px-4 py-4 text-center font-mono text-xs text-[#737373]">{rowNo}</div>
                      <div className="px-4 py-4 font-medium text-[#2C2C2C] truncate">{item.categoryName}</div>
                      <div className="px-4 py-4 text-[#737373] truncate">{item.purpose}</div>
                      <div className="px-4 py-4 font-mono text-xs text-[#737373] whitespace-nowrap">{item.useDate}</div>
                      <div className="px-4 py-4 font-mono text-xs text-[#737373] whitespace-nowrap">
                        {item.useStartTime?.slice(0, 5)} ~ {item.useEndTime?.slice(0, 5)}
                      </div>
                      <div className="px-4 py-4 text-center text-sm text-[#737373] whitespace-nowrap">{item.headCount}명</div>
                      <div className="px-4 py-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_STYLE[item.status] ?? 'bg-[#F4F2EA] text-[#737373] border border-[#E5E5E5]'}`}>
                          {STATUS_LABEL[item.status] ?? item.statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* 모바일 카드 */}
                    <div className="md:hidden px-4 py-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#2C2C2C]">{item.categoryName}</span>
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[item.status] ?? 'bg-[#F4F2EA] text-[#737373] border border-[#E5E5E5]'}`}>
                          {STATUS_LABEL[item.status] ?? item.statusLabel}
                        </span>
                      </div>
                      <p className="text-sm text-[#737373] truncate">{item.purpose}</p>
                      <p className="text-xs font-mono text-[#A3A3A3]">
                        {item.useDate} &nbsp;·&nbsp;
                        {item.useStartTime?.slice(0, 5)} ~ {item.useEndTime?.slice(0, 5)} &nbsp;·&nbsp;
                        {item.headCount}명
                      </p>
                    </div>
                  </div>
                )
              })
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center">
                <nav className="inline-flex border border-[#E5E5E5]">
                  <button onClick={() => goPage(page - 1)} disabled={page === 0}
                    className="w-10 h-10 flex items-center justify-center border-r border-[#E5E5E5] text-[#737373] hover:bg-[#F4F2EA] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <CaretLeft size={14} weight="bold" />
                  </button>
                  {getPageRange(page, totalPages).map((p) => (
                    <button key={p} onClick={() => goPage(p)}
                      className={`w-10 h-10 flex items-center justify-center border-r border-[#E5E5E5] font-mono text-sm transition-colors ${
                        p === page ? 'bg-[#171717] text-white' : 'text-[#737373] hover:bg-[#F4F2EA] hover:text-[#171717]'
                      }`}>
                      {p + 1}
                    </button>
                  ))}
                  <button onClick={() => goPage(page + 1)} disabled={page >= totalPages - 1}
                    className="w-10 h-10 flex items-center justify-center text-[#737373] hover:bg-[#F4F2EA] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <CaretRight size={14} weight="bold" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default ApplicationListPage
