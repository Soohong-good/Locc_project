import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotices, toggleNoticePin, deleteNotice } from '@/api/notices'
import useAuthStore from '@/stores/authStore'
import toast from '@/utils/toast'
import {
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react'
import Button from '@/components/ui/Button'
import { PinnableListHeader, PinnableListRow } from '@/components/ui/PinnableListRow'

const PAGE_SIZE = 10
const PAGE_WINDOW = 5

const fmtDot = (val) => {
  if (!val) return ''
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return String(val)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const getPageRange = (current, total) => {
  if (total <= PAGE_WINDOW) return Array.from({ length: total }, (_, i) => i)
  let start = Math.max(0, current - Math.floor(PAGE_WINDOW / 2))
  const end = Math.min(total, start + PAGE_WINDOW)
  start = Math.max(0, end - PAGE_WINDOW)
  return Array.from({ length: PAGE_WINDOW }, (_, i) => start + i)
}

const DeleteModal = ({ title, onClose, onConfirm, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-[#171717]/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-[#FAF9F6] max-w-md w-full border border-[#E5E5E5]">
      <div className="p-8">
        <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">공지사항 삭제</h3>
        <p className="text-[#737373] mb-1">다음 공지사항을 삭제하시겠습니까?</p>
        <p className="text-[#2C2C2C] font-medium">{title}</p>
      </div>
      <div className="flex items-center justify-end gap-3 px-8 py-5 bg-[#F4F2EA] border-t border-[#E5E5E5]">
        <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-[#737373] hover:text-[#171717] transition-colors">취소</button>
        <button onClick={onConfirm} disabled={deleting}
          className="px-6 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
          {deleting ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </div>
  </div>
)

const NoticeListPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const page    = Number(searchParams.get('page') ?? 0)
  const keyword = searchParams.get('keyword') ?? ''
  const [searchInput, setSearchInput] = useState(keyword)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { canWrite: canWriteFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const isAdmin  = isAdminFn()
  const canWrite = canWriteFn('NOTICE')
  const userId   = getUserId()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notices', { page, keyword }],
    queryFn:  () => getNotices({ page, size: PAGE_SIZE, keyword }),
  })

  const notices    = data?.content                ?? []
  const totalPages = data?.pageInfo?.totalPages    ?? 0
  const totalElem  = data?.pageInfo?.totalElements ?? 0
  const pageNum    = data?.pageInfo?.page          ?? 0
  const pageSize   = data?.pageInfo?.size          ?? PAGE_SIZE

  const pinMutation = useMutation({
    mutationFn: (id) => toggleNoticePin(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['notices'] }),
    onError:    (e) => toast.error(e?.response?.data?.message ?? '고정 변경에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteNotice(id),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
      setDeleteTarget(null)
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? '삭제에 실패했습니다.'),
  })

  useEffect(() => { setSearchInput(keyword) }, [keyword])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ page: 0, keyword: searchInput })
  }

  const goPage = (p) => {
    setSearchParams({ page: p, keyword })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero */}
      <section className="pt-20 bg-[#171717] text-[#FAF9F6] border-b border-[#2C2C2C]">
        <div className="max-w-[1200px] mx-auto px-6 py-8 md:py-16 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-5 md:gap-8">
          <div>
            <span className="font-mono text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.25em] uppercase text-[#737373] mb-2 md:mb-4 block">Notice &amp; News</span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">공지사항</h1>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            {canWrite && (
              <button
                onClick={() => navigate('/notices/new')}
                className="text-xs font-bold tracking-[0.1em] uppercase bg-[#FAF9F6] text-[#171717] px-6 py-2.5 hover:bg-white transition-colors"
              >
                + 새 공지사항
              </button>
            )}
            <form onSubmit={handleSearch} className="relative w-full md:w-72">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="w-full h-10 pl-4 pr-11 bg-transparent border border-[#737373] text-[#FAF9F6] text-sm focus:outline-none focus:border-[#FAF9F6] transition-colors placeholder:text-[#737373]"
              />
              <button type="submit" className="absolute right-0 top-0 w-11 h-11 flex items-center justify-center text-[#737373] hover:text-[#FAF9F6] transition-colors">
                <MagnifyingGlass size={16} weight="bold" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Table */}
      <main className="max-w-[1200px] mx-auto px-6 pt-14 md:pt-20 pb-32">
        <div className="h-px w-full bg-[#171717]" />
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
          <span className="text-[11px] font-mono text-[#A3A3A3] uppercase tracking-widest">공지사항 목록</span>
          <span className="text-[11px] font-mono text-[#A3A3A3] uppercase tracking-widest">총 {totalElem}건</span>
        </div>
        <PinnableListHeader />

        {isLoading && (
          <div className="py-32 text-center font-mono text-sm text-[#737373] tracking-wider">불러오는 중...</div>
        )}
        {isError && (
          <div className="py-32 text-center text-sm text-red-600">공지사항을 불러올 수 없습니다.</div>
        )}
        {!isLoading && !isError && notices.length === 0 && (
          <div className="py-32 text-center text-sm text-[#737373]">
            {keyword ? `"${keyword}"에 해당하는 공지사항이 없습니다.` : '등록된 공지사항이 없습니다.'}
          </div>
        )}

        {!isLoading && !isError && notices.map((notice, idx) => (
          <PinnableListRow
            key={notice.id}
            no={totalElem - pageNum * pageSize - idx}
            isPinned={notice.isPinned}
            title={notice.title}
            onTitleClick={() => navigate(`/notices/${notice.id}`)}
            hasAttachments={notice.hasAttachments}
            isNew={notice.isNew}
            date={fmtDot(notice.createdAt)}
            authorName={notice.authorName}
            authorRole={notice.authorRole}
            viewCount={notice.viewCount}
            canManage={canWrite && (isAdmin || notice.authorId === userId)}
            isAdmin={isAdmin}
            onTogglePin={() => pinMutation.mutate(notice.id)}
            pinPending={pinMutation.isPending}
            onDelete={() => setDeleteTarget({ id: notice.id, title: notice.title })}
          />
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center">
            <nav className="inline-flex border border-[#E5E5E5]">
              <button onClick={() => goPage(page - 1)} disabled={page === 0}
                className="w-11 h-11 flex items-center justify-center border-r border-[#E5E5E5] text-[#737373] hover:bg-[#F4F2EA] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <CaretLeft size={14} weight="bold" />
              </button>
              {getPageRange(page, totalPages).map((p) => (
                <button key={p} onClick={() => goPage(p)}
                  className={`w-11 h-11 flex items-center justify-center border-r border-[#E5E5E5] font-mono text-sm transition-colors ${
                    p === page ? 'bg-[#171717] text-white' : 'text-[#737373] hover:bg-[#F4F2EA] hover:text-[#171717]'
                  }`}>
                  {p + 1}
                </button>
              ))}
              <button onClick={() => goPage(page + 1)} disabled={page >= totalPages - 1}
                className="w-11 h-11 flex items-center justify-center text-[#737373] hover:bg-[#F4F2EA] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <CaretRight size={14} weight="bold" />
              </button>
            </nav>
          </div>
        )}
      </main>

      {deleteTarget && (
        <DeleteModal
          title={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          deleting={deleteMutation.isPending}
        />
      )}
    </div>
  )
}

export default NoticeListPage
