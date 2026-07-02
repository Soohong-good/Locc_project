import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotices, toggleNoticePin, deleteNotice } from '@/api/notices'
import useAuthStore from '@/stores/authStore'
import toast from '@/utils/toast'
import {
  MagnifyingGlass,
  BookmarkSimple,
  Paperclip,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react'
import Button from '@/components/ui/Button'

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
        <div className="max-w-[1200px] mx-auto px-6 py-16 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <span className="font-mono text-xs tracking-[0.25em] uppercase text-[#737373] mb-4 block">Notice &amp; News</span>
            <h1 className="text-5xl font-bold tracking-tight">공지사항</h1>
          </div>
          <div className="flex items-center gap-4">
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
                className="w-full h-10 pl-4 pr-10 bg-transparent border border-[#737373] text-[#FAF9F6] text-sm focus:outline-none focus:border-[#FAF9F6] transition-colors placeholder:text-[#737373]"
              />
              <button type="submit" className="absolute right-0 top-0 w-10 h-10 flex items-center justify-center text-[#737373] hover:text-[#FAF9F6] transition-colors">
                <MagnifyingGlass size={16} weight="bold" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Table */}
      <main className="max-w-[1200px] mx-auto px-6 pt-14 md:pt-20 pb-32">
        <div className="h-px w-full bg-[#171717]" />
        <div className="grid grid-cols-[60px_1fr_auto] gap-4 px-4 py-3 border-b border-[#E5E5E5] text-[11px] font-mono text-[#A3A3A3] uppercase tracking-widest">
          <div>No.</div>
          <div>Title</div>
          <div className="text-right w-32">Date</div>
        </div>

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
          <div key={notice.id}
            className={`grid grid-cols-[60px_1fr_auto] gap-4 px-4 py-5 border-b border-[#E5E5E5] hover:bg-[#F4F2EA] transition-colors items-center group ${
              notice.isPinned ? 'bg-[#F4F2EA]' : ''
            }`}
          >
            <div className="font-mono text-sm text-[#737373]">
              {notice.isPinned
                ? <BookmarkSimple size={16} weight="fill" className="text-[#171717]" />
                : totalElem - pageNum * pageSize - idx}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => navigate(`/notices/${notice.id}`)}
                className={`text-base truncate group-hover:text-[#171717] transition-colors text-left ${
                  notice.isPinned ? 'font-bold text-[#171717]' : 'font-medium text-[#2C2C2C]'
                }`}
              >
                {notice.title}
              </button>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {notice.hasAttachments && <Paperclip size={13} className="text-[#A3A3A3]" />}
                {notice.isNew && (
                  <span className="border border-[#171717] px-1.5 py-0.5 text-[10px] font-mono text-[#171717] uppercase tracking-wider leading-none">N</span>
                )}
              </div>
              {canWrite && (isAdmin || notice.authorId === userId) && (
                <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isAdmin && (
                    <button
                      onClick={() => pinMutation.mutate(notice.id)}
                      disabled={pinMutation.isPending}
                      className={`p-1.5 transition-colors text-xs border ${notice.isPinned ? 'border-[#171717] bg-[#171717] text-[#FAF9F6]' : 'border-[#E5E5E5] text-[#737373] hover:border-[#171717]'}`}
                    >
                      <BookmarkSimple size={12} weight={notice.isPinned ? 'fill' : 'regular'} />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget({ id: notice.id, title: notice.title })}
                    className="p-1.5 border border-[#E5E5E5] text-red-500 hover:border-red-500 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div className="font-mono text-sm text-[#737373] text-right w-32">{fmtDot(notice.createdAt)}</div>
          </div>
        ))}

        {/* Pagination */}
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
