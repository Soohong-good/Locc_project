import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getMyInfo, updateProfile, changePassword } from '@/api/mypage'
import { getErrorMessage } from '@/lib/apiError'
import useDaumPostcode from '@/hooks/useDaumPostcode'
import { DateInput } from '@/components/ui/DateInput'
import toast from '@/utils/toast'

// ─── 승인 상태 ──────────────────────────────────────
const APPROVAL = {
  APPROVED: { text: '승인 완료', cls: 'bg-green-500/20 text-green-300' },
  PENDING:  { text: '승인 대기', cls: 'bg-yellow-500/20 text-yellow-300' },
  REJECTED: { text: '반려',     cls: 'bg-red-500/20 text-red-300' },
}

// ─── 탭 버튼 ────────────────────────────────────────
const TabBtn = ({ id, label, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`px-6 py-4 font-medium transition-colors border-b-2 ${
      active
        ? 'border-slate-900 text-slate-900'
        : 'border-transparent text-slate-500 hover:text-slate-700'
    }`}
  >
    {label}
  </button>
)

// ─── 내 정보 탭 ─────────────────────────────────────
const InfoTab = ({ user, onEdit }) => {
  const rows = [
    { label: '이메일',    value: user.email },
    { label: '이름',      value: user.name },
    { label: '성별',      value: user.gender ?? '미입력' },
    { label: '전화번호',  value: user.phoneNumber ?? '미입력' },
    { label: '생년월일',  value: user.birth ?? '미입력' },
    { label: '주소',      value: user.address ?? '미입력' },
    { label: '교인 구분', value: user.userType ?? '-' },
    {
      label: '가입일',
      value: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : '-',
    },
    ...(user.registrationPath ? [{ label: '가입 경로', value: user.registrationPath }] : []),
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-medium text-slate-900 mb-6">내 정보</h2>
      <div className="space-y-0">
        {rows.map(({ label, value }) => (
          <div key={label} className="grid grid-cols-3 gap-4 py-4 border-b border-slate-100 last:border-0">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="col-span-2 text-sm text-slate-900">{value}</dd>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-slate-200">
        <button
          onClick={onEdit}
          className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium"
        >
          정보 수정하기
        </button>
      </div>
    </div>
  )
}

// ─── 정보 수정 탭 ────────────────────────────────────
const EditTab = ({ user, onCancel }) => {
  const [fields, setFields] = useState({
    name: '', phoneNumber: '', roadAddress: '', detailAddress: '', gender: '', birth: '',
  })
  const [success] = useState(false)
  const set = (k) => (e) => setFields((p) => ({ ...p, [k]: e.target.value }))

  const { open: openPostcode } = useDaumPostcode((roadAddress) => {
    setFields((p) => ({ ...p, roadAddress, detailAddress: '' }))
  })

  useEffect(() => {
    if (user) setFields({
      name:          user.name        ?? '',
      phoneNumber:   user.phoneNumber ?? '',
      roadAddress:   user.address     ?? '',
      detailAddress: '',
      gender:        user.gender      ?? '',
      birth:         user.birth       ?? '',
    })
  }, [user])

  const { mutate, isPending, error } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      window.location.reload()
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!fields.name.trim()) { toast.error('이름은 필수입니다.'); return }
    const address = [fields.roadAddress, fields.detailAddress].filter(Boolean).join(' ')
    mutate({ ...fields, address })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-medium text-slate-900 mb-6">정보 수정</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">이메일 (변경 불가)</label>
          <input
            type="email" value={user.email} disabled
            className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">이름 *</label>
          <input
            type="text" value={fields.name} onChange={set('name')} required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">성별</label>
          <select
            value={fields.gender} onChange={set('gender')}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white"
          >
            <option value="">선택하세요</option>
            <option value="남">남</option>
            <option value="여">여</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">전화번호</label>
          <input
            type="tel" value={fields.phoneNumber} onChange={set('phoneNumber')}
            placeholder="010-1234-5678"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">생년월일</label>
          <DateInput
            value={fields.birth}
            onChange={(v) => setFields((p) => ({ ...p, birth: v }))}
            placeholder="생년월일 선택"
            maxDate={new Date()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">주소</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text" value={fields.roadAddress} readOnly placeholder="도로명 주소 검색"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 outline-none cursor-default"
            />
            <button
              type="button" onClick={openPostcode}
              className="px-4 py-3 border-2 border-slate-300 rounded-lg hover:border-slate-900 transition font-medium whitespace-nowrap"
            >
              주소 검색
            </button>
          </div>
          <input
            type="text" value={fields.detailAddress} onChange={set('detailAddress')}
            placeholder="상세주소 (동/호수 등)"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition"
          />
        </div>

        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-4 py-2">
            저장되었습니다.
          </p>
        )}
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-4 py-2">
            {getErrorMessage(error, '저장 중 오류가 발생했습니다.')}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit" disabled={isPending}
            className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 transition font-medium"
          >
            {isPending ? '저장 중...' : '저장하기'}
          </button>
          <button
            type="button" onClick={onCancel}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── 비밀번호 강도 정규식 (ResetPasswordPage와 동일 기준) ──────────
const PW_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
  </svg>
)

// ─── 비밀번호 변경 탭 ────────────────────────────────
const PasswordTab = ({ onCancel }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPws, setShowPws] = useState({ currentPassword: false, newPassword: false, newPasswordConfirm: false })
  const toggleShow = (id) => setShowPws(prev => ({ ...prev, [id]: !prev[id] }))
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleBlur = (id) => (e) => {
    const value = e.target.value
    let error = ''
    if (id === 'newPassword') {
      if (!value) error = '새 비밀번호를 입력해주세요.'
      else if (!PW_REGEX.test(value)) error = '8자 이상의 영문, 숫자, 특수문자를 각각 1자 이상 포함해야 합니다.'
    } else if (id === 'newPasswordConfirm') {
      if (!value) error = '비밀번호 확인을 입력해주세요.'
      else if (value !== form.newPassword) error = '비밀번호가 일치하지 않습니다.'
    }
    setFieldErrors((prev) => ({ ...prev, [id]: error || undefined }))
  }

  const { mutate, isPending, error } = useMutation({
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
      toast.error('새 비밀번호가 일치하지 않습니다.')
      return
    }
    if (!PW_REGEX.test(form.newPassword)) {
      toast.error('비밀번호는 8자 이상의 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.')
      return
    }
    mutate(form)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-medium text-slate-900 mb-6">비밀번호 변경</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {[
          { id: 'currentPassword', label: '현재 비밀번호', hint: '' },
          { id: 'newPassword',     label: '새 비밀번호',   hint: '8자 이상의 영문, 숫자, 특수문자를 각각 1자 이상 포함해야 합니다' },
          { id: 'newPasswordConfirm', label: '새 비밀번호 확인', hint: '' },
        ].map(({ id, label, hint }) => (
          <div key={id}>
            <label className="block text-sm font-medium text-slate-700 mb-2">{label} *</label>
            <div className="relative">
              <input
                type={showPws[id] ? 'text' : 'password'} value={form[id]} onChange={set(id)}
                onBlur={handleBlur(id)}
                required autoComplete={id === 'currentPassword' ? 'current-password' : 'new-password'}
                className="w-full px-4 py-3 pr-11 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              />
              <button type="button" tabIndex={-1} onClick={() => toggleShow(id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPws[id] ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
            {fieldErrors[id] && <p className="mt-1 text-xs text-red-500">{fieldErrors[id]}</p>}
          </div>
        ))}

        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-4 py-2">
            비밀번호가 변경되었습니다.
          </p>
        )}
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-4 py-2">
            {getErrorMessage(error, '비밀번호 변경 중 오류가 발생했습니다.')}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit" disabled={isPending}
            className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 transition font-medium"
          >
            {isPending ? '변경 중...' : '비밀번호 변경'}
          </button>
          <button
            type="button" onClick={onCancel}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── 메인 ────────────────────────────────────────────
const MyPage = () => {
  const [tab, setTab] = useState('info')

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['mypage', 'info'],
    queryFn: getMyInfo,
  })

  if (isLoading) return (
    <div className="pt-page px-6">
      <div className="max-w-4xl mx-auto space-y-4 py-16">
        <div className="skeleton-shimmer h-16 w-full rounded-lg" />
        <div className="skeleton-shimmer h-64 w-full rounded-lg" />
      </div>
    </div>
  )
  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-sm text-red-600">내 정보를 불러올 수 없습니다.</p>
    </div>
  )

  const approval = APPROVAL[user?.approvalStatus] ?? { text: user?.approvalStatus, cls: 'bg-gray-500/20 text-gray-300' }
  const isOAuth = user?.isOAuthUser === true

  return (
    <>
      {/* Hero */}
      <section className="pt-page pb-16 text-white px-6 relative bg-slate-900">
        <div className="absolute inset-0 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight">
                안녕하세요, {user?.name}님
              </h1>
              <p className="text-slate-300 mt-2">회원님의 정보를 관리할 수 있습니다</p>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${approval.cls}`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{approval.text}</span>
          </div>
        </div>
      </section>

      {/* 반려 사유 */}
      {user?.approvalStatus === 'REJECTED' && user?.rejectionReason && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-sm font-medium text-red-700 mb-1">가입 반려 안내</p>
            <p className="text-sm text-red-600">{user.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <section className="bg-white border-b border-slate-200 px-6">
        <div className="max-w-6xl mx-auto">
          <nav className="flex gap-1">
            <TabBtn id="info"     label="내 정보"       active={tab === 'info'}     onClick={setTab} />
            <TabBtn id="edit"     label="정보 수정"     active={tab === 'edit'}     onClick={setTab} />
            {!isOAuth && (
              <TabBtn id="password" label="비밀번호 변경" active={tab === 'password'} onClick={setTab} />
            )}
          </nav>
        </div>
      </section>

      {/* 탭 컨텐츠 */}
      <section className="py-16 bg-slate-50 px-6 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {tab === 'info'     && <InfoTab     user={user} onEdit={() => setTab('edit')} />}
          {tab === 'edit'     && <EditTab     user={user} onCancel={() => setTab('info')} />}
          {tab === 'password' && !isOAuth && <PasswordTab onCancel={() => setTab('info')} />}
        </div>
      </section>
    </>
  )
}

export default MyPage
