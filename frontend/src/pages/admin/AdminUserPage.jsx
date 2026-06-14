import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, getPendingUsers, approveUser, rejectUser, disableUser, enableUser, grantOperator, revokeOperator, getUserPermissions, grantPermission, revokePermission } from '@/api/users'
import ErrorMessage from '@/components/common/ErrorMessage'
import { SkeletonRow } from '@/components/ui/SkeletonCard'

const AREA_LABELS = {
  NOTICE:       '공지사항',
  BULLETIN:     '주보',
  PRAISE_SHEET: '찬양악보',
  DEPARTMENT:   '부서',
}
const ALL_AREAS = Object.keys(AREA_LABELS)

// ── 권한 관리 모달 ────────────────────────────────────────────────────────
const PermissionModal = ({ user, onClose }) => {
  const queryClient = useQueryClient()

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['admin', 'users', user.id, 'permissions'],
    queryFn: () => getUserPermissions(user.id),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users', user.id, 'permissions'] })

  const grantMutation  = useMutation({ mutationFn: grantPermission,  onSuccess: invalidate })
  const revokeMutation = useMutation({ mutationFn: revokePermission, onSuccess: invalidate })

  const toggle = (area) => {
    if (permissions.includes(area)) {
      revokeMutation.mutate({ userId: user.id, area })
    } else {
      grantMutation.mutate({ userId: user.id, area })
    }
  }

  const isPending = grantMutation.isPending || revokeMutation.isPending

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-base font-bold text-gray-900 mb-1">영역별 작성 권한</h3>
        <p className="text-sm text-gray-500 mb-5">
          <span className="font-medium text-gray-800">{user.name}</span> 님의 사용자 뷰 페이지 작성 권한을 설정합니다.
        </p>

        {isLoading ? (
          <div className="text-center py-4 text-sm text-gray-400">불러오는 중...</div>
        ) : (
          <div className="space-y-3">
            {ALL_AREAS.map((area) => {
              const hasPermission = permissions.includes(area)
              return (
                <div key={area} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-medium text-gray-700">{AREA_LABELS[area]}</span>
                  <button
                    onClick={() => toggle(area)}
                    disabled={isPending}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                      hasPermission ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        hasPermission ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  )
}

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

const ROLE_LABEL = {
  ADMIN:    { label: '총관리자', cls: 'bg-purple-100 text-purple-700' },
  OPERATOR: { label: '운영자',   cls: 'bg-blue-100 text-blue-700' },
  USER:     null,
}

// 교인 구분 (userType)
const USER_TYPE_LABEL = {
  REGISTERED:   { label: '등록교인',   cls: 'text-emerald-600' },
  UNREGISTERED: { label: '미등록교인', cls: 'text-slate-400' },
}

const AdminUserPage = () => {
  const [tab, setTab] = useState('all') // 'all' | 'pending'
  const [page, setPage] = useState(0)
  const [rejectModal, setRejectModal] = useState(null) // { userId, name }
  const [rejectReason, setRejectReason] = useState('')
  const [permissionModal, setPermissionModal] = useState(null) // user 객체
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
  const grantOperatorMutation = useMutation({ mutationFn: grantOperator, onSuccess: invalidate })
  const revokeOperatorMutation = useMutation({ mutationFn: revokeOperator, onSuccess: invalidate })

  const handleBlock = (userId, name) => {
    if (!confirm(`"${name}" 회원을 차단하시겠습니까?\n차단된 회원은 로그인이 불가합니다.`)) return
    disableMutation.mutate(userId)
  }

  const users = data?.content ?? []
  const totalPages = data?.pageInfo?.totalPages ?? 0

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">회원 관리</h1>

      {/* 탭 */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { key: 'all', label: '회원' },
          { key: 'pending', label: '승인대기' },
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
      {(approveMutation.error || rejectMutation.error || disableMutation.error) && (
        <div className="mb-4">
          <ErrorMessage
            error={approveMutation.error || rejectMutation.error || disableMutation.error}
          />
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden p-4 space-y-2">
          {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : error ? (
        <ErrorMessage error={error} fallback="회원 목록을 불러올 수 없습니다." />
      ) : users.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">
          {tab === 'pending' ? '승인 대기 회원이 없습니다.' : '회원이 없습니다.'}
        </p>
      ) : (
        <>
          {/* ── 데스크탑 테이블 (sm 이상) ── */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hidden sm:block">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-44" />
                <col />
                <col className="w-20" />
                <col className="w-28" />
                <col className="w-40" />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">이름</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">이메일</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">상태</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">가입일</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const status = STATUS_LABEL[u.approvalStatus] ?? { label: u.approvalStatus, cls: 'bg-gray-100 text-gray-600' }
                  const roleLabel = ROLE_LABEL[u.role] ?? null
                  const userTypeLabel = USER_TYPE_LABEL[u.userType] ?? null
                  const isOperator = u.role === 'OPERATOR'
                  const isAdminAccount = u.role === 'ADMIN'
                  return (
                    <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.deleted ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="truncate">{u.name}</span>
                          {roleLabel && (
                            <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-medium ${roleLabel.cls}`}>
                              {roleLabel.label}
                            </span>
                          )}
                          {!u.enabled && !u.deleted && (
                            <span className="shrink-0 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">차단</span>
                          )}
                          {u.deleted && (
                            <span className="shrink-0 text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">삭제됨</span>
                          )}
                        </div>
                        {userTypeLabel && (
                          <span className={`block text-xs mt-0.5 ${userTypeLabel.cls}`}>{userTypeLabel.label}</span>
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2 flex-nowrap">
                          {u.approvalStatus === 'PENDING' && !u.deleted && (
                            <>
                              <button
                                onClick={() => approveMutation.mutate(u.id)}
                                disabled={approveMutation.isPending}
                                className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors disabled:opacity-40"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => { setRejectModal({ userId: u.id, name: u.name }); setRejectReason('') }}
                                className="text-xs font-medium text-orange-500 hover:text-orange-700 transition-colors"
                              >
                                반려
                              </button>
                              <button
                                onClick={() => handleBlock(u.id, u.name)}
                                disabled={disableMutation.isPending}
                                className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                              >
                                차단
                              </button>
                            </>
                          )}
                          {u.approvalStatus === 'APPROVED' && !u.deleted && !isAdminAccount && (
                            <>
                              {u.enabled ? (
                                <button
                                  onClick={() => handleBlock(u.id, u.name)}
                                  disabled={disableMutation.isPending}
                                  className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-40"
                                >
                                  차단
                                </button>
                              ) : (
                                <button
                                  onClick={() => enableMutation.mutate(u.id)}
                                  disabled={enableMutation.isPending}
                                  className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-40"
                                >
                                  해제
                                </button>
                              )}
                              {/* 운영자 권한 부여/회수 */}
                              {isOperator ? (
                                <button
                                  onClick={() => revokeOperatorMutation.mutate(u.id)}
                                  disabled={revokeOperatorMutation.isPending}
                                  className="text-xs font-medium text-purple-500 hover:text-purple-700 transition-colors disabled:opacity-40"
                                >
                                  운영자 해제
                                </button>
                              ) : (
                                <button
                                  onClick={() => grantOperatorMutation.mutate(u.id)}
                                  disabled={grantOperatorMutation.isPending}
                                  className="text-xs font-medium text-purple-500 hover:text-purple-700 transition-colors disabled:opacity-40"
                                >
                                  운영자 지정
                                </button>
                              )}
                              {/* 영역별 작성 권한 */}
                              {!isOperator && (
                                <button
                                  onClick={() => setPermissionModal(u)}
                                  className="text-xs font-medium text-teal-500 hover:text-teal-700 transition-colors"
                                >
                                  권한
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ── 모바일 카드 목록 (sm 미만) ── */}
          <div className="sm:hidden space-y-2">
            {users.map((u) => {
              const status = STATUS_LABEL[u.approvalStatus] ?? { label: u.approvalStatus, cls: 'bg-gray-100 text-gray-600' }
              const roleLabel = ROLE_LABEL[u.role] ?? null
              const userTypeLabel = USER_TYPE_LABEL[u.userType] ?? null
              const isOperator = u.role === 'OPERATOR'
              const isAdminAccount = u.role === 'ADMIN'
              return (
                <div key={`m-${u.id}`} className={`bg-white rounded-xl border border-gray-200 p-4 ${u.deleted ? 'opacity-50' : ''}`}>
                  {/* 이름 + 상태 */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-gray-900 truncate">{u.name}</span>
                        {roleLabel && (
                          <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-medium ${roleLabel.cls}`}>{roleLabel.label}</span>
                        )}
                        {!u.enabled && !u.deleted && (
                          <span className="shrink-0 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">차단</span>
                        )}
                      </div>
                      {userTypeLabel && (
                        <span className={`block text-xs mt-0.5 ${userTypeLabel.cls}`}>{userTypeLabel.label}</span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${status.cls}`}>{status.label}</span>
                  </div>
                  {/* 이메일 */}
                  <p className="text-xs text-gray-400 truncate mb-3">{u.email}</p>
                  {/* 관리 버튼 */}
                  <div className="flex gap-2 flex-wrap">
                    {u.approvalStatus === 'PENDING' && !u.deleted && (
                      <>
                        <button onClick={() => approveMutation.mutate(u.id)} disabled={approveMutation.isPending}
                          className="text-xs font-medium text-green-600 border border-green-200 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors disabled:opacity-40">
                          승인
                        </button>
                        <button onClick={() => { setRejectModal({ userId: u.id, name: u.name }); setRejectReason('') }}
                          className="text-xs font-medium text-orange-500 border border-orange-200 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-md transition-colors">
                          반려
                        </button>
                        <button onClick={() => handleBlock(u.id, u.name)} disabled={disableMutation.isPending}
                          className="text-xs font-medium text-red-400 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors disabled:opacity-40">
                          차단
                        </button>
                      </>
                    )}
                    {u.approvalStatus === 'APPROVED' && !u.deleted && !isAdminAccount && (
                      <>
                        {u.enabled ? (
                          <button onClick={() => handleBlock(u.id, u.name)} disabled={disableMutation.isPending}
                            className="text-xs font-medium text-blue-500 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors disabled:opacity-40">
                            차단
                          </button>
                        ) : (
                          <button onClick={() => enableMutation.mutate(u.id)} disabled={enableMutation.isPending}
                            className="text-xs font-medium text-blue-500 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors disabled:opacity-40">
                            차단 해제
                          </button>
                        )}
                        {isOperator ? (
                          <button onClick={() => revokeOperatorMutation.mutate(u.id)} disabled={revokeOperatorMutation.isPending}
                            className="text-xs font-medium text-purple-500 border border-purple-200 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-md transition-colors disabled:opacity-40">
                            운영자 해제
                          </button>
                        ) : (
                          <button onClick={() => grantOperatorMutation.mutate(u.id)} disabled={grantOperatorMutation.isPending}
                            className="text-xs font-medium text-purple-500 border border-purple-200 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-md transition-colors disabled:opacity-40">
                            운영자 지정
                          </button>
                        )}
                        {!isOperator && (
                          <button onClick={() => setPermissionModal(u)}
                            className="text-xs font-medium text-teal-500 border border-teal-200 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-md transition-colors">
                            권한 설정
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
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

      {/* 권한 관리 모달 */}
      {permissionModal && (
        <PermissionModal
          user={permissionModal}
          onClose={() => setPermissionModal(null)}
        />
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
