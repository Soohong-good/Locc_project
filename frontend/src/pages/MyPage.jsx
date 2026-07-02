import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowRight, Eye, EyeSlash, CheckCircle, Clock, WarningCircle,
} from '@phosphor-icons/react'
import { getMyInfo, updateProfile, changePassword } from '@/api/mypage'
import { getMyApplications, cancelApplication } from '@/api/training'
import useDaumPostcode from '@/hooks/useDaumPostcode'
import { getErrorMessage } from '@/lib/apiError'
import { DateInput } from '@/components/ui/DateInput'
import { SkeletonRow } from '@/components/ui/SkeletonCard'
import toast from '@/utils/toast'

// ─── 인풋 공통 스타일 ────────────────────────────────
const INPUT_CLS = 'w-full px-4 py-3 border border-[#E5E5E5] bg-white text-[#2C2C2C] focus:border-[#171717] outline-none transition'
const LABEL_CLS = 'block text-xs font-mono uppercase tracking-widest text-[#737373] mb-2'
const BTN_PRIMARY = 'text-xs font-bold tracking-[0.1em] uppercase bg-[#171717] text-[#FAF9F6] px-6 py-3 hover:opacity-80 transition disabled:opacity-40'
const BTN_GHOST = 'text-xs font-bold tracking-[0.1em] uppercase border border-[#E5E5E5] text-[#737373] px-6 py-3 hover:border-[#171717] hover:text-[#171717] transition-colors'

// ─── 승인 상태 ──────────────────────────────────────
const APPROVAL = {
  APPROVED: { text: '승인 완료', icon: CheckCircle, cls: 'border-emerald-400/50 text-emerald-300' },
  PENDING:  { text: '승인 대기', icon: Clock,       cls: 'border-amber-400/50 text-amber-300' },
  REJECTED: { text: '반려',     icon: WarningCircle, cls: 'border-red-400/50 text-red-300' },
}

// ─── 사이드바 탭 네비게이션 ──────────────────────────
const NAV_ITEMS = [
  { id: 'info',         label: '내 정보' },
  { id: 'password',     label: '비밀번호 변경' },
  { id: 'applications', label: '내 신청내역' },
]

// ─── 표시값 매핑 ─────────────────────────────────────
const GENDER_OPTIONS = [
  { value: 'MALE',   label: '남자' },
  { value: 'FEMALE', label: '여자' },
]
const GENDER_LABEL = { MALE: '남자', FEMALE: '여자' }
const USER_TYPE_LABEL = { REGISTERED: '등록교인', UNREGISTERED: '미등록교인' }

// ─── 소셜 로그인 배지 ────────────────────────────────
const PROVIDER_BADGE = {
  KAKAO: {
    label: '카카오',
    cls: 'border-[#FEE500]/60 text-[#FEE500]',
    path: 'M12 3C6.48 3 2 6.58 2 11c0 2.78 1.83 5.23 4.58 6.81-.2.73-.75 2.81-.86 3.26-.14.57.21.56.44.41.18-.13 2.96-2.02 3.43-2.34.47.07.95.11 1.44.11 5.52 0 10-3.58 10-8S17.52 3 12 3z',
  },
  NAVER: {
    label: '네이버',
    cls: 'border-[#03C75A]/60 text-[#03C75A]',
    path: 'M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z',
  },
}

const ProviderBadge = ({ provider }) => {
  const badge = PROVIDER_BADGE[provider]
  if (!badge) return null
  return (
    <span className={`inline-flex items-center gap-1.5 border px-3 py-1 text-xs font-mono uppercase tracking-widest ${badge.cls}`}>
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d={badge.path} /></svg>
      {badge.label}
    </span>
  )
}

const SideNavItem = ({ id, label, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full py-5 md:py-6 border-b border-white/20 flex justify-between items-center group text-left transition-colors ${
      active ? 'text-[#FAF9F6] font-bold' : 'text-[#737373] font-medium hover:text-[#FAF9F6]'
    }`}
  >
    <span className="text-base md:text-lg">{label}</span>
    <ArrowRight
      size={18}
      weight="bold"
      className={`shrink-0 transition-all ${
        active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
      }`}
    />
  </button>
)

// ─── 내 정보 탭 (인라인 수정) ─────────────────────────
const InfoRow = ({
  label, field, value, displayValue, type, editable, editing,
  draft, setDraft, onStartEdit, onSave, onCancel, saving, openPostcode,
}) => {
  const empty = !value

  return (
    <div className="py-6 first:pt-0 hover:bg-[#F4F2EA] transition-colors -mx-4 px-4 sm:-mx-8 sm:px-8 group">
      <span className="block text-xs font-mono text-[#737373] uppercase tracking-widest mb-2 group-hover:text-[#171717] transition-colors">
        {label}
      </span>

      {editing ? (
        <div className="space-y-3 max-w-md">
          {type === 'select' && (
            <select
              value={draft[field] ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
              className={INPUT_CLS}
              autoFocus
            >
              <option value="">선택하세요</option>
              {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
          {type === 'text' && (
            <input
              type={field === 'phoneNumber' ? 'tel' : 'text'}
              value={draft[field] ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
              placeholder={field === 'phoneNumber' ? '010-1234-5678' : ''}
              className={INPUT_CLS}
              autoFocus
            />
          )}
          {type === 'date' && (
            <DateInput
              value={draft.birth ?? ''}
              onChange={(v) => setDraft((d) => ({ ...d, birth: v }))}
              placeholder="생년월일 선택"
              maxDate={new Date()}
              className={INPUT_CLS}
            />
          )}
          {type === 'address' && (
            <>
              <div className="flex gap-2">
                <input
                  type="text" value={draft.roadAddress ?? ''} readOnly placeholder="도로명 주소 검색"
                  className={`${INPUT_CLS} flex-1 bg-[#F4F2EA] cursor-default`}
                />
                <button type="button" onClick={openPostcode} className={`${BTN_GHOST} whitespace-nowrap shrink-0 !px-4 !py-2`}>
                  주소 검색
                </button>
              </div>
              <input
                type="text" value={draft.detailAddress ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, detailAddress: e.target.value }))}
                placeholder="상세주소 (동/호수 등)"
                className={INPUT_CLS}
              />
            </>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={onSave} disabled={saving} className={`${BTN_PRIMARY} !px-4 !py-2`}>
              {saving ? '저장 중...' : '저장'}
            </button>
            <button onClick={onCancel} className={`${BTN_GHOST} !px-4 !py-2`}>
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          {empty ? (
            <span className="text-lg sm:text-xl italic text-[#737373]">미입력</span>
          ) : (
            <span className="block text-lg sm:text-2xl text-[#2C2C2C] break-keep">{displayValue ?? value}</span>
          )}
          {editable && (
            <button onClick={onStartEdit} className={`${BTN_GHOST} shrink-0 !px-4 !py-2`}>
              {empty ? '입력하기' : '수정하기'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const InfoTab = ({ user }) => {
  const queryClient = useQueryClient()
  const [editingField, setEditingField] = useState(null)
  const [draft, setDraft] = useState({})

  const { open: openPostcode } = useDaumPostcode((roadAddress) => {
    setDraft((d) => ({ ...d, roadAddress, detailAddress: '' }))
  })

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mypage', 'info'] })
      setEditingField(null)
      setDraft({})
    },
    onError: (e) => toast.error(getErrorMessage(e, '저장 중 오류가 발생했습니다.')),
  })

  const startEdit = (field) => {
    if (field === 'address') {
      setDraft({ roadAddress: user.address ?? '', detailAddress: '' })
    } else {
      setDraft({ [field]: user[field] ?? '' })
    }
    setEditingField(field)
  }

  const cancelEdit = () => { setEditingField(null); setDraft({}) }

  const saveEdit = (field) => {
    if (field === 'name' && !draft.name?.trim()) { toast.error('이름은 필수입니다.'); return }
    const payload = { name: field === 'name' ? draft.name : user.name }
    if (field === 'address') {
      payload.address = [draft.roadAddress, draft.detailAddress].filter(Boolean).join(' ')
    } else {
      payload[field] = draft[field]
    }
    mutation.mutate(payload)
  }

  const rows = [
    { label: 'Email', value: user.email },
    { label: '이름',     field: 'name',        value: user.name,        type: 'text',    editable: true },
    { label: '성별',     field: 'gender',      value: user.gender,      displayValue: GENDER_LABEL[user.gender] ?? user.gender, type: 'select', editable: true },
    { label: '전화번호', field: 'phoneNumber', value: user.phoneNumber, type: 'text',    editable: true },
    { label: '생년월일', field: 'birth',       value: user.birth,       type: 'date',    editable: true },
    { label: '주소',     field: 'address',     value: user.address,     type: 'address', editable: true },
    { label: '교인 구분', value: USER_TYPE_LABEL[user.userType] ?? user.userType ?? '-' },
    {
      label: '가입일',
      value: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : '-',
    },
    ...(user.registrationPath ? [{ label: '가입 경로', value: user.registrationPath }] : []),
  ]

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-10 sm:mb-16 pb-6 sm:pb-8 border-b border-[#E5E5E5] text-[#171717] break-keep">
        내 정보
      </h2>
      <div className="flex flex-col divide-y divide-[#E5E5E5]">
        {rows.map((row) => (
          <InfoRow
            key={row.label}
            label={row.label}
            field={row.field}
            value={row.value}
            displayValue={row.displayValue}
            type={row.type}
            editable={row.editable}
            editing={editingField === row.field}
            draft={draft}
            setDraft={setDraft}
            onStartEdit={() => startEdit(row.field)}
            onSave={() => saveEdit(row.field)}
            onCancel={cancelEdit}
            saving={mutation.isPending}
            openPostcode={openPostcode}
          />
        ))}
      </div>
    </div>
  )
}

// ─── 내 신청내역 탭 ──────────────────────────────────
const fmtDateTime = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const ApplicationsTab = () => {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

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
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-10 sm:mb-16 pb-6 sm:pb-8 border-b border-[#E5E5E5] text-[#171717] break-keep">
        내 신청내역
      </h2>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {!isLoading && applications.length === 0 && (
        <div className="text-center py-16 border border-[#E5E5E5]">
          <p className="text-[#737373] mb-6 break-keep">신청한 훈련이 없습니다.</p>
          <button onClick={() => navigate('/training')} className={BTN_PRIMARY}>
            훈련 목록 보기
          </button>
        </div>
      )}

      {!isLoading && applications.length > 0 && (
        <div className="flex flex-col divide-y divide-[#E5E5E5]">
          {applications.map((app) => (
            <div key={app.id} className="py-8 first:pt-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div>
                  <h3
                    className="text-lg font-bold text-[#171717] mb-2 hover:opacity-70 cursor-pointer transition break-keep"
                    onClick={() => navigate(`/training/${app.trainingId}`)}
                  >
                    {app.trainingTitle}
                  </h3>
                  <p className="text-sm text-[#737373] font-mono">신청일: {fmtDateTime(app.appliedAt)}</p>
                </div>
                <button
                  onClick={() => handleCancel(app.id)}
                  disabled={cancelMutation.isPending}
                  className="text-xs font-bold tracking-[0.1em] uppercase border border-red-300 text-red-500 px-4 py-2.5 hover:border-red-500 transition-colors disabled:opacity-50 shrink-0"
                >
                  신청 취소
                </button>
              </div>
              <div className="pt-4 border-t border-[#E5E5E5] text-sm text-[#737373] space-y-1">
                <p>연락처: {app.phone}</p>
                <p>
                  훈련비:{' '}
                  {app.trainingFee > 0
                    ? <span className="font-medium text-[#2C2C2C]">{app.trainingFee.toLocaleString('ko-KR')}원</span>
                    : <span className="text-emerald-600 font-medium">무료</span>
                  }
                </p>
                {app.paymentMethod === 'BANK' && (
                  <div className="mt-2 border border-[#E5E5E5] bg-[#F4F2EA] px-4 py-3">
                    <p className="text-xs font-mono uppercase tracking-widest text-[#737373] mb-1">입금 계좌 안내</p>
                    <p className="text-sm text-[#2C2C2C] font-medium">농협 301-0273-8865-01</p>
                    <p className="text-xs text-[#737373] mt-0.5">예금주: 그리스도 사랑교회</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 비밀번호 강도 정규식 (ResetPasswordPage와 동일 기준) ──────────
const PW_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/

// ─── 비밀번호 변경 탭 ────────────────────────────────
const PasswordTab = ({ onCancel, isOAuth }) => {
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
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-10 sm:mb-16 pb-6 sm:pb-8 border-b border-[#E5E5E5] text-[#171717] break-keep">
        비밀번호 변경
      </h2>

      {isOAuth && (
        <p className="mb-6 text-sm text-[#737373] border border-[#E5E5E5] bg-[#F4F2EA] px-4 py-3 break-keep">
          소셜 로그인 전용 계정은 비밀번호를 변경할 수 없습니다.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        {[
          { id: 'currentPassword', label: '현재 비밀번호', hint: '' },
          { id: 'newPassword',     label: '새 비밀번호',   hint: '8자 이상의 영문, 숫자, 특수문자를 각각 1자 이상 포함해야 합니다' },
          { id: 'newPasswordConfirm', label: '새 비밀번호 확인', hint: '' },
        ].map(({ id, label, hint }) => (
          <div key={id}>
            <label className={LABEL_CLS}>{label} *</label>
            <div className="relative">
              <input
                type={showPws[id] ? 'text' : 'password'} value={form[id]} onChange={set(id)}
                onBlur={handleBlur(id)}
                required disabled={isOAuth} autoComplete={id === 'currentPassword' ? 'current-password' : 'new-password'}
                className={`${INPUT_CLS} pr-11 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#F4F2EA]`}
              />
              <button type="button" tabIndex={-1} disabled={isOAuth} onClick={() => toggleShow(id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717] disabled:opacity-50 disabled:cursor-not-allowed">
                {showPws[id] ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {hint && <p className="mt-1 text-xs text-[#737373] break-keep">{hint}</p>}
            {fieldErrors[id] && <p className="mt-1 text-xs text-red-500 break-keep">{fieldErrors[id]}</p>}
          </div>
        ))}

        {success && (
          <p className="text-sm text-emerald-700 border border-emerald-300 bg-emerald-50 px-4 py-3">
            비밀번호가 변경되었습니다.
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 border border-red-300 bg-red-50 px-4 py-3">
            {getErrorMessage(error, '비밀번호 변경 중 오류가 발생했습니다.')}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isPending || isOAuth} className={`${BTN_PRIMARY} flex-1`}>
            {isPending ? '변경 중...' : '비밀번호 변경'}
          </button>
          <button type="button" onClick={onCancel} className={BTN_GHOST}>
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
    <div className="pt-page px-6 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto space-y-4 py-16">
        <div className="skeleton-shimmer h-16 w-full" />
        <div className="skeleton-shimmer h-64 w-full" />
      </div>
    </div>
  )
  if (error) return (
    <div className="pt-page px-6 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-2xl mx-auto py-16">
        <p className="text-sm text-red-600">내 정보를 불러올 수 없습니다.</p>
      </div>
    </div>
  )

  const approval = APPROVAL[user?.approvalStatus] ?? { text: user?.approvalStatus, icon: WarningCircle, cls: 'border-[#737373]/50 text-[#737373]' }
  const ApprovalIcon = approval.icon
  const isOAuth = user?.isOAuthUser === true

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAF9F6] pt-page">
      <main className="flex-1 max-w-[1600px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 md:divide-x md:divide-[#E5E5E5]">

        {/* 왼쪽 사이드바 */}
        <div className="md:col-span-4 bg-[#171717] text-[#FAF9F6] flex flex-col">
          <div className="p-8 sm:p-12 xl:p-16 flex-1 flex flex-col">
            <div className="mb-10 md:mb-20">
              <div className="flex flex-wrap items-center gap-2 mb-6 md:mb-8">
                <span className={`inline-flex items-center gap-1.5 border px-3 py-1 text-xs font-mono uppercase tracking-widest ${approval.cls}`}>
                  <ApprovalIcon size={14} weight="bold" />
                  {approval.text}
                </span>
                {user?.connectedProviders?.map((provider) => (
                  <ProviderBadge key={provider} provider={provider} />
                ))}
              </div>
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight mb-4 leading-tight break-keep">
                안녕하세요,<br />{user?.name}님
              </h1>
              <p className="text-[#737373] font-light break-keep">회원님의 정보를 관리할 수 있습니다</p>

              {user?.approvalStatus === 'REJECTED' && user?.rejectionReason && (
                <div className="mt-6 border border-red-400/50 bg-red-500/10 px-4 py-3">
                  <p className="text-xs font-mono uppercase tracking-widest text-red-300 mb-1">가입 반려 안내</p>
                  <p className="text-sm text-red-200 break-keep">{user.rejectionReason}</p>
                </div>
              )}
            </div>

            <nav className="flex flex-col border-t border-white/20">
              {NAV_ITEMS.map((item) => (
                <SideNavItem
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  active={tab === item.id}
                  onClick={setTab}
                />
              ))}
            </nav>
          </div>
        </div>

        {/* 오른쪽 콘텐츠 */}
        <div className="md:col-span-8 bg-[#FAF9F6] p-8 sm:p-12 xl:p-24 flex flex-col">
          {tab === 'info'         && <InfoTab user={user} />}
          {tab === 'password'     && <PasswordTab isOAuth={isOAuth} onCancel={() => setTab('info')} />}
          {tab === 'applications' && <ApplicationsTab />}
        </div>
      </main>
    </div>
  )
}

export default MyPage
