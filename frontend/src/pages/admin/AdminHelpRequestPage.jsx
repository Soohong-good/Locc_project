import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getHelpRequests,
  updateHelpRequestStatus,
  updateAdminMemo,
  deleteHelpRequest,
} from '@/api/helpRequests'

// ── 상수 ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: null,          label: '전체' },
  { value: 'PENDING',     label: '대기중' },
  { value: 'IN_PROGRESS', label: '처리중' },
  { value: 'COMPLETED',   label: '완료' },
]

const STATUS_STYLE = {
  PENDING:     'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED:   'bg-green-100 text-green-700',
}

const STATUS_LABEL = {
  PENDING:     '대기중',
  IN_PROGRESS: '처리중',
  COMPLETED:   '완료',
}

// ── 상세 드로어 ───────────────────────────────────────────────────────────

const DetailDrawer = ({ item, onClose, onUpdated }) => {
  const queryClient = useQueryClient()
  const [memo, setMemo] = useState(item.adminMemo ?? '')
  const [memoSaved, setMemoSaved] = useState(false)

  const statusMutation = useMutation({
    mutationFn: (status) => updateHelpRequestStatus({ id: item.id, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'help-requests'] })
      onUpdated()
    },
  })

  const memoMutation = useMutation({
    mutationFn: () => updateAdminMemo({ id: item.id, adminMemo: memo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'help-requests'] })
      setMemoSaved(true)
      setTimeout(() => setMemoSaved(false), 2000)
    },
  })

  const nextStatus = {
    PENDING:     'IN_PROGRESS',
    IN_PROGRESS: 'COMPLETED',
    COMPLETED:   null,
  }[item.status]

  const nextStatusLabel = {
    IN_PROGRESS: '처리중으로 변경',
    COMPLETED:   '완료 처리',
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* 드로어 패널 */}
      <div className="relative z-50 w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">문의 상세</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 px-6 py-5 space-y-5">

          {/* 상태 배지 + 변경 버튼 */}
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[item.status]}`}>
              {STATUS_LABEL[item.status]}
            </span>
            {nextStatus && (
              <button
                onClick={() => statusMutation.mutate(nextStatus)}
                disabled={statusMutation.isPending}
                className="px-3 py-1 text-xs bg-slate-800 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                {statusMutation.isPending ? '변경 중...' : nextStatusLabel[nextStatus]}
              </button>
            )}
          </div>

          {/* 요청자 정보 */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <Row label="이름" value={item.name} />
            <Row label="전화번호" value={item.phone} />
            <Row label="이메일" value={item.email} />
            <Row label="접수일시" value={formatDateTime(item.createdAt)} />
          </div>

          {/* 문의 내용 */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">문의 내용</p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {item.content}
            </div>
          </div>

          {/* 관리자 메모 */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">관리자 메모</p>
            <textarea
              rows={4}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="내부 처리 메모를 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => memoMutation.mutate()}
                disabled={memoMutation.isPending}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {memoMutation.isPending ? '저장 중...' : '메모 저장'}
              </button>
              {memoSaved && (
                <span className="text-xs text-green-600 font-medium">저장됐습니다</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Row = ({ label, value }) => (
  <div className="flex gap-3 text-sm">
    <span className="w-20 text-gray-400 shrink-0">{label}</span>
    <span className="text-gray-800 break-all">{value ?? '-'}</span>
  </div>
)

// ── 유틸 ─────────────────────────────────────────────────────────────────

const formatDateTime = (str) => {
  if (!str) return '-'
  // "yyyy-MM-dd HH:mm" 형식 그대로 표시
  return str
}

// ── 메인 페이지 ──────────────────────────────────────────────────────────

const AdminHelpRequestPage = () => {
  const queryClient = useQueryClient()

  const [filterStatus, setFilterStatus] = useState(null)
  const [page, setPage] = useState(0)
  const [selectedItem, setSelectedItem] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'help-requests', { filterStatus, page }],
    queryFn: () => getHelpRequests({ page, size: 20, status: filterStatus }),
    placeholderData: (prev) => prev,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteHelpRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'help-requests'] })
      setSelectedItem(null)
    },
  })

  const handleDelete = (id, name) => {
    if (!window.confirm(`"${name}"의 문의를 삭제하시겠습니까?`)) return
    deleteMutation.mutate(id)
  }

  const handleFilterChange = (value) => {
    setFilterStatus(value)
    setPage(0)
  }

  const items = data?.content ?? []
  const pageInfo = data?.pageInfo

  // 통계 (현재 페이지 기준이 아닌 전체 수는 별도 카운트 API 없으므로 생략)
  const pendingCount = items.filter((i) => i.status === 'PENDING').length
  const totalElements = pageInfo?.totalElements ?? 0

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">도움문의 관리</h1>
        <p className="text-sm text-gray-500 mt-0.5">복음말씀 페이지 신앙 상담 요청 목록</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: '전체', value: totalElements, color: 'text-gray-900' },
          { label: '대기중', value: items.filter((i) => i.status === 'PENDING').length, color: 'text-yellow-600' },
          { label: '처리중', value: items.filter((i) => i.status === 'IN_PROGRESS').length, color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-4">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={label}
            onClick={() => handleFilterChange(value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filterStatus === value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-sm">불러오는 중...</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">문의 내역이 없습니다</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">이름</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">연락처</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">문의 내용</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">접수일시</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">상태</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600">{item.phone}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <span className="line-clamp-1">{item.content}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{item.createdAt}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <StatusSelect item={item} />
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      disabled={deleteMutation.isPending}
                      className="px-3 py-1 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {pageInfo && pageInfo.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={pageInfo.first}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            이전
          </button>
          <span className="text-sm text-gray-600">
            {pageInfo.page + 1} / {pageInfo.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={pageInfo.last}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            다음
          </button>
        </div>
      )}

      {/* 상세 드로어 */}
      {selectedItem && (
        <DetailDrawer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdated={() => {
            // 드로어 내 상태 변경 후 목록 row도 갱신되도록 선택 해제
            setSelectedItem(null)
          }}
        />
      )}
    </div>
  )
}

// ── 인라인 상태 셀렉트 ────────────────────────────────────────────────────

const StatusSelect = ({ item }) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (status) => updateHelpRequestStatus({ id: item.id, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'help-requests'] }),
  })

  return (
    <select
      value={item.status}
      onChange={(e) => mutation.mutate(e.target.value)}
      disabled={mutation.isPending}
      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${STATUS_STYLE[item.status]}`}
    >
      <option value="PENDING">대기중</option>
      <option value="IN_PROGRESS">처리중</option>
      <option value="COMPLETED">완료</option>
    </select>
  )
}

export default AdminHelpRequestPage
