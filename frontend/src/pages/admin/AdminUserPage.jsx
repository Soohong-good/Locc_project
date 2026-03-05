import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, getPendingUsers, approveUser, rejectUser, disableUser, enableUser, deleteUser } from '@/api/users'
import ErrorMessage from '@/components/common/ErrorMessage'
import LoadingSpinner from '@/components/common/LoadingSpinner'

/**
 * 관리자 회원 관리 페이지
 * - 탭: 전체 / 승인 대기
 * - 승인, 반려, 차단, 차단 해제, 삭제
 */

const STATUS_LABEL = {
  PENDING: { label: '대기', cls: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: '승인', cls: 'bg-green-100 text-green-700' },
  REJECTED: { label: '반려', cls: 'bg-red-100 text-red-600' },
}

const AdminUserPage = () => {
  const [tab, setTab] = useState('all') // 'all' | 'pending'
  const [page, setPage] = useState(0)
  const [rejectModal, setRejectModal] = useState(null) // { userId, name }
  const [rejectReason, setRejectReason] = useState('')
  const queryClient = useQueryClient()

  const queryFn = tab === 'pending'
    ? () => getPendingUsers({ page, size: 20 })
    : () => getUsers({ page, size: 20 })

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'users', tab, page],
    queryFn,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })

  const approveMutation = useMutation({ mutationFn: approveUser, onSuccess: invalidate })
  const rejectMutation = useMutation({
    mutationFn: rejectUser,
    onSuccess: () => { invalidate(); setRejectModal(null); setRejectReason('') },
  })
  const disableMutation = useMutation({ mutationFn: disableUser, onSuccess: invalidate })
  const enableMutation = useMutation({ mutationFn: enableUser, onSuccess: invalidate })
  const deleteMutation = useMutation({ mutationFn: deleteUser, onSuccess: invalidate })

  const handleDelete = (userId, name) => {
    if (!confirm(`"${name}" 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return
    deleteMutation.mutate(userId)
  }

  const users = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">회원 관리</h1>

      {/* 탭 */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { key: 'all', label: '전체' },
          { key: 'pending', label: '승인 대기' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setPage(0) }}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors font-medium ${
              tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 에러 */}
      {(approveMutation.error || rejectMutation.error || disableMutation.error || deleteMutation.error) && (
        <div className="mb-4">
          <ErrorMessage
            error={approveMutation.error || rejectMutation.error || disableMutation.error || deleteMutation.error}
          />
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner fullScreen={false} />
      ) : error ? (
        <ErrorMessage error={error} fallback="회원 목록을 불러올 수 없습니다." />
      ) : users.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">
          {tab === 'pending' ? '승인 대기 회원이 없습니다.' : '회원이 없습니다.'}
        </p>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">이름</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">이메일</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-20">상태</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-28 hidden md:table-cell">가입일</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-48">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const status = STATUS_LABEL[u.approvalStatus] ?? { label: u.approvalStatus, cls: 'bg-gray-100 text-gray-600' }
                  return (
                    <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.deleted ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {u.name}
                        {!u.enabled && !u.deleted && (
                          <span className="ml-1.5 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">차단</span>
                        )}
                        {u.deleted && (
                          <span className="ml-1.5 text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">삭제됨</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ko-KR') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {u.approvalStatus === 'PENDING' && !u.deleted && (
                            <>
                              <button
                                onClick={() => approveMutation.mutate(u.id)}
                                disabled={approveMutation.isPending}
                                className="text-xs text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => { setRejectModal({ userId: u.id, name: u.name }); setRejectReason('') }}
                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                              >
                                반려
                              </button>
                            </>
                          )}
                          {u.approvalStatus === 'APPROVED' && !u.deleted && (
                            u.enabled ? (
                              <button
                                onClick={() => disableMutation.mutate(u.id)}
                                disabled={disableMutation.isPending}
                                className="text-xs text-orange-500 hover:text-orange-700 disabled:opacity-50"
                              >
                                차단
                              </button>
                            ) : (
                              <button
                                onClick={() => enableMutation.mutate(u.id)}
                                disabled={enableMutation.isPending}
                                className="text-xs text-blue-500 hover:text-blue-700 disabled:opacity-50"
                              >
                                해제
                              </button>
                            )
                          )}
                          {!u.deleted && (
                            <button
                              onClick={() => handleDelete(u.id, u.name)}
                              disabled={deleteMutation.isPending}
                              className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-50"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mt-5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                    i === page ? 'bg-blue-600 text-white font-medium' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* 반려 모달 */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">회원 반려</h3>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-medium">{rejectModal.name}</span> 님의 가입을 반려합니다.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="반려 사유를 입력하세요 (선택)"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => rejectMutation.mutate({ userId: rejectModal.userId, reason: rejectReason })}
                disabled={rejectMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                {rejectMutation.isPending ? '처리 중...' : '반려'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUserPage
