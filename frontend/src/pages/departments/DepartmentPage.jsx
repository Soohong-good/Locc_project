import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from '@/utils/toast'
import {
  getDepartment,
  getDepartmentBoards,
  createDepartmentBoard,
  deleteDepartmentBoard,
  toggleDepartmentBoardPin,
} from '@/api/departments'
import useAuthStore from '@/stores/authStore'
import Button from '@/components/ui/Button'
import { SkeletonRow } from '@/components/ui/SkeletonCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'

// ── 날짜 포맷 ──────────────────────────────────────────────────────────────
const fmtDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── 탭 버튼 ────────────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={active ? { borderColor: '#0f172a', color: '#0f172a' } : {}}
    className={`py-4 border-b-2 transition font-medium text-sm tracking-wide ${
      active
        ? ''
        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
    }`}
  >
    {children}
  </button>
)

// ── 부서 없음 안내 ────────────────────────────────────────────────────────
const NotFoundView = ({ code }) => (
  <div className="min-h-screen flex items-center justify-center px-6">
    <div className="text-center max-w-md">
      <svg className="w-24 h-24 mx-auto text-slate-300 mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <h1 className="text-3xl font-light text-slate-900 mb-4">부서 준비 중</h1>
      <p className="text-slate-600 mb-8">
        요청하신 <strong>{code}</strong> 부서는 현재 준비 중입니다.
        <br />빠른 시일 내에 정보를 제공하도록 하겠습니다.
      </p>
      <a href="/" className="inline-block px-6 py-3 bg-slate-900 text-white hover:bg-slate-800 transition">
        홈으로 돌아가기
      </a>
    </div>
  </div>
)

// ────────────────────────────────────────────────────────────────────────────
// 소개 탭
// ────────────────────────────────────────────────────────────────────────────
const AboutTab = ({ dept }) => {
  const features = [
    {
      label: '특징 1', value: dept.feature1,
      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    },
    {
      label: '특징 2', value: dept.feature2,
      icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
    },
    {
      label: '특징 3', value: dept.feature3,
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    },
  ].filter((f) => f.value)

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* ── 상단: 소개 텍스트 ── */}
        <div className="mx-auto mb-20">
          <p className="text-xs tracking-[0.2em] uppercase text-slate-400 mb-3">About</p>
          <h2 className="text-3xl font-light text-slate-900 mb-1">부서 소개</h2>
          <div className="w-10 h-0.5 bg-slate-900 mb-6" />
          {dept.description && (
            <p className="text-lg text-slate-600 leading-relaxed">{dept.description}</p>
          )}

          {/* 예배 안내 인라인 */}
          <div className="mt-8 space-y-4 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-3 text-slate-700">
              <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">매주 주일</span>
            </div>
            {dept.worshipTime && (
              <div className="flex items-center gap-3 text-slate-700">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{dept.worshipTime}</span>
                {dept.worshipTimeEn && <span className="text-sm text-slate-400">{dept.worshipTimeEn}</span>}
              </div>
            )}
            {dept.worshipLocation && (
              <div className="flex items-center gap-3 text-slate-700">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{dept.worshipLocation}</span>
                {dept.worshipLocationEn && <span className="text-sm text-slate-400">{dept.worshipLocationEn}</span>}
              </div>
            )}
          </div>
        </div>

        {/* ── 하단: 특징 카드 ── */}
        {features.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.label} className="bg-slate-50 border border-slate-100 p-8 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                     style={{ background: '#0f172a' }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={f.icon} />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-slate-900 mb-2">{f.label}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{f.value}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 게시판 탭
// ────────────────────────────────────────────────────────────────────────────

// 게시판 작성 모달
const BoardWriteModal = ({ deptCode, onClose, onSaved }) => {
  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')
  const [error,   setError]   = useState('')
  const [saving,  setSaving]  = useState(false)

  const handleSave = async () => {
    setError('')
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    setSaving(true)
    try {
      await createDepartmentBoard(deptCode, { title: title.trim(), content: content.trim() })
      onSaved()
    } catch (e) {
      setError(e?.response?.data?.message ?? '등록에 실패했습니다.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <h2 className="text-2xl font-light text-slate-900">새 게시글 작성</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">제목 <span className="text-red-500">*</span></label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">내용</label>
            <textarea
              value={content} onChange={(e) => setContent(e.target.value)}
              rows={8} placeholder="내용을 입력하세요"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none transition-all resize-none"
            />
          </div>
        </div>
        {error && (
          <div className="px-8 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm font-light flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
          <button onClick={onClose} className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium transition">취소</button>
          <button onClick={handleSave} disabled={saving}
            className="px-8 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-medium transition disabled:opacity-60">
            {saving ? '등록 중...' : '등록'}
          </button>
        </div>
      </div>
    </div>
  )
}

// 게시판 상세 모달
const BoardDetailModal = ({ board, deptCode, onClose, onDeleted, isAdmin, userId }) => {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting,    setDeleting]    = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteDepartmentBoard(deptCode, board.id)
      onDeleted()
    } catch {
      toast.error('삭제에 실패했습니다.')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {board.isPinned && (
              <span className="px-2 py-1 bg-slate-900 text-white text-xs font-medium">공지</span>
            )}
            <h2 className="text-xl font-light text-slate-900">{board.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-4 px-8 py-3 bg-slate-50 border-b border-slate-100 text-sm text-slate-500">
          <span>{fmtDate(board.createdAt)}</span>
          <span>·</span>
          <span>조회 {board.viewCount}</span>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-light">
            {board.content || '내용이 없습니다.'}
          </p>
        </div>
        {(isAdmin || board.authorId === userId) && (
          <div className="flex justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
            <button onClick={() => setConfirmOpen(true)}
              className="px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 font-medium transition">
              삭제
            </button>
          </div>
        )}
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setConfirmOpen(false)} />
          <div className="relative bg-white max-w-sm w-full shadow-2xl p-8">
            <h3 className="text-lg font-medium text-slate-900 mb-2">게시글 삭제</h3>
            <p className="text-slate-600 font-light mb-6">이 게시글을 삭제하시겠습니까?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmOpen(false)}
                className="px-5 py-2 text-slate-700 hover:text-slate-900 font-medium transition">취소</button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 font-medium transition disabled:opacity-60">
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const BoardTab = ({ dept, isAdmin, canWrite, userId }) => {
  const queryClient   = useQueryClient()
  const [writeOpen,   setWriteOpen]     = useState(false)
  const [selectedBoard, setSelectedBoard] = useState(null)

  const { data: boards = [], isLoading } = useQuery({
    queryKey: ['dept-boards', dept.code],
    queryFn:  () => getDepartmentBoards(dept.code),
  })

  const pinMutation = useMutation({
    mutationFn: (boardId) => toggleDepartmentBoardPin(dept.code, boardId),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['dept-boards', dept.code] }),
  })

  return (
    <section className="py-16 bg-slate-50 px-6">
      <div className="max-w-6xl mx-auto">
        {/* YouTube 최신 영상 */}
        <div className="mb-12">
          {dept.youtubeChannelId ? (
            (() => {
              // 중고등부는 라이브가 최신으로 잡히는 문제로 재생목록 직접 임베드
              const YOUTH_PLAYLIST_ID = 'PL0YvIuvg6pZ2A8eW2B03R2kMYM_SEtAGl'
              const isYouth = dept.code === 'youth'
              const embedSrc = isYouth
                ? `https://www.youtube.com/embed/videoseries?list=${YOUTH_PLAYLIST_ID}`
                : dept.latestVideoId
                  ? `https://www.youtube.com/embed/${dept.latestVideoId}`
                  : null

              return embedSrc ? (
                <div className="bg-white border border-slate-200 overflow-hidden">
                  <div className="aspect-video">
                    <iframe
                      src={embedSrc}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {!isYouth && dept.latestVideoTitle && (
                    <div className="p-6">
                      <h3 className="text-xl font-light text-slate-900">{dept.latestVideoTitle}</h3>
                    </div>
                  )}
                  {isYouth && (
                    <div className="p-6">
                      <h3 className="text-xl font-light text-slate-900">중고등부 설교 재생목록</h3>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-slate-100 skeleton-shimmer" />
              )
            })()
          ) : (
            <div className="bg-white border border-slate-200 p-12 text-center">
              <p className="text-slate-500">등록된 채널이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 게시글 목록 */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-slate-900">게시물</h2>
            {canWrite && (
              <Button variant="primary" size="sm" onClick={() => setWriteOpen(true)}>
                + 새 게시글
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="space-y-0 border-t border-slate-200">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          )}

          {!isLoading && boards.length === 0 && (
            <div className="bg-white border border-slate-200 p-12 text-center">
              <p className="text-slate-500">등록된 게시물이 없습니다.</p>
            </div>
          )}

          {!isLoading && boards.length > 0 && (
            <div className="bg-white border border-slate-200">
              {boards.map((board) => (
                <div key={board.id} className="border-b border-slate-200 last:border-b-0">
                  <div className="flex items-start justify-between gap-4 p-6 hover:bg-slate-50 transition">
                    <button className="flex-1 text-left" onClick={() => setSelectedBoard(board)}>
                      <div className="flex items-center gap-2 mb-2">
                        {board.isPinned && (
                          <span className="px-2 py-1 bg-slate-900 text-white text-xs font-medium">공지</span>
                        )}
                        <h3 className="text-lg font-medium text-slate-900 hover:text-slate-600 transition">
                          {board.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{fmtDate(board.createdAt)}</span>
                        <span>조회 {board.viewCount}</span>
                      </div>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => pinMutation.mutate(board.id)}
                        className={`text-xs px-3 py-1.5 border transition flex-shrink-0 ${
                          board.isPinned
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-300 text-slate-600 hover:border-slate-900'
                        }`}
                      >
                        {board.isPinned ? '핀 해제' : '핀 고정'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {writeOpen && (
        <BoardWriteModal
          deptCode={dept.code}
          onClose={() => setWriteOpen(false)}
          onSaved={() => {
            setWriteOpen(false)
            queryClient.invalidateQueries({ queryKey: ['dept-boards', dept.code] })
          }}
        />
      )}

      {selectedBoard && (
        <BoardDetailModal
          board={selectedBoard}
          deptCode={dept.code}
          isAdmin={isAdmin}
          userId={userId}
          onClose={() => setSelectedBoard(null)}
          onDeleted={() => {
            setSelectedBoard(null)
            queryClient.invalidateQueries({ queryKey: ['dept-boards', dept.code] })
          }}
        />
      )}
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 페이지
// ────────────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'about', label: '소개' },
  { key: 'board', label: '예배 및 훈련' },
]

// ── 부서별 배너 이미지 매핑 ───────────────────────────────────────────────
const DEPT_BANNERS = {
  nursery:        '/nursery.png',
  preschool:      '/preschool.png',
  children:       '/children.png',
  youth:          '/youth.png',
  'young-adult':  '/young-adult.png',
  'young-adults': '/young-adult.png',
  multiethnic:    '/multiethnic.png',
  newcomers:      '/newcomers.png',
}

const DEPT_BANNER_POSITION = {
  newcomers: 'center 30%',
}

const DepartmentPage = () => {
  const { code }      = useParams()
  const [tab, setTab] = useState('about')
  const { canWrite: canWriteFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const isAdmin = isAdminFn()
  const canWrite = canWriteFn('DEPARTMENT')
  const userId = getUserId()

  const { data: dept, isLoading, isError } = useQuery({
    queryKey: ['department', code],
    queryFn:  () => getDepartment(code),
    retry: false,
  })

  if (isLoading) return <LoadingSpinner />

  if (isError || !dept) return <NotFoundView code={code} />

  const deptBgSrc = DEPT_BANNERS[code] ?? null
  const deptBgPosition = DEPT_BANNER_POSITION[code] ?? 'center'

  return (
    <main>
      {/* Hero */}
      <section className="pt-20 border-b border-[#E5E5E5] bg-[#FAF9F6] overflow-hidden">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-[#E5E5E5] min-h-[500px] lg:min-h-[700px] relative">
          <div className="lg:col-span-5 bg-[#171717] flex flex-col justify-center p-12 md:p-16 lg:p-24 relative z-10 lg:-mr-16 lg:my-16 lg:shadow-[20px_20px_0_0_#FAF9F6]">
            <div className="flex items-center gap-4 mb-8">
              <span className="w-12 h-px bg-white/20" />
              <span className="text-sm uppercase tracking-[0.3em] font-semibold text-white/60 font-mono">
                {dept.nameEn || 'Ministry'}
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[1.05] text-[#FAF9F6] break-keep">
              {dept.name}
            </h1>
          </div>
          <div className="lg:col-span-7 relative z-0 min-h-[300px] lg:min-h-full overflow-hidden">
            {deptBgSrc ? (
              <div className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${deptBgSrc})`, backgroundPosition: deptBgPosition }} />
            ) : (
              <div className="absolute inset-0 bg-[#F4F2EA]" />
            )}
          </div>
        </div>
      </section>

      {/* 탭 네비게이션 */}
      <section className="border-b border-[#E5E5E5] bg-[#FAF9F6] relative z-20 sticky top-20">
        <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5]">
          <nav className="flex gap-0 px-8 md:px-16 lg:px-24">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`py-5 pr-8 text-[15px] transition-colors border-b-2 ${
                  tab === t.key
                    ? 'font-bold text-[#2C2C2C] border-[#171717]'
                    : 'font-medium text-[#737373] border-transparent hover:text-[#2C2C2C]'
                }`}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* 탭 컨텐츠 */}
      {tab === 'about' && <AboutTab dept={dept} />}
      {tab === 'board' && <BoardTab dept={dept} isAdmin={isAdmin} canWrite={canWrite} userId={userId} />}
    </main>
  )
}

export default DepartmentPage
