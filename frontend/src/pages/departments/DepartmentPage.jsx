import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from '@/utils/toast'
import {
  getDepartment,
  getDepartmentBoards,
  createDepartmentBoard,
  deleteDepartmentBoard,
  toggleDepartmentBoardPin,
  getGalleryImageList,
  uploadGalleryImages,
  deleteGalleryImage,
} from '@/api/departments'
import useAuthStore from '@/stores/authStore'
import Button from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'
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
    <section className="py-16 bg-white px-6">
      <div className="max-w-6xl mx-auto">
        {/* 소개 텍스트 */}
        <div className="mb-16">
          <SectionHeader eyebrow="About" title="부서 소개" />
          {dept.description && (
            <p className="text-lg text-slate-600 leading-relaxed text-center max-w-3xl mx-auto -mt-4">
              {dept.description}
            </p>
          )}
        </div>

        {/* 특징 카드 */}
        {features.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((f) => (
              <div key={f.label} className="text-center p-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                     style={{ background: '#0f172a' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={f.icon} />
                  </svg>
                </div>
                <h4 className="text-xl font-light text-slate-900 mb-3">{f.label}</h4>
                <p className="text-slate-600">{f.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* 예배 안내 */}
        <div className="bg-slate-50 p-12 border border-slate-200 max-w-2xl mx-auto">
          <h3 className="text-2xl font-light text-slate-900 mb-8 text-center">예배 안내</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-slate-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-medium text-slate-900">매주 주일</p>
                <p className="text-sm text-slate-600">Every Sunday</p>
              </div>
            </div>
            {dept.worshipTime && (
              <div className="flex items-center gap-4">
                <svg className="w-6 h-6 text-slate-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-slate-900">{dept.worshipTime}</p>
                  {dept.worshipTimeEn && <p className="text-sm text-slate-600">{dept.worshipTimeEn}</p>}
                </div>
              </div>
            )}
            {dept.worshipLocation && (
              <div className="flex items-center gap-4">
                <svg className="w-6 h-6 text-slate-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-medium text-slate-900">{dept.worshipLocation}</p>
                  {dept.worshipLocationEn && <p className="text-sm text-slate-600">{dept.worshipLocationEn}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
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
          {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3">{error}</div>}
        </div>
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
// 갤러리 탭 — 원본 department-gallery-board.js 구조 그대로 이식
// ────────────────────────────────────────────────────────────────────────────

// 갤러리 업로드 모달
const GalleryUploadModal = ({ deptCode, onClose, onSaved }) => {
  const [title,  setTitle]  = useState('')
  const [desc,   setDesc]   = useState('')
  const [files,  setFiles]  = useState([])
  const [preview, setPreview] = useState(null)   // { src, count }
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files)
    const ALLOWED_IMG_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const invalidType = selected.find((f) => !ALLOWED_IMG_TYPES.includes(f.type))
    if (invalidType) { setError(`이미지 파일(JPG, PNG, GIF, WEBP)만 업로드 가능합니다: ${invalidType.name}`); return }
    const over = selected.find((f) => f.size > 10 * 1024 * 1024)
    if (over) { setError('파일 1개당 10MB를 초과할 수 없습니다.'); return }
    setError('')
    setFiles(selected)

    // 첫 번째 이미지 미리보기
    if (selected.length > 0) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview({ src: ev.target.result, count: selected.length })
      reader.readAsDataURL(selected[0])
    } else {
      setPreview(null)
    }
  }

  const handleSave = async () => {
    setError('')
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    if (files.length === 0) { setError('이미지를 선택해주세요.'); return }
    setSaving(true)
    const fd = new FormData()
    fd.append('title', title.trim())
    if (desc.trim()) fd.append('description', desc.trim())
    files.forEach((f) => fd.append('imageFiles', f))
    try {
      await uploadGalleryImages(deptCode, fd)
      onSaved()
    } catch (e) {
      setError(e?.response?.data?.message ?? '업로드에 실패했습니다.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <h2 className="text-2xl font-light text-slate-900">이미지 업로드</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2024 여름수련회"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">같은 제목의 이미지들이 하나의 그룹으로 표시됩니다</p>
          </div>
          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">설명</label>
            <textarea
              value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
              placeholder="이미지에 대한 설명을 입력하세요"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none transition-all resize-none"
            />
          </div>
          {/* 파일 선택 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              이미지 파일 <span className="text-red-500">*</span>
            </label>
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition group">
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center flex-shrink-0 transition">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {files.length > 0 ? `${files.length}장 선택됨` : '이미지 추가'}
                </p>
                <p className="text-xs text-slate-400">JPG, PNG, GIF, WEBP · 최대 10MB · 여러 장 선택 가능</p>
              </div>
              <input
                type="file" accept="image/*" multiple onChange={handleFiles}
                className="hidden"
              />
            </label>
          </div>
          {/* 미리보기 — 첫 장 카드 스택 */}
          {preview && (
            <div className="relative" style={{ width: 300, height: 220, margin: '0 auto' }}>
              {preview.count > 1 && (
                <>
                  <div className="absolute border border-slate-200 bg-white"
                    style={{ top: 12, left: 12, width: 280, height: 200, zIndex: 1 }} />
                  {preview.count > 2 && (
                    <div className="absolute border border-slate-200 bg-white"
                      style={{ top: 6, left: 6, width: 280, height: 200, zIndex: 2 }} />
                  )}
                </>
              )}
              <div className="absolute overflow-hidden border border-slate-200"
                style={{ top: 0, left: 0, width: 280, height: 200, zIndex: 3 }}>
                <img src={preview.src} alt="미리보기" className="w-full h-full object-cover" />
                {preview.count > 1 && (
                  <span className="absolute top-3 right-3 bg-slate-900/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {preview.count}장
                  </span>
                )}
              </div>
            </div>
          )}
          {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3">{error}</div>}
        </div>
        <div className="flex justify-end gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
          <Button variant="ghost" size="md" onClick={onClose}>취소</Button>
          <Button variant="primary" size="md" onClick={handleSave} isLoading={saving}>
            {saving ? '업로드 중...' : '업로드'}
          </Button>
        </div>
      </div>
    </div>
  )
}

const GalleryTab = ({ dept, isAdmin, canWrite, userId }) => {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const [page,       setPage]       = useState(0)
  const [uploadOpen, setUploadOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['gallery-list', dept.code, page],
    queryFn:  () => getGalleryImageList(dept.code, page),
  })

  // PageResponse 구조: { content, pageInfo: { page, size, totalElements, totalPages } }
  const images      = data?.content   ?? []
  const pageInfo    = data?.pageInfo  ?? {}
  const totalPages  = pageInfo.totalPages ?? 0
  const currentPage = pageInfo.page       ?? 0

  return (
    <section className="py-16 bg-white px-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-light text-slate-900 mb-2">갤러리</h2>
            <p className="text-slate-600">{dept.name}의 활동 모습을 담았습니다</p>
          </div>
          {canWrite && (
            <Button variant="primary" size="sm" onClick={() => setUploadOpen(true)}>
              + 이미지 업로드
            </Button>
          )}
        </div>

        {/* 목록 없음 */}
        {!isLoading && images.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-500 font-light">등록된 이미지가 없습니다.</p>
          </div>
        )}

        {/* 로딩 */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square skeleton-shimmer" />
            ))}
          </div>
        )}

        {/* 포토 그리드 */}
        {!isLoading && images.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((image) => {
                const count = image.imageCount ?? 1
                return (
                  <article
                    key={image.id}
                    onClick={() => navigate(`/department/${dept.code}/gallery/${image.id}`)}
                    className="group cursor-pointer bg-white border border-slate-100 overflow-hidden
                               hover:border-slate-300 hover:shadow-md transition-all duration-200"
                  >
                    {/* 썸네일 */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <img
                        src={`/uploads/gallery/${image.thumbnailFilename || image.storedFilename}`}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.src = '/images/no-image.png' }}
                      />
                      {/* 장수 배지 */}
                      {count > 1 && (
                        <span className="absolute top-2 right-2 flex items-center gap-1
                                         bg-slate-900/80 text-white text-xs font-medium px-2 py-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                          </svg>
                          {count}
                        </span>
                      )}
                    </div>

                    {/* 텍스트 */}
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-slate-800 leading-snug line-clamp-1
                                     group-hover:text-slate-600 transition-colors">
                        {image.title}
                      </h3>
                      <div className="flex items-center justify-between mt-1.5 text-xs text-slate-400">
                        <span className="tabular-nums">{fmtDate(image.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                                 -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {image.viewCount ?? 0}
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-1">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="w-9 h-9 flex items-center justify-center border border-slate-200
                             text-slate-500 hover:bg-slate-50 disabled:opacity-30
                             disabled:cursor-not-allowed transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-9 h-9 text-sm font-light transition border
                      ${i === currentPage
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="w-9 h-9 flex items-center justify-center border border-slate-200
                             text-slate-500 hover:bg-slate-50 disabled:opacity-30
                             disabled:cursor-not-allowed transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {uploadOpen && (
        <GalleryUploadModal
          deptCode={dept.code}
          onClose={() => setUploadOpen(false)}
          onSaved={() => {
            setUploadOpen(false)
            queryClient.invalidateQueries({ queryKey: ['gallery-list', dept.code] })
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
  { key: 'about',   label: '소개' },
  { key: 'board',   label: '예배 및 훈련' },
  { key: 'gallery', label: '갤러리' },
]

const DepartmentPage = () => {
  const { code }      = useParams()
  const [tab, setTab] = useState('about')
  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const isAdmin = isAdminFn()
  const canWrite = isAdminOrOperatorFn()
  const userId = getUserId()

  const { data: dept, isLoading, isError } = useQuery({
    queryKey: ['department', code],
    queryFn:  () => getDepartment(code),
    retry: false,
  })

  if (isLoading) return <LoadingSpinner />

  if (isError || !dept) return <NotFoundView code={code} />

  return (
    <main>
      {/* Hero */}
      <section
        className="pt-page pb-16 text-white px-6 relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-900/65 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <p className="text-xs tracking-[0.3em] uppercase mb-3 text-slate-400">
            {dept.nameEn || 'Ministry'}
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">{dept.name}</h1>
          {dept.description && (
            <p className="text-lg text-slate-300 font-light">{dept.description}</p>
          )}
        </div>
      </section>

      {/* 탭 네비게이션 */}
      <section className="bg-white border-b border-slate-200 px-6 ">
        <div className="max-w-6xl mx-auto">
          <nav className="flex gap-8">
            {TABS.map((t) => (
              <TabBtn key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
                {t.label}
              </TabBtn>
            ))}
          </nav>
        </div>
      </section>

      {/* 탭 컨텐츠 */}
      {tab === 'about'   && <AboutTab   dept={dept} />}
      {tab === 'board'   && <BoardTab   dept={dept} isAdmin={isAdmin} canWrite={canWrite} userId={userId} />}
      {tab === 'gallery' && <GalleryTab dept={dept} isAdmin={isAdmin} canWrite={canWrite} userId={userId} />}
    </main>
  )
}

export default DepartmentPage
