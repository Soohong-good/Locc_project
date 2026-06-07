import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBulletins, createBulletin, updateBulletin, deleteBulletin } from '@/api/bulletins'
import useAuthStore from '@/stores/authStore'
import { SkeletonRow } from '@/components/ui/SkeletonCard'
import toast from '@/utils/toast'

/* ── 날짜 포맷 ─────────────────────────────────────── */
const formatDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* ── 등록 모달 ─────────────────────────────────────── */
const WriteModal = ({ onClose, onSaved }) => {
  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')
  const [file,    setFile]    = useState(null)
  const [error,   setError]   = useState('')
  const [saving,  setSaving]  = useState(false)

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) { setFile(null); return }
    if (f.type !== 'application/pdf') {
      setError('PDF 파일만 업로드 가능합니다.')
      e.target.value = ''
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB를 초과할 수 없습니다.')
      e.target.value = ''
      return
    }
    setError('')
    setFile(f)
  }

  const handleSave = async () => {
    setError('')
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    const fd = new FormData()
    fd.append('title', title.trim())
    if (content.trim()) fd.append('content', content.trim())
    if (file) fd.append('thumbnail', file)
    setSaving(true)
    try {
      await createBulletin(fd)
      onSaved()
    } catch (e) {
      setError(e?.response?.data?.message ?? '주보 등록에 실패했습니다.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">새 주보 등록</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="주보 제목을 입력하세요"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              주보 파일 <span className="text-xs text-gray-400">(PDF만 가능 / 최대 10MB)</span>
            </label>
            <label className="flex items-center gap-3 w-full border border-dashed border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="text-sm text-gray-500">
                {file ? file.name : '파일 선택하기'}
              </span>
              <span className="ml-auto text-xs text-gray-400 shrink-0">PDF · 최대 10MB</span>
              <input type="file" accept=".pdf,application/pdf" onChange={handleFileChange} className="hidden" />
            </label>
            {file && (
              <p className="mt-1.5 text-xs text-blue-600 flex items-center gap-1">
                <span>✓</span> {file.name}
                <button type="button" onClick={() => setFile(null)} className="ml-1 text-gray-400 hover:text-red-500">✕</button>
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              rows={4} placeholder="주보 내용을 입력하세요 (선택)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">취소</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? '등록 중...' : '등록'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── 수정 모달 ─────────────────────────────────────── */
const EditModal = ({ bulletin, onClose, onSaved }) => {
  const [title,   setTitle]   = useState(bulletin.title ?? '')
  const [content, setContent] = useState(bulletin.content ?? '')
  const [error,   setError]   = useState('')
  const [saving,  setSaving]  = useState(false)

  const handleSave = async () => {
    setError('')
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    setSaving(true)
    try {
      await updateBulletin(bulletin.id, { title: title.trim(), content: content.trim() })
      onSaved()
    } catch (e) {
      setError(e?.response?.data?.message ?? '수정에 실패했습니다.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">주보 수정</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">취소</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── 썸네일 ─────────────────────────────────────────── */
const Thumbnail = ({ url }) =>
  url ? (
    <div className="w-12 h-16 bg-cover bg-center border border-gray-200 rounded shrink-0"
      style={{ backgroundImage: `url(${url})` }} />
  ) : (
    <div className="w-12 h-16 bg-gray-100 border border-gray-200 rounded flex items-center justify-center shrink-0">
      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  )

/* ── 메인 ────────────────────────────────────────────── */
const AdminBulletinPage = () => {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const { isAdminOrOperator: isAdminOrOperatorFn } = useAuthStore()
  const isAdmin = isAdminOrOperatorFn()

  const [page,       setPage]       = useState(0)
  const [keyword,    setKeyword]    = useState('')
  const [inputVal,   setInputVal]   = useState('')
  const [writeOpen,  setWriteOpen]  = useState(false)
  const [editTarget, setEditTarget] = useState(null) // 수정 대상 주보

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'bulletins', page, keyword],
    queryFn:  () => getBulletins({ page, size: 15, keyword }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBulletin(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'bulletins'] }),
    onError: (e) => toast.error(e?.response?.data?.message ?? '삭제에 실패했습니다.'),
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    setKeyword(inputVal)
  }

  const handleDelete = (id, title) => {
    if (!confirm(`"${title}" 주보를 삭제하시겠습니까?`)) return
    deleteMutation.mutate(id)
  }

  const bulletins   = data?.content ?? []
  const pageInfo    = data?.pageInfo ?? {}
  const totalPages  = pageInfo.totalPages ?? 0
  const currentPage = pageInfo.page ?? 0

  return (
    <div className="p-4 sm:p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">주보 관리</h1>
        {isAdmin && (
          <button onClick={() => setWriteOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + 새 주보 등록
          </button>
        )}
      </div>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
          placeholder="제목으로 검색"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm px-4 py-2 rounded-lg">검색</button>
        {keyword && (
          <button type="button" onClick={() => { setKeyword(''); setInputVal(''); setPage(0) }}
            className="text-sm text-gray-400 hover:text-gray-700 px-2">초기화</button>
        )}
      </form>

      {/* 목록 */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : isError ? (
        <p className="text-center text-sm text-red-500 py-16">주보 목록을 불러올 수 없습니다.</p>
      ) : bulletins.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">등록된 주보가 없습니다.</p>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col style={{ width: '72px' }} />
                <col />
                <col style={{ width: '80px' }} />
                <col style={{ width: '96px' }} />
                <col style={{ width: '52px' }} />
                <col style={{ width: '72px' }} />
                <col style={{ width: '52px' }} />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">썸네일</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">제목</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell whitespace-nowrap">작성자</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell whitespace-nowrap">등록일</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell whitespace-nowrap">조회</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">수정</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bulletins.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2">
                      <button onClick={() => navigate(`/bulletin/${b.id}`)}>
                        <Thumbnail url={b.thumbnailUrl} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/bulletin/${b.id}`)}
                        className="text-gray-800 font-medium hover:text-blue-600 hover:underline text-left truncate max-w-xs block">
                        {b.title}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">{b.authorName}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell whitespace-nowrap">{formatDate(b.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell whitespace-nowrap">{b.viewCount}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isAdmin && (
                        <button onClick={() => setEditTarget(b)}
                          className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors">
                          수정
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isAdmin && (
                        <button onClick={() => handleDelete(b.id, b.title)}
                          disabled={deleteMutation.isPending}
                          className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors disabled:opacity-40">
                          삭제
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mt-5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                    i === currentPage ? 'bg-blue-600 text-white font-medium' : 'text-gray-600 hover:bg-gray-100'
                  }`}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}

      {writeOpen && (
        <WriteModal onClose={() => setWriteOpen(false)}
          onSaved={() => { setWriteOpen(false); queryClient.invalidateQueries({ queryKey: ['admin', 'bulletins'] }) }} />
      )}

      {editTarget && (
        <EditModal
          bulletin={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); queryClient.invalidateQueries({ queryKey: ['admin', 'bulletins'] }) }}
        />
      )}
    </div>
  )
}

export default AdminBulletinPage
