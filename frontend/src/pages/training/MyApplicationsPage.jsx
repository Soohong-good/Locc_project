import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarBlank, Phone, Coins, Bank, X } from '@phosphor-icons/react'
import { getMyApplications, cancelApplication } from '@/api/training'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import toast from '@/utils/toast'

const fmtDateTime = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const MyApplicationsPage = () => {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn:  getMyApplications,
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelApplication(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-applications'] }),
    onError:   () => toast.error('취소에 실패했습니다.'),
  })

  const handleCancel = (appId) => {
    if (!window.confirm('정말 신청을 취소하시겠습니까?')) return
    cancelMutation.mutate(appId)
  }

  return (
    <main className="pt-20 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] min-h-[calc(100vh-5rem)]">

        {/* 헤더 */}
        <div className="p-8 md:p-16 lg:p-24 border-b border-[#E5E5E5] bg-[#FAF9F6]">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono">MY TRAINING</span>
            <span className="w-8 h-px bg-[#E5E5E5] hidden md:block" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#171717] leading-[1.1] break-keep">
            내 신청내역
          </h1>
          <p className="mt-4 text-[#737373] font-light break-keep">훈련 신청 현황을 확인하실 수 있습니다</p>
        </div>

        {/* 목록 */}
        <div className="p-8 md:p-16 lg:p-24">

          {isLoading && <LoadingSpinner fullScreen={false} />}

          {!isLoading && applications.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#737373] mb-8 break-keep">신청한 훈련이 없습니다.</p>
              <button
                onClick={() => navigate('/training')}
                className="bg-[#171717] text-[#FAF9F6] px-10 py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#2C2C2C] transition-colors"
              >
                훈련 목록 보기
              </button>
            </div>
          )}

          {!isLoading && applications.length > 0 && (
            <div className="flex flex-col divide-y divide-[#E5E5E5] border-t border-b border-[#E5E5E5]">
              {applications.map((app) => (
                <div key={app.id} className="py-8 first:pt-0 last:pb-0">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-xl font-bold text-[#171717] mb-3 hover:underline underline-offset-4 decoration-1 cursor-pointer transition-colors break-keep"
                        onClick={() => navigate(`/training/${app.trainingId}`)}
                      >
                        {app.trainingTitle}
                      </h3>
                      <p className="flex items-center gap-1.5 text-sm text-[#737373] font-mono">
                        <CalendarBlank size={14} />
                        신청일 {fmtDateTime(app.appliedAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCancel(app.id)}
                      disabled={cancelMutation.isPending}
                      className="border border-[#E5E5E5] bg-[#FAF9F6] px-6 py-2.5 text-xs font-bold tracking-[0.1em] text-red-500 hover:text-red-600 hover:border-red-500 transition-all uppercase disabled:opacity-50 flex items-center gap-2 shrink-0"
                    >
                      <X size={14} weight="bold" />
                      신청 취소
                    </button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[#E5E5E5] flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#2C2C2C]">
                    <span className="flex items-center gap-1.5">
                      <Phone size={14} className="text-[#737373]" />
                      {app.phone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Coins size={14} className="text-[#737373]" />
                      {app.trainingFee > 0
                        ? <span className="font-medium text-[#171717]">{app.trainingFee.toLocaleString('ko-KR')}원</span>
                        : <span className="font-medium text-[#171717]">무료</span>
                      }
                    </span>
                  </div>

                  {app.paymentMethod === 'BANK' && (
                    <div className="mt-4 border border-[#E5E5E5] bg-[#F4F2EA] px-6 py-4 flex items-start gap-3">
                      <Bank size={18} className="text-[#737373] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold tracking-[0.1em] uppercase text-[#737373] mb-1">입금 계좌 안내</p>
                        <p className="text-sm text-[#171717] font-medium">농협 301-0273-8865-01</p>
                        <p className="text-xs text-[#737373] mt-0.5">예금주: 그리스도 사랑교회</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  )
}

export default MyApplicationsPage
