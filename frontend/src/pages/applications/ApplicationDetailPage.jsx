import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApplication, cancelApplication } from '@/api/applications'
import useAuthStore from '@/stores/authStore'

const STATUS_BADGE = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100  text-green-700',
}

const Row = ({ label, value }) => (
  <div className="flex py-3 border-b border-gray-100 last:border-0">
    <dt className="w-28 flex-shrink-0 text-sm text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-800">{value ?? '-'}</dd>
  </div>
)

const ApplicationDetailPage = () => {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const { user }    = useAuthStore()

  const { data: application, isLoading } = useQuery({
    queryKey: ['applications', id],
    queryFn:  () => getApplication(id),
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'my'] })
      navigate('/applications')
    },
  })

  const handleCancel = () => {
    if (!window.confirm('신청을 취소하시겠습니까?')) return
    cancelMutation.mutate()
  }

  if (isLoading) return <div className="p-8 text-sm text-gray-400">불러오는 중...</div>
  if (!application) return <div className="p-8 text-sm text-gray-400">신청 내역을 찾을 수 없습니다.</div>

  const isOwner  = user?.email === application.applicantEmail
  const isPending = application.status === 'PENDING'

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">신청 상세</h1>
          <p className="text-sm text-gray-500 mt-1">{application.categoryName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_BADGE[application.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {application.statusLabel}
        </span>
      </div>

      {/* 신청 정보 */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-2 mb-4">
        <dl>
          <Row label="신청자"  value={application.applicantName} />
          <Row label="사용 날짜" value={application.useDate} />
          <Row label="사용 시간" value={`${application.useStartTime?.slice(0,5)} ~ ${application.useEndTime?.slice(0,5)}`} />
          <Row label="사용 목적" value={application.purpose} />
          <Row label="인원"    value={`${application.headCount}명`} />
          {application.memo && <Row label="요청사항" value={application.memo} />}
        </dl>
      </div>

      {/* 관리자 메모 */}
      {application.adminMemo && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-4">
          <p className="text-xs font-medium text-blue-600 mb-1">담당자 메모</p>
          <p className="text-sm text-blue-800 whitespace-pre-wrap">{application.adminMemo}</p>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/applications')}
          className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
        >
          목록으로
        </button>
        {isOwner && isPending && (
          <button
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="px-5 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition"
          >
            {cancelMutation.isPending ? '취소 중...' : '신청 취소'}
          </button>
        )}
      </div>
    </div>
  )
}

export default ApplicationDetailPage
