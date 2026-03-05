import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyInfo, updateProfile, changePassword } from '@/api/mypage'
import useAuthStore from '@/stores/authStore'
import { getErrorMessage } from '@/lib/apiError'
import LoadingSpinner from '@/components/common/LoadingSpinner'

// ─────────────────────────────────────────────
// 레이블 유틸
// ─────────────────────────────────────────────
const APPROVAL_LABEL = {
  PENDING:  { text: '승인 대기', cls: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { text: '승인',     cls: 'bg-green-100 text-green-700'  },
  REJECTED: { text: '반려',     cls: 'bg-red-100 text-red-600'       },
}

const ROLE_LABEL = {
  ROLE_ADMIN: '관리자',
  ROLE_USER:  '일반 회원',
}

// ─────────────────────────────────────────────
// 프로필 수정 섹션
// ─────────────────────────────────────────────
const ProfileSection = ({ user }) => {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  const [fields, setFields] = useState({
    name:        '',
    phoneNumber: '',
    address:     '',
    gender:      '',
    birth:       '',
  })
  const [success, setSuccess] = useState(false)

  // 데이터 로드 후 폼 세팅
  useEffect(() => {
    if (user) {
      setFields({
        name:        user.name        ?? '',
        phoneNumber: user.phoneNumber ?? '',
        address:     user.address     ?? '',
        gender:      user.gender      ?? '',
        birth:       user.birth       ?? '',
      })
    }
  }, [user])

  const set = (key) => (e) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }))

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mypage', 'info'] })
      // Zustand store 이름도 최신화
      setUser((prev) => ({ ...prev, name: fields.name }))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!fields.name.trim()) return alert('이름은 필수입니다.')
    mutation.mutate(fields)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-5">프로필 정보</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 이름 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text" value={fields.name} onChange={set('name')}
              maxLength={50} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">연락처</label>
            <input
              type="tel" value={fields.phoneNumber} onChange={set('phoneNumber')}
              placeholder="010-0000-0000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 성별 + 생년월일 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">성별</label>
            <select
              value={fields.gender} onChange={set('gender')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">선택 안 함</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">생년월일</label>
            <input
              type="date" value={fields.birth} onChange={set('birth')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 주소 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">주소</label>
          <input
            type="text" value={fields.address} onChange={set('address')}
            placeholder="주소를 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 피드백 */}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 rounded-lg px-4 py-2">
            프로필이 수정되었습니다.
          </p>
        )}
        {mutation.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">
            {getErrorMessage(mutation.error, '저장 중 오류가 발생했습니다.')}
          </p>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            {mutation.isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────
// 비밀번호 변경 섹션 (소셜 로그인 사용자는 숨김)
// ─────────────────────────────────────────────
const PasswordSection = ({ userType }) => {
  const [form, setForm] = useState({
    currentPassword: '', newPassword: '', newPasswordConfirm: '',
  })
  const [success, setSuccess] = useState(false)
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.newPassword !== form.newPasswordConfirm) {
      return alert('새 비밀번호가 일치하지 않습니다.')
    }
    mutation.mutate(form)
  }

  // 소셜 로그인 사용자는 비밀번호 변경 불가
  if (userType === 'SOCIAL') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-2">비밀번호 변경</h2>
        <p className="text-sm text-gray-400">소셜 로그인 계정은 비밀번호 변경을 지원하지 않습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-5">비밀번호 변경</h2>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">현재 비밀번호</label>
          <input
            type="password" value={form.currentPassword} onChange={set('currentPassword')}
            required autoComplete="current-password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            새 비밀번호 <span className="text-gray-400 font-normal">(8자 이상)</span>
          </label>
          <input
            type="password" value={form.newPassword} onChange={set('newPassword')}
            required minLength={8} autoComplete="new-password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">새 비밀번호 확인</label>
          <input
            type="password" value={form.newPasswordConfirm} onChange={set('newPasswordConfirm')}
            required autoComplete="new-password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {success && (
          <p className="text-sm text-green-600 bg-green-50 rounded-lg px-4 py-2">
            비밀번호가 변경되었습니다.
          </p>
        )}
        {mutation.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">
            {getErrorMessage(mutation.error, '비밀번호 변경 중 오류가 발생했습니다.')}
          </p>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            {mutation.isPending ? '변경 중...' : '변경'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────
// 메인 마이페이지
// ─────────────────────────────────────────────
const MyPage = () => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['mypage', 'info'],
    queryFn: getMyInfo,
  })

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-sm text-red-600">내 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  const approval = APPROVAL_LABEL[user?.approvalStatus] ?? { text: user?.approvalStatus, cls: 'bg-gray-100 text-gray-600' }
  const roleName = ROLE_LABEL[user?.role] ?? user?.role

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-gray-900 mb-8">마이페이지</h1>

      {/* 계정 요약 카드 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-bold">{user?.name}</p>
            <p className="text-sm text-blue-100 mt-0.5">{user?.email}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">
              {roleName}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${approval.cls}`}>
              {approval.text}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-2 text-xs text-blue-100">
          <span>가입일: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}</span>
          {user?.registrationPath && <span>가입 경로: {user.registrationPath}</span>}
        </div>
      </div>

      {/* 반려 사유 표시 */}
      {user?.approvalStatus === 'REJECTED' && user?.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
          <p className="text-sm font-medium text-red-700 mb-1">가입 반려 안내</p>
          <p className="text-sm text-red-600">{user.rejectionReason}</p>
        </div>
      )}

      <div className="space-y-4">
        <ProfileSection user={user} />
        <PasswordSection userType={user?.userType} />
      </div>
    </div>
  )
}

export default MyPage
