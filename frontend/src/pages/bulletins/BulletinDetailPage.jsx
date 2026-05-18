import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBulletin, increaseBulletinViews, deleteBulletin } from '@/api/bulletins'
import { downloadFile } from '@/api/files'
import useAuthStore from '@/stores/authStore'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import toast from '@/utils/toast'

/* ── 날짜 포맷 ─────────────────────────────────────── */
const formatDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, '0')}월 ${String(d.getDate()).padStart(2, '0')}일`
}

/* ── 삭제 확인 모달 ─────────────────────────────────── */
const DeleteModal = ({ title, onClose, onConfirm, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white max-w-md w-full shadow-2xl">
      <div className="p-8">
        <h3 className="text-xl font-light text-slate-900 mb-2">주보 삭제</h3>
        <p className="text-slate-600 font-light mb-2">이 주보를 삭제하시겠습니까?</p>
        <p className="text-slate-900 font-medium bg-slate-50 px-4 py-3">{title}</p>
      </div>
      <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-200">
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

/* ── 다운로드 버튼 ─────────────────────────────────── */
const DownloadButton = ({ fileId, title, className = '' }) => {
  if (!fileId) return null
  return (
    <button
      onClick={() => downloadFile(fileId, `${title}.pdf`)}
      className={`flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 transition font-medium ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      주보 다운로드
    </button>
  )
}

/* ── 메인 컴포넌트 ──────────────────────────────────── */
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
    <main className="pt-page pb-16 px-6">
      <div className="max-w-4xl mx-auto text-red-500">주보를 불러올 수 없습니다.</div>
    </main>
  )

  return (
    <main>
      {/* Hero */}
      <section className="pt-page pb-16 bg-slate-50 px-6">
        <div className="max-w-4xl mx-auto">
          {/* 빵부스러기 */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <button
              onClick={() => navigate('/bulletin')}
              className="hover:text-slate-900 transition"
            >
              주보
            </button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-900">{bulletin.title}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-light text-slate-900 tracking-tight mb-6">
            {bulletin.title}
          </h1>

          <div className="flex items-center justify-between text-sm text-slate-500 pb-6 border-b border-slate-200 flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span>{formatDate(bulletin.createdAt)}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {bulletin.viewCount}
              </span>
            </div>

            {/* 다운로드 + 관리자 삭제 */}
            <div className="flex gap-2">
              <DownloadButton fileId={bulletin.fileId} title={bulletin.title} />
              {canWrite && (isAdmin || bulletin?.authorId === userId) && (
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 transition font-medium"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 본문 */}
      <section className="py-16 bg-white px-6">
        <div className="max-w-4xl mx-auto">
          {/* 썸네일 이미지 (PDF 첫 페이지) */}
          {bulletin.thumbnailUrl && (
            <div className="mb-12">
              <img
                src={bulletin.thumbnailUrl}
                alt={bulletin.title}
                className="w-full h-auto max-w-2xl mx-auto shadow-lg"
              />
            </div>
          )}

          {/* 본문 내용 */}
          <div className="prose prose-slate max-w-none">
            {bulletin.content ? (
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-light">
                {bulletin.content}
              </div>
            ) : (
              <div className="text-slate-400 text-center py-12 font-light">
                작성된 내용이 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 하단 버튼 */}
      <section className="py-12 bg-slate-50 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/bulletin')}
              className="px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 transition font-medium"
            >
              목록으로
            </button>
          </div>
        </div>
      </section>

      {/* 삭제 모달 */}
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
