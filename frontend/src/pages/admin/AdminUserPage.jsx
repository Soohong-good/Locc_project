import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUsers, getPendingUsers, approveUser, rejectUser,
  disableUser, enableUser, grantOperator, revokeOperator,
  getUserPermissions, grantPermission, revokePermission,
} from '@/api/users'
import useAuthStore from '@/stores/authStore'
import {
  UsersThree, Bell, Question, CaretLeft, CaretRight, X, ShieldCheck,
} from '@phosphor-icons/react'

const AREA_LABELS = {
  NOTICE:       '공지사항',
  BULLETIN:     '주보',
  PRAISE_SHEET: '찬양악보',
  DEPARTMENT:   '부서',
}
const ALL_AREAS = Object.keys(AREA_LABELS)

const STATUS_LABEL = {
  PENDING:  { label: '대기', cls: 'bg-[#fea619]/20 text-[#684000]' },
  APPROVED: { label: '승인', cls: 'bg-[#e5eeff] text-[#091426]' },
  REJECTED: { label: '반려', cls: 'bg-[#ffdad6]/50 text-[#ba1a1a]' },
}
const ROLE_LABEL = {
  ADMIN:    { label: '총관리자', cls: 'bg-[#e5d8ff] text-[#4a1d96]' },
  OPERATOR: { label: '운영자',   cls: 'bg-[#dce9ff] text-[#091426]' },
  USER:     null,
}
const USER_TYPE_LABEL = {
  REGISTERED:   { label: '등록교인',   cls: 'text-[#045d56]' },
  UNREGISTERED: { label: '미등록교인', cls: 'text-[#45474c]' },
}

/* ── 권한 관리 모달 ── */
function PermissionModal({ user, onClose }) {
  const queryClient = useQueryClient()
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['admin', 'users', user.id, 'permissions'],
    queryFn: () => getUserPermissions(user.id),
  })
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users', user.id, 'permissions'] })
  const grantMutation  = useMutation({ mutationFn: grantPermission,  onSuccess: invalidate })
  const revokeMutation = useMutation({ mutationFn: revokePermission, onSuccess: invalidate })
  const toggle = (area) => {
    if (permissions.includes(area)) revokeMutation.mutate({ userId: user.id, area })
    else grantMutation.mutate({ userId: user.id, area })
  }
  const isPending = grantMutation.isPending || revokeMutation.isPending

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#091426]" />
            <h3 className="text-[16px] font-bold text-[#0b1c30]">영역별 작성 권한</h3>
          </div>
          <button onClick={onClose} className="text-[#45474c] hover:text-[#0b1c30]"><X size={20} /></button>
        </div>
        <p className="text-[13px] text-[#45474c] mb-5">
          <span className="font-semibold text-[#0b1c30]">{user.name}</span> 님의 사용자 뷰 페이지 작성 권한을 설정합니다.
        </p>
        {isLoading
          ? <div className="py-4 text-center text-[13px] text-[#45474c]">불러오는 중...</div>
          : <div className="space-y-3">
              {ALL_AREAS.map((area) => {
                const has = permissions.includes(area)
                return (
                  <div key={area} className="flex items-center justify-between py-2 border-b border-[#e5eeff] last:border-0">
                    <span className="text-[14px] font-medium text-[#0b1c30]">{AREA_LABELS[area]}</span>
                    <button onClick={() => toggle(area)} disabled={isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${has ? 'bg-[#091426]' : 'bg-[#c5c6cd]'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${has ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                )
              })}
            </div>
        }
        <button onClick={onClose}
          className="mt-6 w-full border border-[#c5c6cd] hover:bg-[#eff4ff] text-[#0b1c30] text-[13px] font-medium py-2 rounded-lg transition-colors">
          닫기
        </button>
      </div>
    </div>
  )
}

/* ── 반려 모달 ── */
function RejectModal({ rejectModal, rejectReason, setRejectReason, onClose, onSubmit, isPending }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="text-[16px] font-bold text-[#0b1c30] mb-1">회원 반려</h3>
        <p className="text-[13px] text-[#45474c] mb-4">
          <span className="font-semibold text-[#0b1c30]">{rejectModal.name}</span> 님의 가입을 반려합니다.
        </p>
        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
          placeholder="반려 사유를 입력하세요 (선택)" rows={3}
          className="w-full border border-[#c5c6cd] rounded-lg px-3 py-2 text-[13px] text-[#0b1c30] resize-none focus:outline-none focus:ring-2 focus:ring-[#091426]/20" />
        <div className="flex gap-2 mt-4">
          <button onClick={onClose}
            className="flex-1 border border-[#c5c6cd] hover:bg-[#eff4ff] text-[#0b1c30] text-[13px] font-medium py-2 rounded-lg transition-colors">
            취소
          </button>
          <button onClick={onSubmit} disabled={isPending}
            className="flex-1 bg-[#ba1a1a] hover:opacity-90 disabled:opacity-50 text-white text-[13px] font-medium py-2 rounded-lg transition-colors">
            {isPending ? '처리 중...' : '반려'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── 메인 ── */
export default function AdminUserPage() {
  const queryClient = useQueryClient()
  const { user: me } = useAuthStore()
  const [tab, setTab] = useState('all')
  const [page, setPage] = useState(0)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [permissionModal, setPermissionModal] = useState(null)

  const queryFn = tab === 'pending'
    ? () => getPendingUsers({ page, size: 20 })
    : () => getUsers({ page, size: 20 })

  const { data, isLoading } = useQuery({ queryKey: ['admin', 'users', tab, page], queryFn })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
  const approveMutation      = useMutation({ mutationFn: approveUser,      onSuccess: invalidate })
  const rejectMutation       = useMutation({ mutationFn: rejectUser,        onSuccess: () => { invalidate(); setRejectModal(null); setRejectReason('') } })
  const disableMutation      = useMutation({ mutationFn: disableUser,       onSuccess: invalidate })
  const enableMutation       = useMutation({ mutationFn: enableUser,        onSuccess: invalidate })
  const grantOperatorMutation  = useMutation({ mutationFn: grantOperator,   onSuccess: invalidate })
  const revokeOperatorMutation = useMutation({ mutationFn: revokeOperator,  onSuccess: invalidate })

  const handleBlock = (userId, name) => {
    if (!confirm(`"${name}" 회원을 차단하시겠습니까?\n차단된 회원은 로그인이 불가합니다.`)) return
    disableMutation.mutate(userId)
  }

  const users      = data?.content ?? []
  const pageInfo   = data?.pageInfo ?? {}
  const totalPages = pageInfo.totalPages ?? 0
  const totalElements = pageInfo.totalElements ?? 0
  const currentPage   = pageInfo.page ?? 0

  const pageNums = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)
    const start = Math.max(0, Math.min(currentPage - 3, totalPages - 7))
    return Array.from({ length: 7 }, (_, i) => start + i)
  })()

  const pendingCount = users.filter((u) => u.approvalStatus === 'PENDING').length

  /* ── 행별 관리 버튼 ── */
  const ActionButtons = ({ u }) => {
    const isOperator    = u.role === 'OPERATOR'
    const isAdminAccount = u.role === 'ADMIN'
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {u.approvalStatus === 'PENDING' && !u.deleted && (
          <>
            <button onClick={() => approveMutation.mutate(u.id)} disabled={approveMutation.isPending}
              className="text-[11px] font-semibold text-[#091426] border border-[#091426]/20 bg-[#eff4ff] hover:bg-[#dce9ff] px-2.5 py-1 rounded-md transition-colors disabled:opacity-40">
              승인
            </button>
            <button onClick={() => { setRejectModal({ userId: u.id, name: u.name }); setRejectReason('') }}
              className="text-[11px] font-semibold text-[#684000] border border-[#fea619]/30 bg-[#fea619]/10 hover:bg-[#fea619]/20 px-2.5 py-1 rounded-md transition-colors">
              반려
            </button>
            <button onClick={() => handleBlock(u.id, u.name)} disabled={disableMutation.isPending}
              className="text-[11px] font-semibold text-[#ba1a1a] border border-[#ba1a1a]/20 bg-[#ffdad6]/30 hover:bg-[#ffdad6]/50 px-2.5 py-1 rounded-md transition-colors disabled:opacity-40">
              차단
            </button>
          </>
        )}
        {u.approvalStatus === 'APPROVED' && !u.deleted && !isAdminAccount && (
          <>
            {u.enabled
              ? <button onClick={() => handleBlock(u.id, u.name)} disabled={disableMutation.isPending}
                  className="text-[11px] font-semibold text-[#ba1a1a] border border-[#ba1a1a]/20 bg-[#ffdad6]/30 hover:bg-[#ffdad6]/50 px-2.5 py-1 rounded-md transition-colors disabled:opacity-40">
                  차단
                </button>
              : <button onClick={() => enableMutation.mutate(u.id)} disabled={enableMutation.isPending}
                  className="text-[11px] font-semibold text-[#091426] border border-[#c5c6cd] bg-white hover:bg-[#eff4ff] px-2.5 py-1 rounded-md transition-colors disabled:opacity-40">
                  해제
                </button>
            }
            {isOperator
              ? <button onClick={() => revokeOperatorMutation.mutate(u.id)} disabled={revokeOperatorMutation.isPending}
                  className="text-[11px] font-semibold text-[#4a1d96] border border-[#e5d8ff] bg-[#e5d8ff]/50 hover:bg-[#e5d8ff] px-2.5 py-1 rounded-md transition-colors disabled:opacity-40">
                  운영자 해제
                </button>
              : <button onClick={() => grantOperatorMutation.mutate(u.id)} disabled={grantOperatorMutation.isPending}
                  className="text-[11px] font-semibold text-[#4a1d96] border border-[#e5d8ff] bg-[#e5d8ff]/50 hover:bg-[#e5d8ff] px-2.5 py-1 rounded-md transition-colors disabled:opacity-40">
                  운영자 지정
                </button>
            }
            {!isOperator && (
              <button onClick={() => setPermissionModal(u)}
                className="text-[11px] font-semibold text-[#045d56] border border-[#045d56]/20 bg-[#e0f2f1]/40 hover:bg-[#e0f2f1] px-2.5 py-1 rounded-md transition-colors">
                권한
              </button>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* 상단 헤더 */}
      <header className="sticky top-0 z-40 flex justify-between items-center h-16 px-6 border-b border-[#c5c6cd] bg-[#f8f9ff]/80 backdrop-blur-md shrink-0">
        <h2 className="text-[20px] font-extrabold text-[#0b1c30]">계정 및 가입 관리</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-[#45474c]">
            <button className="hover:text-[#091426] transition-colors"><Bell size={22} /></button>
            <button className="hover:text-[#091426] transition-colors"><Question size={22} /></button>
          </div>
          <div className="flex items-center gap-3 border-l border-[#c5c6cd] pl-6">
            <div className="text-right">
              <p className="text-[12px] font-bold text-[#0b1c30]">{me?.name ?? '관리자'}</p>
              <p className="text-[10px] text-[#45474c] uppercase tracking-wider">Admin</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center text-white text-[12px] font-bold border border-[#d8e3fb]">
              {(me?.name ?? 'A')[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#cbd5e1] [&::-webkit-scrollbar-thumb]:rounded-full">
        <main className="p-8 space-y-8 max-w-[1440px] mx-auto w-full">

          {/* 페이지 헤더 */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-[12px] text-[#45474c] mb-2">
                <span>Admin</span><CaretRight size={12} /><span className="text-[#091426] font-bold">계정 및 가입 관리</span>
              </nav>
              <h2 className="text-[32px] font-semibold text-[#0b1c30] tracking-tight leading-10">계정 및 가입 관리</h2>
              <p className="text-[14px] text-[#45474c] mt-1">회원 승인·반려·차단 및 권한을 관리합니다.</p>
            </div>
          </section>

          {/* 통계 카드 */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: '전체 회원', value: `${totalElements}명`, iconBg: 'bg-[#091426]/5', iconColor: 'text-[#091426]' },
              { label: '승인 대기', value: `${pendingCount}명`, iconBg: 'bg-[#fea619]/10', iconColor: 'text-[#855300]' },
              { label: '현재 페이지', value: `${users.length}명`, iconBg: 'bg-[#e5eeff]', iconColor: 'text-[#45474c]' },
            ].map((c) => (
              <div key={c.label} className="bg-white border border-[#c5c6cd] p-6 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <span className={`p-2 rounded-lg w-fit ${c.iconBg}`}><UsersThree size={22} className={c.iconColor} /></span>
                <div className="mt-4">
                  <p className="text-[12px] font-medium text-[#45474c] uppercase tracking-tight">{c.label}</p>
                  <h3 className="text-[24px] font-semibold text-[#0b1c30] mt-1 leading-tight">{c.value}</h3>
                </div>
              </div>
            ))}
          </section>

          {/* 탭 + 테이블 */}
          <section className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-[#c5c6cd]">
            <div className="px-6 py-4 border-b border-[#c5c6cd] flex justify-between items-center bg-white">
              <div className="flex gap-1 bg-[#eff4ff] rounded-lg p-1">
                {[{ key: 'all', label: '회원' }, { key: 'pending', label: `승인대기${pendingCount > 0 ? ` (${pendingCount})` : ''}` }].map(({ key, label }) => (
                  <button key={key} onClick={() => { setTab(key); setPage(0) }}
                    className={`px-4 py-1.5 text-[13px] rounded-md transition-colors font-medium ${
                      tab === key ? 'bg-white text-[#0b1c30] shadow-sm' : 'text-[#45474c] hover:text-[#0b1c30]'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              <span className="text-[14px] text-[#45474c]">총 {totalElements}명</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] text-[#45474c] text-[12px] font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">이름</th>
                    <th className="px-6 py-4 hidden sm:table-cell">이메일</th>
                    <th className="px-6 py-4">상태</th>
                    <th className="px-6 py-4 hidden md:table-cell">가입일</th>
                    <th className="px-6 py-4">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c6cd]/50">
                  {isLoading
                    ? [...Array(6)].map((_, i) => (
                        <tr key={i}>{[160, 200, 60, 80, 200].map((w, j) => (
                          <td key={j} className="px-6 py-4"><div className="h-4 bg-[#e5eeff] rounded animate-pulse" style={{ width: w }} /></td>
                        ))}</tr>
                      ))
                    : users.length === 0
                    ? <tr><td colSpan={5} className="px-6 py-16 text-center text-[14px] text-[#45474c]">
                        {tab === 'pending' ? '승인 대기 회원이 없습니다.' : '회원이 없습니다.'}
                      </td></tr>
                    : users.map((u) => {
                        const status       = STATUS_LABEL[u.approvalStatus] ?? { label: u.approvalStatus, cls: 'bg-[#e5eeff] text-[#45474c]' }
                        const roleLabel    = ROLE_LABEL[u.role] ?? null
                        const userTypeLabel = USER_TYPE_LABEL[u.userType] ?? null
                        return (
                          <tr key={u.id} className={`hover:bg-[#eff4ff]/50 transition-colors ${u.deleted ? 'opacity-50' : ''}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[14px] font-medium text-[#0b1c30] truncate">{u.name}</span>
                                {roleLabel && <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-bold ${roleLabel.cls}`}>{roleLabel.label}</span>}
                                {!u.enabled && !u.deleted && <span className="shrink-0 text-[10px] bg-[#ffdad6]/50 text-[#ba1a1a] px-1.5 py-0.5 rounded font-bold">차단</span>}
                                {u.deleted && <span className="shrink-0 text-[10px] bg-[#e5eeff] text-[#45474c] px-1.5 py-0.5 rounded">삭제됨</span>}
                              </div>
                              {userTypeLabel && <span className={`block text-[11px] mt-0.5 ${userTypeLabel.cls}`}>{userTypeLabel.label}</span>}
                            </td>
                            <td className="px-6 py-4 text-[13px] text-[#45474c] hidden sm:table-cell">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${status.cls}`}>{status.label}</span>
                            </td>
                            <td className="px-6 py-4 text-[13px] text-[#45474c] hidden md:table-cell whitespace-nowrap">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ko-KR') : '-'}
                            </td>
                            <td className="px-6 py-4"><ActionButtons u={u} /></td>
                          </tr>
                        )
                      })
                  }
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-white border-t border-[#c5c6cd] flex justify-between items-center">
                <p className="text-[12px] text-[#45474c]">총 {totalElements}명</p>
                <div className="flex gap-1 items-center">
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}
                    className="p-2 rounded-lg border border-[#c5c6cd] hover:bg-[#e5eeff] disabled:opacity-40 transition-colors">
                    <CaretLeft size={16} />
                  </button>
                  {pageNums.map((n) => (
                    n === currentPage
                      ? <button key={n} className="w-9 h-9 rounded-lg bg-[#091426] text-white text-[12px] font-bold">{n + 1}</button>
                      : <button key={n} onClick={() => setPage(n)}
                          className="w-9 h-9 rounded-lg border border-[#c5c6cd] text-[12px] text-[#45474c] hover:bg-[#e5eeff] transition-colors">
                          {n + 1}
                        </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
                    className="p-2 rounded-lg border border-[#c5c6cd] hover:bg-[#e5eeff] disabled:opacity-40 transition-colors">
                    <CaretRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>

        </main>
      </div>

      {/* 하단 푸터 */}
      <footer className="h-12 shrink-0 flex items-center justify-between px-6 border-t border-[#c5c6cd] bg-white text-[11px] text-[#45474c] font-medium">
        <div>© 2026 그리스도사랑교회 관리자 시스템</div>
      </footer>

      {permissionModal && <PermissionModal user={permissionModal} onClose={() => setPermissionModal(null)} />}
      {rejectModal && (
        <RejectModal rejectModal={rejectModal} rejectReason={rejectReason} setRejectReason={setRejectReason}
          onClose={() => setRejectModal(null)}
          onSubmit={() => rejectMutation.mutate({ userId: rejectModal.userId, reason: rejectReason })}
          isPending={rejectMutation.isPending} />
      )}
    </div>
  )
}
