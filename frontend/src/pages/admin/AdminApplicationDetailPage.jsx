import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminApplication, completeApplication, updateApplicationMemo } from '@/api/applications'

const STATUS_BADGE = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100  text-green-700',
}

const Row = ({ label, value }) => value != null ? (
  <div className="flex py-3 border-b border-gray-100 last:border-0">
    <dt className="w-32 flex-shrink-0 text-sm text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-800 whitespace-pre-wrap">{value}</dd>
  </div>
) : null

// 차량신청 memo JSON 파싱
const parseVehicleMemo = (memo) => {
  if (!memo) return null
  try {
    const obj = JSON.parse(memo)
    if (obj.__type === '차량신청') return obj
  } catch {}
  return null
}

const AdminApplicationDetailPage = () => {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const [adminMemo, setAdminMemo] = useState('')
  const [memoSaved, setMemoSaved] = useState(false)

  const { data: application, isLoading } = useQuery({
    queryKey: ['admin', 'applications', id],
    queryFn:  () => getAdminApplication(id),
    onSuccess: (data) => {
      setAdminMemo(data.adminMemo ?? '')
    },
  })

  const completeMutation = useMutation({
    mutationFn: () => completeApplication(id, adminMemo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] })
    },
  })

  const memoMutation = useMutation({
    mutationFn: () => updateApplicationMemo(id, adminMemo),
    onSuccess: () => {
      setMemoSaved(true)
      setTimeout(() => setMemoSaved(false), 2000)
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications', id] })
    },
  })

  if (isLoading) return <div className="p-8 text-sm text-gray-400">불러오는 중...</div>
  if (!application) return <div className="p-8 text-sm text-gray-400">신청 내역을 찾을 수 없습니다.</div>

  const isPending   = application.status === 'PENDING'
  const isVehicle   = application.categoryName === '차량신청'
  const vehicleData = isVehicle ? parseVehicleMemo(application.memo) : null
  const plainMemo   = !isVehicle ? application.memo : null

  return (
    <div className="p-8 max-w-2xl">
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

      {/* 기본 신청 정보 */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-2 mb-4">
        <dl>
          <Row label="신청자"    value={application.applicantName} />
          <Row label="연락처"    value={application.applicantEmail} />
          <Row label="사용 날짜" value={application.useDate} />
          <Row label={isVehicle ? '출발 / 도착' : '사용 시간'} value={`${application.useStartTime?.slice(0,5)} ~ ${application.useEndTime?.slice(0,5)}`} />
          <Row label="사용 목적" value={application.purpose} />
          <Row label="인원"      value={`${application.headCount}명`} />
          <Row label="요청사항"  value={plainMemo} />
        </dl>
      </div>

      {/* 차량신청 전용 정보 */}
      {isVehicle && vehicleData && (
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-2 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest pt-3 pb-1">차량 정보</p>
          <dl>
            <Row label="차량 번호" value={vehicleData.vehicleNumber} />
            <Row label="목적지"    value={vehicleData.destination} />
            <Row label="운전자"    value={vehicleData.driver} />
            <Row label="인솔자"    value={vehicleData.escort} />
            <Row label="기타"      value={vehicleData.notes} />
          </dl>
        </div>
      )}

      {/* 관리자 메모 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">담당자 메모</label>
        <textarea
          value={adminMemo}
          onChange={(e) => setAdminMemo(e.target.value)}
          rows={3}
          placeholder="처리 관련 메모를 남겨주세요. (신청자에게 표시됩니다)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={() => memoMutation.mutate()}
            disabled={memoMutation.isPending}
            className="px-4 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
          >
            {memoSaved ? '저장됨 ✓' : memoMutation.isPending ? '저장 중...' : '메모 저장'}
          </button>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/admin/applications')}
          className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
        >
          목록으로
        </button>
        {isPending && (
          <button
            onClick={() => {
              if (window.confirm('처리 완료로 변경하시겠습니까?')) completeMutation.mutate()
            }}
            disabled={completeMutation.isPending}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {completeMutation.isPending ? '처리 중...' : '처리 완료'}
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
        >
          인쇄
        </button>
      </div>
    </div>
  )
}

export default AdminApplicationDetailPage
