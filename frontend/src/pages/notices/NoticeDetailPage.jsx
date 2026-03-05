import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotice, increaseNoticeViews, deleteNotice } from '@/api/notices'
import useAuthStore from '@/stores/authStore'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'

const NoticeDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ROLE_ADMIN'
  const queryClient = useQueryClient()

  const { data: notice, isLoading, error } = useQuery({
    queryKey: ['notices', id],
    queryFn: () => getNotice(id),
  })

  // 조회수 증가 (최초 1회)
  useEffect(() => {
    if (id) increaseNoticeViews(id).catch(() => {})
  }, [id])

  const deleteMutation = useMutation({
    mutationFn: () => deleteNotice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
      navigate('/notices')
    },
  })

  const handleDelete = () => {
    if (!confirm('이 공지사항을 삭제하시겠습니까?')) return
    deleteMutation.mutate()
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <ErrorMessage error={error} fallback="공지사항을 불러올 수 없습니다." />
      <Link to="/notices" className="mt-4 inline-block text-sm text-blue-600 hover:underline">← 목록으로</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* 뒤로 */}
      <Link to="/notices" className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6 inline-block">
        ← 공지사항 목록
      </Link>

      <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            {notice.isPinned && <span className="text-yellow-500 text-sm">📌</span>}
            {notice.isNew && (
              <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">NEW</span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 leading-snug">{notice.title}</h1>
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
            <span>{notice.authorName}</span>
            <span>·</span>
            <span>{notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('ko-KR') : ''}</span>
            <span>·</span>
            <span>조회 {notice.viewCount}</span>
          </div>
        </div>

        {/* 본문 */}
        <div
          className="px-6 py-6 prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: notice.content ?? '' }}
        />

        {/* 첨부파일 */}
        {notice.attachments && notice.attachments.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 mb-2">첨부파일</p>
            <ul className="space-y-1">
              {notice.attachments.map((file) => (
                <li key={file.id}>
                  <a
                    href={`/api/files/${file.id}/download`}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    📎 {file.originalName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 관리자 버튼 */}
        {isAdmin && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
            <a
              href={`/admin/notices/${id}/edit`}
              className="text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded-lg transition-colors"
            >
              수정
            </a>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-sm bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              삭제
            </button>
          </div>
        )}
      </article>
    </div>
  )
}

export default NoticeDetailPage
