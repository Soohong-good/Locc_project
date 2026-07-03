/**
 * 기능 테스트 대시보드 — 개발 전용
 * 접근: /test
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'

// ── API 체크 목록 (GET만 — 자동 확인 가능) ─────────────────────────────
const API_GROUPS = [
  {
    group: '공지사항',
    color: 'border-blue-400',
    checks: [
      { label: '목록',             url: '/api/notices?page=0&size=5' },
      { label: '고정 공지',        url: '/api/notices/pinned' },
    ],
  },
  {
    group: '설교',
    color: 'border-indigo-400',
    checks: [
      { label: '목록',             url: '/api/sermons?page=0&size=5' },
      { label: '최신',             url: '/api/sermons/latest' },
      { label: '주일오전 (1부)',   url: '/api/sermons/sunday-morning/1' },
      { label: '주일오후',         url: '/api/sermons/sunday-afternoon' },
      { label: '수요예배',         url: '/api/sermons/weekday/wednesday' },
      { label: '훈련메시지',       url: '/api/sermons/training-message' },
    ],
  },
  {
    group: '주보',
    color: 'border-cyan-400',
    checks: [
      { label: '목록',             url: '/api/bulletin?page=0&size=5' },
    ],
  },
  {
    group: '팝업',
    color: 'border-violet-400',
    checks: [
      { label: '활성 팝업',        url: '/api/popups/active' },
    ],
  },
  {
    group: '섬기는 분들',
    color: 'border-slate-400',
    checks: [
      { label: '전체',             url: '/api/staff' },
      { label: '담임목사',         url: '/api/staff/senior-pastor' },
      { label: '설교자',           url: '/api/staff/preachers' },
      { label: '목사 (MINISTER)',  url: '/api/staff/category/MINISTER' },
      { label: '직원 (EMPLOYEE)',  url: '/api/staff/category/EMPLOYEE' },
    ],
  },
  {
    group: '부서',
    color: 'border-green-400',
    checks: [
      { label: '초등부 정보',      url: '/api/department/children' },
      { label: '초등부 게시판',    url: '/api/department/children/board' },
      { label: '중고등부 정보',    url: '/api/department/youth' },
      { label: '대청부 정보',      url: '/api/department/young-adults' },
    ],
  },
  {
    group: '갤러리',
    color: 'border-teal-400',
    checks: [
      { label: '최근 갤러리',      url: '/api/galleries/recent' },
      { label: '초등부 목록',      url: '/api/departments/children/gallery?page=0&size=5' },
      { label: '초등부 그룹',      url: '/api/departments/children/gallery/groups' },
      { label: '초등부 타이틀',    url: '/api/departments/children/gallery/titles' },
    ],
  },
  {
    group: '신청양식',
    color: 'border-orange-400',
    checks: [
      { label: '카테고리 (공개)',  url: '/api/facility-applications/categories' },
      { label: '내 신청 목록',     url: '/api/facility-applications/my' },
    ],
  },
  {
    group: '훈련',
    color: 'border-amber-400',
    checks: [
      { label: '훈련 목록',        url: '/api/trainings?page=0&size=5' },
      { label: '모집중 훈련',      url: '/api/trainings/open' },
      { label: '내 훈련 신청',     url: '/api/applications/my' },
    ],
  },
  {
    group: '신년예배',
    color: 'border-rose-400',
    checks: [
      { label: '신년예배 정보',    url: '/api/newyear' },
    ],
  },
  {
    group: '인증 / 유저',
    color: 'border-purple-400',
    checks: [
      { label: '현재 로그인 유저', url: '/api/auth/me' },
      { label: '마이페이지 정보',  url: '/api/mypage/info' },
      { label: '이메일 쿨다운',    url: '/api/auth/email/cooldown?email=test@test.com' },
    ],
  },
  {
    group: '관리자 — 대시보드',
    color: 'border-red-500',
    admin: true,
    checks: [
      { label: '대시보드',         url: '/api/admin/dashboard' },
      { label: '최근 갤러리',      url: '/api/admin/dashboard/recent-gallery' },
    ],
  },
  {
    group: '관리자 — 공지/설교',
    color: 'border-red-400',
    admin: true,
    checks: [
      { label: '공지 목록',        url: '/api/admin/notices?page=0&size=5' },
      { label: '설교 목록',        url: '/api/admin/sermons?page=0&size=5' },
    ],
  },
  {
    group: '관리자 — 팝업',
    color: 'border-pink-400',
    admin: true,
    checks: [
      { label: '팝업 목록',        url: '/api/admin/popups' },
    ],
  },
  {
    group: '관리자 — 신청',
    color: 'border-orange-500',
    admin: true,
    checks: [
      { label: '신청 목록',        url: '/api/admin/facility-applications' },
      { label: '카테고리',         url: '/api/admin/facility-applications/categories' },
    ],
  },
  {
    group: '관리자 — 문의',
    color: 'border-yellow-500',
    admin: true,
    checks: [
      { label: '문의 목록',        url: '/api/admin/help-requests' },
    ],
  },
  {
    group: '관리자 — 유저',
    color: 'border-emerald-500',
    admin: true,
    checks: [
      { label: '유저 목록',        url: '/api/admin/users' },
      { label: '미승인 목록',      url: '/api/admin/users/pending' },
      { label: '미승인 수',        url: '/api/admin/users/pending/count' },
    ],
  },
  {
    group: '관리자 — YouTube',
    color: 'border-rose-500',
    admin: true,
    checks: [
      { label: '부서 YouTube',     url: '/api/admin/youtube/departments' },
      { label: '예배 YouTube',     url: '/api/admin/youtube/worship' },
      { label: '설교 플레이리스트',url: '/api/admin/youtube/sermon-playlists' },
    ],
  },
]

// ── CRUD 작업 목록 (POST/PUT/PATCH/DELETE — 페이지로 이동) ───────────
const CRUD_GROUPS = [
  {
    group: '공지사항',
    color: 'bg-blue-600',
    actions: [
      { label: '작성',        path: '/notices/new',              method: 'POST' },
      { label: '목록 (수정/삭제)', path: '/notices',             method: 'PUT/DELETE' },
      { label: '관리자 목록', path: '/admin/notices',            method: 'ADMIN' },
    ],
  },
  {
    group: '설교',
    color: 'bg-indigo-600',
    actions: [
      { label: '등록',        path: '/admin/sermons/new',        method: 'POST' },
      { label: '관리자 목록', path: '/admin/sermons',            method: 'PUT/DELETE' },
    ],
  },
  {
    group: '주보',
    color: 'bg-cyan-600',
    actions: [
      { label: '관리 (업로드/삭제)', path: '/admin/bulletins',  method: 'POST/DELETE' },
    ],
  },
  {
    group: '팝업',
    color: 'bg-violet-600',
    actions: [
      { label: '관리 (등록/수정/삭제/토글, 모달)', path: '/admin/popups',  method: 'POST/PUT/DELETE/PATCH' },
    ],
  },
  {
    group: '섬기는 분들',
    color: 'bg-slate-600',
    actions: [
      { label: '관리 (추가/수정/삭제/이미지)', path: '/church/staff', method: 'POST/PUT/DELETE' },
    ],
  },
  {
    group: '부서 게시판',
    color: 'bg-green-600',
    actions: [
      { label: '초등부 게시판 (작성/수정/삭제/고정)', path: '/department/children', method: 'POST/PUT/DELETE/PATCH' },
    ],
  },
  {
    group: '갤러리',
    color: 'bg-teal-600',
    actions: [
      { label: '관리 (업로드/삭제)', path: '/admin/gallery',    method: 'POST/DELETE' },
    ],
  },
  {
    group: '신청양식',
    color: 'bg-orange-600',
    actions: [
      { label: '신청서 작성', path: '/applications/new',        method: 'POST' },
      { label: '내 신청 목록 (취소)', path: '/applications',    method: 'DELETE' },
      { label: '관리자 목록', path: '/admin/applications',      method: 'PATCH' },
      { label: '카테고리 관리', path: '/admin/applications/categories', method: 'POST/PUT/PATCH' },
    ],
  },
  {
    group: '훈련',
    color: 'bg-amber-600',
    actions: [
      { label: '훈련 목록',   path: '/training',                method: 'GET' },
    ],
  },
  {
    group: '유저 관리',
    color: 'bg-purple-600',
    actions: [
      { label: '유저 관리 (승인/비활성/권한)', path: '/admin/users', method: 'POST/DELETE' },
    ],
  },
  {
    group: '문의',
    color: 'bg-yellow-600',
    actions: [
      { label: '문의 관리 (상태/메모/삭제)', path: '/admin/help-requests', method: 'PATCH/DELETE' },
    ],
  },
  {
    group: 'YouTube',
    color: 'bg-rose-600',
    actions: [
      { label: 'YouTube 관리', path: '/admin/youtube',          method: 'POST' },
    ],
  },
  {
    group: '마이페이지',
    color: 'bg-fuchsia-600',
    actions: [
      { label: '프로필/비밀번호 수정', path: '/mypage',         method: 'PUT' },
    ],
  },
]

// ── 상태 배지 ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  if (status === 'idle')    return <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-400">대기</span>
  if (status === 'loading') return <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-500 animate-pulse">확인중</span>
  if (status === 'ok')      return <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">✓ 정상</span>
  return                           <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600 font-medium">✗ 오류</span>
}

const METHOD_COLOR = {
  'POST':             'bg-green-100 text-green-700',
  'PUT':              'bg-blue-100 text-blue-700',
  'DELETE':           'bg-red-100 text-red-700',
  'PATCH':            'bg-yellow-100 text-yellow-700',
  'PUT/DELETE':       'bg-purple-100 text-purple-700',
  'POST/DELETE':      'bg-orange-100 text-orange-700',
  'POST/PUT/DELETE':  'bg-pink-100 text-pink-700',
  'PATCH/DELETE':     'bg-rose-100 text-rose-700',
  'PUT/DELETE/PATCH': 'bg-violet-100 text-violet-700',
  'POST/PUT/PATCH':   'bg-teal-100 text-teal-700',
  'POST/PATCH':       'bg-cyan-100 text-cyan-700',
  'ADMIN':            'bg-red-100 text-red-700',
  'GET':              'bg-slate-100 text-slate-600',
}

// ── 메인 ──────────────────────────────────────────────────────────────
export default function TestDashboard() {
  const user        = useAuthStore(s => s.user)
  const isAdminOrOp = useAuthStore(s => s.isAdminOrOperator)

  const allChecks = API_GROUPS.flatMap(g => g.checks)
  const [results, setResults]   = useState(Object.fromEntries(allChecks.map(c => [c.url, 'idle'])))
  const [checking, setChecking] = useState(null) // null | 'all' | group명

  const checkOne = async (url) => {
    setResults(prev => ({ ...prev, [url]: 'loading' }))
    try {
      const res = await fetch(url, { credentials: 'include' })
      // 401/403도 서버 응답 = 엔드포인트 존재 → OK
      setResults(prev => ({ ...prev, [url]: (res.ok || res.status === 401 || res.status === 403) ? 'ok' : 'error' }))
    } catch {
      setResults(prev => ({ ...prev, [url]: 'error' }))
    }
  }

  const checkGroup = async (group) => {
    setChecking(group.group)
    await Promise.all(group.checks.map(c => checkOne(c.url)))
    setChecking(null)
  }

  const checkAll = async () => {
    setChecking('all')
    await Promise.all(allChecks.map(c => checkOne(c.url)))
    setChecking(null)
  }

  const okCount  = allChecks.filter(c => results[c.url] === 'ok').length
  const errCount = allChecks.filter(c => results[c.url] === 'error').length
  const total    = allChecks.length

  return (
    <div className="min-h-screen bg-slate-50">

      {/* 헤더 */}
      <div className="bg-slate-900 text-white px-6 py-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold">🧪 기능 테스트 대시보드</h1>
            <p className="text-slate-400 text-xs mt-0.5">전체 GET API 자동 확인 · CRUD 페이지 바로가기</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {user ? (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isAdminOrOp() ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                {user.name} · {user.role}
              </span>
            ) : (
              <Link to="/login" className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded transition">로그인</Link>
            )}
            <Link to="/" className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded transition">← 메인</Link>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-10">

        {/* ── 요약 + 전체 확인 ── */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-3">
            {[
              { label: 'GET API 전체', value: total,    bg: 'bg-slate-800 text-white' },
              { label: '✓ 정상',       value: okCount,  bg: 'bg-green-600 text-white' },
              { label: '✗ 오류',       value: errCount, bg: errCount > 0 ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-500' },
            ].map(({ label, value, bg }) => (
              <div key={label} className={`${bg} rounded-lg px-5 py-3 text-center min-w-[80px]`}>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs opacity-80 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <button
            onClick={checkAll}
            disabled={checking === 'all'}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {checking === 'all' ? '🔄 전체 확인 중...' : '🔄 전체 GET API 확인'}
          </button>
        </div>

        {/* ── GET API 그룹별 확인 ── */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 mb-4">🔌 GET API 자동 확인 ({total}개)</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {API_GROUPS.map((group) => {
              const gOk  = group.checks.filter(c => results[c.url] === 'ok').length
              const gErr = group.checks.filter(c => results[c.url] === 'error').length
              return (
                <div key={group.group} className={`bg-white rounded-lg border-l-4 ${group.color} border border-slate-100 p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{group.group}</span>
                      {group.admin && <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-500 rounded">관리자</span>}
                      {gOk > 0 && <span className="text-xs text-green-600 font-medium">{gOk}✓</span>}
                      {gErr > 0 && <span className="text-xs text-red-500 font-medium">{gErr}✗</span>}
                    </div>
                    <button
                      onClick={() => checkGroup(group)}
                      disabled={checking === group.group}
                      className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded transition disabled:opacity-50"
                    >
                      {checking === group.group ? '...' : '확인'}
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {group.checks.map(c => (
                      <div key={c.url} className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-sm text-slate-600">{c.label}</span>
                          <p className="text-xs text-slate-300 font-mono truncate">{c.url}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <StatusBadge status={results[c.url]} />
                          <button onClick={() => checkOne(c.url)} className="text-slate-300 hover:text-slate-600 transition">↻</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── CRUD 기능 테스트 ── */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 mb-4">✏️ CRUD 기능 테스트 — 페이지 바로가기 (새 탭)</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {CRUD_GROUPS.map(({ group, color, actions }) => (
              <div key={group} className="bg-white rounded-lg border border-slate-100 overflow-hidden">
                <div className={`${color} text-white px-4 py-2.5 text-sm font-semibold`}>{group}</div>
                <div className="divide-y divide-slate-50">
                  {actions.map(({ label, path, method }) => (
                    <Link
                      key={path}
                      to={path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition group"
                    >
                      <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-mono font-medium ${METHOD_COLOR[method] || 'bg-slate-100 text-slate-600'}`}>
                          {method}
                        </span>
                        <span className="text-xs text-slate-300 group-hover:text-slate-400">↗</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
