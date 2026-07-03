import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Printer } from '@phosphor-icons/react'
import { getApplication, cancelApplication } from '@/api/applications'
import useAuthStore from '@/stores/authStore'
import VehicleFormPrint from '@/components/applications/VehicleFormPrint'

const STATUS_BADGE = {
  PENDING:   'border border-amber-300 text-amber-700 bg-amber-50',
  COMPLETED: 'border border-emerald-300 text-emerald-700 bg-emerald-50',
}

const Row = ({ label, value }) => value ? (
  <div className="flex py-3 border-b border-[#E5E5E5] last:border-0">
    <dt className="w-28 flex-shrink-0 text-sm text-[#737373]">{label}</dt>
    <dd className="text-sm text-[#2C2C2C]">{value}</dd>
  </div>
) : null

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

  if (isLoading) return <div className="min-h-screen bg-[#FAF9F6] p-8 text-sm text-[#737373]">불러오는 중...</div>
  if (!application) return <div className="min-h-screen bg-[#FAF9F6] p-8 text-sm text-[#737373]">신청 내역을 찾을 수 없습니다.</div>

  const isOwner   = user?.email === application.applicantEmail
  const isPending = application.status === 'PENDING'
  const isVehicle = application.categoryName === '차량신청'
  const plainMemo = !isVehicle ? application.memo : null

  return (
    <>
      {/* 인쇄 스타일 */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #vehicle-print-area, #vehicle-print-area * { visibility: visible; }
          #vehicle-print-area {
            position: fixed;
            top: 0; left: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#FAF9F6]">
        <div className="max-w-3xl mx-auto px-6 pt-24 pb-24">

          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8 print:hidden">
            <div>
              <span className="font-mono text-xs tracking-[0.25em] uppercase text-[#737373] mb-2 block">Applications</span>
              <h1 className="text-2xl font-bold text-[#171717]">신청 상세</h1>
              <p className="text-sm text-[#737373] mt-1">{application.categoryName}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium ${STATUS_BADGE[application.status] ?? 'border border-[#E5E5E5] text-[#737373] bg-[#F4F2EA]'}`}>
              {application.statusLabel}
            </span>
          </div>

          {/* 차량신청: 신청서 원본 레이아웃 */}
          {isVehicle ? (
            <VehicleFormPrint application={application} />
          ) : (
            <div className="bg-white border border-[#E5E5E5] px-5 py-2 mb-4">
              <dl>
                <Row label="신청자"   value={application.applicantName} />
                <Row label="사용 날짜" value={application.useDate} />
                <Row label="사용 시간" value={`${application.useStartTime?.slice(0,5)} ~ ${application.useEndTime?.slice(0,5)}`} />
                <Row label="사용 목적" value={application.purpose} />
                <Row label="인원"     value={`${application.headCount}명`} />
                {plainMemo && <Row label="요청사항" value={plainMemo} />}
              </dl>
            </div>
          )}

          {/* 관리자 메모 */}
          {application.adminMemo && (
            <div className="bg-blue-50 border border-blue-200 px-5 py-4 mt-4 print:hidden">
              <p className="text-xs font-medium text-blue-600 mb-1">담당자 메모</p>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{application.adminMemo}</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 mt-8 print:hidden">
            <button
              onClick={() => navigate('/applications')}
              className="text-xs font-bold tracking-[0.1em] uppercase border border-[#E5E5E5] text-[#737373] px-6 py-2.5 hover:border-[#171717] hover:text-[#171717] transition-colors"
            >
              목록으로
            </button>
            {isOwner && isPending && (
              <button
                onClick={() => { if (window.confirm('신청을 취소하시겠습니까?')) cancelMutation.mutate() }}
                disabled={cancelMutation.isPending}
                className="text-xs font-bold tracking-[0.1em] uppercase border border-red-300 text-red-500 px-6 py-2.5 hover:border-red-500 transition-colors disabled:opacity-50"
              >
                {cancelMutation.isPending ? '취소 중...' : '신청 취소'}
              </button>
            )}
            {isVehicle && (
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.1em] uppercase bg-[#171717] text-[#FAF9F6] px-6 py-2.5 hover:opacity-90 transition-colors"
              >
                <Printer size={14} weight="bold" />
                인쇄
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ApplicationDetailPage
