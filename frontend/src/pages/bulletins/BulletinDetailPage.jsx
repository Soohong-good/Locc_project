import DOMPurify from 'dompurify'
// 본문 HTML(.ql-editor)의 정렬·목록 등 Quill 기본 스타일 — 이 페이지는 에디터를 띄우지 않아 CSS만 따로 불러온다
import 'quill/dist/quill.snow.css'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { List, DownloadSimple, Trash, CalendarBlank, Folder, Eye } from '@phosphor-icons/react'
import { getBulletin, increaseBulletinViews, deleteBulletin } from '@/api/bulletins'
import { downloadFile } from '@/api/files'
import useAuthStore from '@/stores/authStore'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import toast from '@/utils/toast'
import { isHtmlContent } from '@/utils/richText'

/* ── 날짜 포맷: 원본 yyyy. MM. dd ───────────────────────────────── */
const formatDate = (dt) => {
  if (!dt) return ''
  const d = new Date(dt)
  const y  = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}. ${mm}. ${dd}`
}

/* ── 삭제 확인 모달 ───────────────────────────────────────────────── */
const DeleteModal = ({ title, onClose, onConfirm, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white w-full max-w-md overflow-hidden shadow-2xl">
      <div className="px-8 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-medium text-slate-900">주보 삭제</h2>
            <p className="text-sm text-slate-500 mt-0.5 font-light">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>
      </div>
      <div className="px-8 py-6">
        <p className="text-slate-600 mb-3 font-light">이 주보를 삭제하시겠습니까?</p>
        <p className="font-medium text-slate-900 bg-slate-50 px-4 py-3 rounded">{title}</p>
      </div>
      <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
        <button onClick={onClose}
          className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
          취소
        </button>
        <button onClick={onConfirm} disabled={deleting}
          className="px-8 py-2.5 bg-red-600 text-white hover:bg-red-700 font-medium transition-all disabled:opacity-60">
          {deleting ? '삭제 중...' : '삭제하기'}
        </button>
      </div>
    </div>
  </div>
)

/* ── 메인 컴포넌트 ──────────────────────────────────────────────── */
const BulletinDetailPage = () => {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const queryClient = useQueryClient()

  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const isAdmin = isAdminFn()
  const canWrite = isAdminOrOperatorFn()
  const userId = getUserId()

  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: bulletin, isLoading, isError } = useQuery({
    queryKey: ['bulletins', id],
    queryFn:  () => getBulletin(id),
  })

  /* 조회수 증가 — 최초 1회 */
  useEffect(() => {
    if (id) increaseBulletinViews(id).catch(() => {})
  }, [id])

  /* 삭제 — 원본 deleteBulletin() → /bulletin 이동 */
  const deleteMutation = useMutation({
    mutationFn: () => deleteBulletin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulletins'] })
      navigate('/bulletin')
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? '삭제에 실패했습니다.'),
  })

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <main className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] min-h-screen pt-20 px-6">
      <div className="text-red-500">주보를 불러올 수 없습니다.</div>
    </main>
  )

  return (
    <main className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] min-h-screen pt-20 bg-[#FAF9F6]">
      <article className="w-full max-w-[840px] mx-auto px-6 py-16 md:py-24">

        {/* 관리자 버튼 */}
        {canWrite && (isAdmin || bulletin?.authorId === userId) && (
          <div className="flex justify-end gap-5 font-mono text-[10px] text-[#737373] mb-8 tracking-[0.1em] uppercase">
            <button onClick={() => setDeleteOpen(true)} className="flex items-center gap-1 hover:text-red-600 transition-colors">
              <Trash size={14} />
              <span>삭제</span>
            </button>
          </div>
        )}

        {/* 헤더 */}
        <header className="mb-12">
          <div className="font-mono text-[#737373] text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#171717] block" />
            BULLETIN
          </div>
          <h1 className="text-3xl md:text-[2.75rem] font-bold text-[#171717] leading-[1.3] mb-8 break-keep tracking-tight">
            {bulletin.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-[11px] font-mono text-[#737373] tracking-widest uppercase">
            <span className="flex items-center gap-1.5"><CalendarBlank size={14} /> {formatDate(bulletin.createdAt)}</span>
            <span className="w-px h-3 bg-[#E5E5E5] block" />
            <span className="flex items-center gap-1.5"><Folder size={14} /> 주보</span>
            <span className="w-px h-3 bg-[#E5E5E5] block" />
            <span className="flex items-center gap-1.5"><Eye size={14} /> {bulletin.viewCount}</span>
          </div>
        </header>

        <hr className="border-t border-[#E5E5E5] mb-16" />

        {/* 썸네일 이미지 (PDF 첫 페이지) */}
        {bulletin.thumbnailUrl && (
          <div className="mb-16">
            <img
              src={bulletin.thumbnailUrl}
              alt={bulletin.title}
              className="w-full h-auto max-w-2xl mx-auto border border-[#E5E5E5]"
            />
          </div>
        )}

        {/* 본문 — 에디터 HTML은 그대로, 에디터 도입 이전 순수 텍스트는 줄바꿈 유지해서 출력 */}
        <div className="prose prose-lg max-w-none text-base md:text-lg leading-[1.8] text-[#2C2C2C] font-light tracking-[-0.01em] break-keep [&_p]:mb-8 [&_img]:max-w-full [&_img]:h-auto min-h-[80px]">
          {bulletin.content ? (
            isHtmlContent(bulletin.content) ? (
              <div
                className="ql-editor ql-output"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(bulletin.content) }}
              />
            ) : (
              <div className="whitespace-pre-wrap">{bulletin.content}</div>
            )
          ) : (
            <div className="text-[#A3A3A3] text-center py-12">작성된 내용이 없습니다.</div>
          )}
        </div>

        {/* 주보 다운로드 */}
        {bulletin.fileId && (
          <div className="mt-24">
            <div className="flex items-end justify-between border-b border-[#171717] pb-3 mb-2">
              <h4 className="font-mono text-[11px] font-bold text-[#171717] tracking-widest uppercase">Attachments</h4>
              <span className="font-mono text-[10px] text-[#737373] tracking-widest">1 FILE</span>
            </div>
            <button
              onClick={() => downloadFile(bulletin.fileId, `${bulletin.title}.pdf`)}
              className="w-full flex items-center gap-4 py-4 border-b border-[#E5E5E5] group hover:bg-[#F4F2EA] transition-colors px-3 -mx-3 text-left"
            >
              <DownloadSimple size={24} className="text-[#737373] group-hover:text-[#171717] shrink-0" />
              <span className="flex-1 text-sm md:text-base text-[#171717] truncate group-hover:underline underline-offset-4 decoration-1">
                {bulletin.title}.pdf
              </span>
              <span className="font-mono text-[10px] text-[#737373] tracking-widest uppercase shrink-0">.PDF</span>
            </button>
          </div>
        )}

        {/* 목록으로 */}
        <div className="mt-20 flex justify-center pb-8">
          <button
            onClick={() => navigate('/bulletin')}
            className="border border-[#E5E5E5] bg-transparent text-xs font-bold tracking-[0.1em] uppercase py-5 px-16 text-[#171717] hover:bg-[#171717] hover:text-[#FAF9F6] hover:border-[#171717] transition-all duration-300 flex items-center gap-3"
          >
            <List size={18} />
            <span>목록으로 돌아가기</span>
          </button>
        </div>
      </article>

      {/* 삭제 확인 모달 */}
      {deleteOpen && (
        <DeleteModal
          title={bulletin.title}
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => deleteMutation.mutate()}
          deleting={deleteMutation.isPending}
        />
      )}
    </main>
  )
}

export default BulletinDetailPage
