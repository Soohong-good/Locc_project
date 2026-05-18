import { useNavigate } from 'react-router-dom'
import PageHero from '@/components/ui/PageHero'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyApplications, cancelApplication } from '@/api/training'
import { SkeletonRow } from '@/components/ui/SkeletonCard'
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
    <main>
      <PageHero
        eyebrow="My Training"
        title="내 신청내역"
        subtitle="훈련 신청 현황을 확인하실 수 있습니다"
      />

      {/* 목록 */}
      <section className="py-12 bg-white px-6">
        <div className="max-w-6xl mx-auto">

          {isLoading && (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          )}

          {!isLoading && applications.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 mb-6">신청한 훈련이 없습니다.</p>
              <button
                onClick={() => navigate('/training')}
                className="inline-block px-6 py-3 bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                훈련 목록 보기
              </button>
            </div>
          )}

          {!isLoading && applications.length > 0 && (
            <div className="space-y-6">
              {applications.map((app) => (
                <div key={app.id} className="border border-slate-200 p-6 hover:border-slate-300 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3
                        className="text-lg font-medium text-slate-900 mb-2 hover:text-blue-600 cursor-pointer transition"
                        onClick={() => navigate(`/training/${app.trainingId}`)}
                      >
                        {app.trainingTitle}
                      </h3>
                      <p className="text-sm text-slate-600">
                        신청일: {fmtDateTime(app.appliedAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCancel(app.id)}
                      disabled={cancelMutation.isPending}
                      className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition text-sm disabled:opacity-60"
                    >
                      신청 취소
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-100 text-sm text-slate-600 space-y-1">
                    <p>연락처: {app.phone}</p>
                    <p>
                      훈련비:{' '}
                      {app.trainingFee > 0
                        ? <span className="font-medium text-slate-800">{app.trainingFee.toLocaleString('ko-KR')}원</span>
                        : <span className="text-green-600 font-medium">무료</span>
                      }
                    </p>
                    {app.paymentMethod === 'BANK' && (
                      <div className="mt-2 bg-blue-50 border border-blue-200 px-4 py-3 rounded">
                        <p className="text-xs font-semibold text-blue-700 mb-1">입금 계좌 안내</p>
                        <p className="text-sm text-slate-800 font-medium">농협 301-0273-8865-01</p>
                        <p className="text-xs text-slate-500 mt-0.5">예금주: 그리스도 사랑교회</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </main>
  )
}

export default MyApplicationsPage
