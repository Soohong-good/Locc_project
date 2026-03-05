import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSermon, deleteSermon } from '@/api/sermons'
import useAuthStore from '@/stores/authStore'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'

/**
 * YouTube URL → embed URL 변환
 */
const toEmbedUrl = (url) => {
  if (!url) return null
  try {
    const u = new URL(url)
    let videoId = u.searchParams.get('v')
    if (!videoId && u.hostname === 'youtu.be') videoId = u.pathname.slice(1)
    if (!videoId) return null
    return `https://www.youtube.com/embed/${videoId}`
  } catch {
    return null
  }
}

const SermonDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ROLE_ADMIN'
  const queryClient = useQueryClient()

  const { data: sermon, isLoading, error } = useQuery({
    queryKey: ['sermons', id],
    queryFn: () => getSermon(id),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteSermon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
      navigate('/sermons')
    },
  })

  const handleDelete = () => {
    if (!confirm('이 설교를 삭제하시겠습니까?')) return
    deleteMutation.mutate()
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <ErrorMessage error={error} fallback="설교를 불러올 수 없습니다." />
      <Link to="/sermons" className="mt-4 inline-block text-sm text-blue-600 hover:underline">← 목록으로</Link>
    </div>
  )

  const embedUrl = toEmbedUrl(sermon.videoUrl)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/sermons" className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6 inline-block">
        ← 설교 목록
      </Link>

      <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
              {sermon.category}
            </span>
            {sermon.isNew && (
              <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-medium">NEW</span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 leading-snug">{sermon.title}</h1>
          {sermon.scripture && (
            <p className="text-sm text-gray-500 mt-1">{sermon.scripture}</p>
          )}
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
            <span>{sermon.preacher}</span>
            {sermon.sermonDate && (
              <>
                <span>·</span>
                <span>{sermon.sermonDate}</span>
              </>
            )}
          </div>
        </div>

        {/* YouTube 영상 */}
        {embedUrl && (
          <div className="px-6 pt-5">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={embedUrl}
                title={sermon.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full rounded-xl"
              />
            </div>
          </div>
        )}

        {/* 본문 */}
        {sermon.content && (
          <div
            className="px-6 py-6 prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: sermon.content }}
          />
        )}

        {/* 첨부파일 */}
        {sermon.attachments && sermon.attachments.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 mb-2">첨부파일</p>
            <ul className="space-y-1">
              {sermon.attachments.map((file) => (
                <li key={file.id}>
                  <a
                    href={`/api/files/${file.id}/download`}
                    className="text-sm text-blue-600 hover:underline"
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
              href={`/admin/sermons/${id}/edit`}
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

export default SermonDetailPage
