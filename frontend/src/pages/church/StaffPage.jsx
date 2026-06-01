import { useState, useRef, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import { staffApi } from '@/api/staff'
import PageHero from '@/components/ui/PageHero'
import toast from '@/utils/toast'

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

const STAFF_QUERY_KEYS = [
  ['staff', 'senior-pastor'],
  ['staff', 'MINISTER'],
  ['staff', 'EMPLOYEE'],
  ['staff', 'ELDER'],
]

// ─── 공통 UI ──────────────────────────────────────────────────────────────────

const SectionHeader = ({ title, subtitle, onAdd }) => {
  const isAdmin = useAuthStore((s) => s.isAdminOrOperator())
  return (
    <div className="flex justify-between items-center mb-16">
      <div>
        <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-4">{title}</h2>
        <p className="text-sm tracking-[0.2em] text-eyebrow uppercase">{subtitle}</p>
      </div>
      {isAdmin && onAdd && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          + {title} 추가
        </button>
      )}
    </div>
  )
}

const ImagePlaceholder = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
    <svg className="w-2/5 h-2/5 text-slate-300 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  </div>
)

const EmptyState = ({ message, onAdd }) => {
  const isAdmin = useAuthStore((s) => s.isAdminOrOperator())
  return (
    <div className="text-center py-12">
      <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <p className="text-sm text-slate-400 mb-4">{message}</p>
      {isAdmin && onAdd && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow"
        >
          + 추가
        </button>
      )}
    </div>
  )
}

const AdminCardButtons = ({ staffId, onEdit, onDelete }) => {
  const isAdmin = useAuthStore((s) => s.isAdminOrOperator())
  if (!isAdmin) return null
  return (
    <div className="absolute top-4 right-4 flex gap-2 z-10">
      <button
        onClick={() => onEdit(staffId)}
        className="px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white text-xs font-medium rounded transition"
      >
        수정
      </button>
      <button
        onClick={() => onDelete(staffId)}
        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition"
      >
        삭제
      </button>
    </div>
  )
}

const AdminImageButtons = ({ staffId, hasImage, onUpload, onDeleteImage }) => {
  const isAdmin = useAuthStore((s) => s.isAdminOrOperator())
  const fileRef = useRef(null)
  if (!isAdmin) return null
  return (
    <div className="absolute bottom-0 right-0 flex gap-1 z-10">
      <label
        className="cursor-pointer px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded transition"
        onClick={() => fileRef.current?.click()}
      >
        사진 변경
      </label>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(staffId, file)
          e.target.value = ''
        }}
      />
      {hasImage && (
        <button
          onClick={() => onDeleteImage(staffId)}
          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition"
        >
          삭제
        </button>
      )}
    </div>
  )
}

const LoadingSkeleton = ({ count = 4, variant = 'card' }) => {
  if (variant === 'senior') {
    return (
      <div className="bg-slate-50 p-8 md:p-12 animate-pulse">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
          <div className="w-48 md:w-64 flex-shrink-0 rounded-lg bg-slate-200" style={{ aspectRatio: '3/4' }} />
          <div className="flex-1 space-y-4 pt-4">
            <div className="h-8 w-40 bg-slate-200 rounded" />
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="h-24 w-full bg-slate-200 rounded mt-8" />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-8 rounded-2xl animate-pulse">
          <div className="w-32 md:w-40 mx-auto mb-4 rounded-lg bg-slate-200" style={{ aspectRatio: '3/4' }} />
          <div className="text-center space-y-2">
            <div className="h-5 w-24 bg-slate-200 rounded mx-auto" />
            <div className="h-4 w-20 bg-slate-200 rounded mx-auto" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── 모달 ─────────────────────────────────────────────────────────────────────

const MODAL_DEFAULTS = {
  position: 'PASTOR',
  category: 'MINISTER',
  isSeniorPastor: false,
  customPosition: '',
  name: '',
  englishName: '',
  responsibility: '',
  displayOrder: 0,
}

function CreateModal({ isOpen, onClose, initialValues, onCreated }) {
  const [form, setForm] = useState({ ...MODAL_DEFAULTS })
  const [previewUrl, setPreviewUrl] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)

  // 모달이 열릴 때마다 initialValues로 폼 초기화
  useEffect(() => {
    if (isOpen) {
      setForm({ ...MODAL_DEFAULTS, ...initialValues })
      setPreviewUrl(null)
      setImageFile(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [isOpen, initialValues])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('파일 크기는 5MB를 초과할 수 없습니다.'); return }
    if (!file.type.startsWith('image/')) { toast.error('이미지 파일만 업로드 가능합니다.'); return }
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setImageFile(null)
    setPreviewUrl(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const created = await staffApi.create({
        name: form.name,
        englishName: form.englishName,
        position: form.position,
        category: form.category,
        isSeniorPastor: form.isSeniorPastor,
        customPosition: form.customPosition,
        responsibility: form.responsibility,
        displayOrder: Number(form.displayOrder) || 0,
      })
      if (imageFile) {
        await staffApi.uploadImage(created.id, imageFile)
      }
      onCreated()
      onClose()
      toast.success('추가되었습니다.')
    } catch (err) {

      toast.error('추가에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-[90%] max-w-[500px] max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-900">섬기는 분 추가</h3>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition text-2xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
            {/* 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-3">프로필 이미지</label>
              <div className="flex flex-col items-center gap-3">
                {previewUrl && (
                  <div className="relative w-32 h-40 rounded-lg overflow-hidden">
                    <img src={previewUrl} alt="미리보기" className="w-full h-full object-cover" />
                    <button type="button" onClick={clearImage}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-sm">
                      ×
                    </button>
                  </div>
                )}
                <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded transition">
                  이미지 선택
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                <p className="text-xs text-slate-400">JPG, PNG, GIF (최대 5MB)</p>
              </div>
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                이름 <span className="text-red-500">*</span>
              </label>
              <input type="text" required placeholder="홍길동"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* 영문 이름 */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                영문 이름 <span className="text-red-500">*</span>
              </label>
              <input type="text" required placeholder="Hong Gil-dong"
                value={form.englishName}
                onChange={(e) => setForm((f) => ({ ...f, englishName: e.target.value }))}
                className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* 담당 업무 */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">담당 업무</label>
              <textarea rows={3} placeholder="담당하시는 업무를 입력해주세요"
                value={form.responsibility}
                onChange={(e) => setForm((f) => ({ ...f, responsibility: e.target.value }))}
                className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-y min-h-[80px]"
              />
            </div>

            {/* 표시 순서 */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">표시 순서</label>
              <input type="number" placeholder="0"
                value={form.displayOrder}
                onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
                className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          </div>

          <div className="flex gap-3 px-8 py-5 bg-slate-50 border-t border-slate-200 flex-shrink-0">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 bg-white border-[1.5px] border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-lg transition">
              취소
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
              {loading ? '처리 중...' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditModal({ isOpen, staffId, onClose, onUpdated }) {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  // 모달이 열리고 staffId가 있을 때 데이터 로드
  useEffect(() => {
    if (!isOpen || !staffId) return
    setFetching(true)
    setForm(null)
    staffApi.getById(staffId)
      .then((staff) => {
        setForm({
          id: staff.id,
          name: staff.name,
          englishName: staff.englishName,
          position: staff.positionEnglish ?? staff.position,
          category: staff.categoryEnglish ?? staff.category,
          isSeniorPastor: staff.isSeniorPastor ?? false,
          customPosition: staff.customPosition ?? '',
          responsibility: staff.responsibility ?? '',
          displayOrder: staff.displayOrder ?? 0,
        })
      })
      .catch(() => toast.error('데이터를 불러오는데 실패했습니다.'))
      .finally(() => setFetching(false))
  }, [isOpen, staffId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form) return
    setLoading(true)
    try {
      await staffApi.update(form.id, {
        name: form.name,
        englishName: form.englishName,
        position: form.position,
        category: form.category,
        isSeniorPastor: form.isSeniorPastor,
        customPosition: form.customPosition,
        responsibility: form.responsibility,
        displayOrder: Number(form.displayOrder) || 0,
      })
      onUpdated()
      onClose()
      toast.success('수정되었습니다.')
    } catch (err) {

      toast.error('수정에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-[90%] max-w-[500px] max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-900">섬기는 분 수정</h3>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition text-2xl leading-none">
            &times;
          </button>
        </div>

        {fetching || !form ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input type="text" required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  영문 이름 <span className="text-red-500">*</span>
                </label>
                <input type="text" required
                  value={form.englishName}
                  onChange={(e) => setForm((f) => ({ ...f, englishName: e.target.value }))}
                  className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">담당 업무</label>
                <textarea rows={3}
                  value={form.responsibility}
                  onChange={(e) => setForm((f) => ({ ...f, responsibility: e.target.value }))}
                  className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-y min-h-[80px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">표시 순서</label>
                <input type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
                  className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>
            <div className="flex gap-3 px-8 py-5 bg-slate-50 border-t border-slate-200 flex-shrink-0">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 bg-white border-[1.5px] border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-lg transition">
                취소
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
                {loading ? '처리 중...' : '수정'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── 관리자 액션 훅 ───────────────────────────────────────────────────────────

function useStaffAdmin() {
  const queryClient = useQueryClient()

  const invalidate = () =>
    STAFF_QUERY_KEYS.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    try {
      await staffApi.delete(id)
      invalidate()
      toast.success('삭제되었습니다.')
    } catch (err) {

      toast.error('삭제에 실패했습니다.')
    }
  }

  const handleUploadImage = async (id, file) => {
    try {
      await staffApi.uploadImage(id, file)
      invalidate()
      toast.success('이미지가 업로드되었습니다.')
    } catch (err) {

      toast.error('이미지 업로드에 실패했습니다.')
    }
  }

  const handleDeleteImage = async (id) => {
    if (!window.confirm('이미지를 삭제하시겠습니까?')) return
    try {
      await staffApi.deleteImage(id)
      invalidate()
      toast.success('이미지가 삭제되었습니다.')
    } catch (err) {

      toast.error('이미지 삭제에 실패했습니다.')
    }
  }

  return { invalidate, handleDelete, handleUploadImage, handleDeleteImage }
}

// ─── 담임목사 섹션 ────────────────────────────────────────────────────────────

const SeniorPastorSection = ({ staffList, isLoading, onEdit, onDelete, onUpload, onDeleteImage, onAdd }) => (
  <section className="py-24 bg-white px-6">
    <div className="max-w-5xl mx-auto">
      <SectionHeader title="담임목사" subtitle="Senior Pastor"
        onAdd={() => onAdd('PASTOR', true, 'MINISTER', '')} />
      {isLoading && <LoadingSkeleton variant="senior" />}
      {!isLoading && staffList.length === 0 && (
        <EmptyState message="등록된 담임목사가 없습니다"
          onAdd={() => onAdd('PASTOR', true, 'MINISTER', '')} />
      )}
      {!isLoading && staffList.map((staff) => (
        <div key={staff.id} className="bg-slate-50 p-8 md:p-12 mb-8 relative">
          <AdminCardButtons staffId={staff.id} onEdit={onEdit} onDelete={onDelete} />
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
            <div className="flex-shrink-0">
              <div className="relative w-48 md:w-64" style={{ aspectRatio: '3/4' }}>
                <div className="w-full h-full rounded-lg overflow-hidden bg-slate-200 shadow-lg">
                  {staff.imagePath
                    ? <img src={staff.imagePath} alt={staff.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
                    : <ImagePlaceholder />}
                </div>
                <AdminImageButtons staffId={staff.id} hasImage={!!staff.imagePath}
                  onUpload={onUpload} onDeleteImage={onDeleteImage} />
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-medium text-slate-900 mb-3">{staff.name}</h3>
              <p className="text-xl text-slate-600 font-light mb-8">{staff.englishName}</p>
              {staff.responsibility && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">학력</h4>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                    <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
                      {staff.responsibility.replace(/,/g, '\n')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
)

// ─── 교역자 카드 섹션 ────────────────────────────────────────────────────────

const MinisterSection = ({
  title, subtitle, bg = 'bg-slate-50', staffList, isLoading,
  onEdit, onDelete, onUpload, onDeleteImage, onAdd, addPosition, addCustomPosition = '',
}) => (
  <section className={`py-24 ${bg} px-6`}>
    <div className="max-w-5xl mx-auto">
      <SectionHeader title={title} subtitle={subtitle}
        onAdd={() => onAdd(addPosition, false, 'MINISTER', addCustomPosition)} />
      {isLoading && <LoadingSkeleton count={2} />}
      {!isLoading && staffList.length === 0 && (
        <EmptyState message={`등록된 ${title}가 없습니다`}
          onAdd={() => onAdd(addPosition, false, 'MINISTER', addCustomPosition)} />
      )}
      {!isLoading && staffList.length > 0 && (
        <div className="grid md:grid-cols-2 gap-8">
          {staffList.map((staff) => (
            <div key={staff.id}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 relative">
              <AdminCardButtons staffId={staff.id} onEdit={onEdit} onDelete={onDelete} />
              <div className="relative w-32 md:w-40 mx-auto mb-4" style={{ aspectRatio: '3/4' }}>
                <div className="w-full h-full rounded-lg overflow-hidden bg-slate-100">
                  {staff.imagePath
                    ? <img src={staff.imagePath} alt={staff.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
                    : <ImagePlaceholder />}
                </div>
                <AdminImageButtons staffId={staff.id} hasImage={!!staff.imagePath}
                  onUpload={onUpload} onDeleteImage={onDeleteImage} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-medium text-slate-900 mb-2">{staff.name}</h3>
                <p className="text-base text-slate-600 font-light mb-4">{staff.englishName}</p>
                {staff.responsibility && (
                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-sm text-slate-600 leading-relaxed">{staff.responsibility}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
)

// ─── 교회 직원 섹션 ───────────────────────────────────────────────────────────

const EmployeeSection = ({ staffList, isLoading, onEdit, onDelete, onAdd }) => (
  <section className="py-24 bg-slate-50 px-6">
    <div className="max-w-5xl mx-auto">
      <SectionHeader title="교회 직원" subtitle="Church Staff"
        onAdd={() => onAdd('OTHER', false, 'EMPLOYEE', '')} />
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="h-5 w-24 bg-slate-200 rounded mb-2" />
              <div className="h-4 w-20 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      )}
      {!isLoading && staffList.length === 0 && (
        <EmptyState message="등록된 교회 직원이 없습니다"
          onAdd={() => onAdd('OTHER', false, 'EMPLOYEE', '')} />
      )}
      {!isLoading && staffList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((staff) => (
            <div key={staff.id}
              className="relative bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
              <AdminCardButtons staffId={staff.id} onEdit={onEdit} onDelete={onDelete} />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">{staff.name}</h3>
                <p className="text-sm text-slate-500">{staff.englishName}</p>
                {staff.responsibility && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed">{staff.responsibility}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
)

// ─── 장로 섹션 ────────────────────────────────────────────────────────────────

const ElderSubHeader = ({ title, onAdd }) => {
  const isAdmin = useAuthStore((s) => s.isAdminOrOperator())
  return (
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-2xl font-light text-slate-900">{title}</h3>
      {isAdmin && onAdd && (
        <button onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm">
          + 추가
        </button>
      )}
    </div>
  )
}

const ElderSection = ({ staffList, isLoading, onEdit, onDelete, onUpload, onDeleteImage, onAdd }) => {
  const honoraryElders = staffList.filter((s) => s.customPosition === '원로')
  const retiredElders  = staffList.filter((s) => s.customPosition === '은퇴')
  const activeElders   = staffList.filter((s) => s.customPosition === '시무')

  const PhotoCard = ({ staff }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 relative">
      <AdminCardButtons staffId={staff.id} onEdit={onEdit} onDelete={onDelete} />
      <div className="relative w-28 md:w-36 mx-auto mb-4" style={{ aspectRatio: '3/4' }}>
        <div className="w-full h-full rounded-lg overflow-hidden bg-slate-100">
          {staff.imagePath
            ? <img src={staff.imagePath} alt={staff.name} loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
            : <ImagePlaceholder />}
        </div>
        <AdminImageButtons staffId={staff.id} hasImage={!!staff.imagePath}
          onUpload={onUpload} onDeleteImage={onDeleteImage} />
      </div>
      <div className="text-center">
        <h4 className="text-lg font-medium text-slate-900">{staff.name}</h4>
        <p className="text-sm text-slate-400 mt-0.5">{staff.englishName}</p>
      </div>
    </div>
  )

  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader title="장로" subtitle="Elder" />

        {isLoading && <LoadingSkeleton count={4} />}

        {!isLoading && (
          <>
            {/* 원로 장로 */}
            <div className="mb-16">
              <ElderSubHeader title="원로 장로"
                onAdd={() => onAdd('OTHER', false, 'ELDER', '원로')} />
              {honoraryElders.length === 0
                ? <EmptyState message="등록된 원로 장로가 없습니다"
                    onAdd={() => onAdd('OTHER', false, 'ELDER', '원로')} />
                : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {honoraryElders.map((s) => <PhotoCard key={s.id} staff={s} />)}
                  </div>
              }
            </div>

            {/* 은퇴 장로 */}
            <div className="mb-16">
              <ElderSubHeader title="은퇴 장로"
                onAdd={() => onAdd('OTHER', false, 'ELDER', '은퇴')} />
              {retiredElders.length === 0
                ? <EmptyState message="등록된 은퇴 장로가 없습니다"
                    onAdd={() => onAdd('OTHER', false, 'ELDER', '은퇴')} />
                : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {retiredElders.map((s) => <PhotoCard key={s.id} staff={s} />)}
                  </div>
              }
            </div>

            {/* 시무 장로 — 이름만 */}
            <div>
              <ElderSubHeader title="시무 장로"
                onAdd={() => onAdd('OTHER', false, 'ELDER', '시무')} />
              {activeElders.length === 0
                ? <EmptyState message="등록된 시무 장로가 없습니다"
                    onAdd={() => onAdd('OTHER', false, 'ELDER', '시무')} />
                : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {activeElders.map((s) => (
                      <div key={s.id} className="relative bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-center hover:bg-slate-100 transition">
                        <AdminCardButtons staffId={s.id} onEdit={onEdit} onDelete={onDelete} />
                        <p className="text-base font-medium text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">장로</p>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </>
        )}
      </div>
    </section>
  )
}

const ElderTab = ({ onEdit, onDelete, onUpload, onDeleteImage, onAdd }) => {
  const { data: elderList = [], isLoading } = useQuery({
    queryKey: ['staff', 'ELDER'],
    queryFn: () => staffApi.getByCategory('ELDER'),
    staleTime: 5 * 60 * 1000,
  })
  return (
    <ElderSection
      staffList={elderList} isLoading={isLoading}
      onEdit={onEdit} onDelete={onDelete}
      onUpload={onUpload} onDeleteImage={onDeleteImage} onAdd={onAdd}
    />
  )
}

// ─── 교역자 탭 ────────────────────────────────────────────────────────────────

const MinisterTab = ({ onEdit, onDelete, onUpload, onDeleteImage, onAdd }) => {
  const isAdmin = useAuthStore((s) => s.isAdminOrOperator())

  const { data: seniorPastors = [], isLoading: loadingSenior } = useQuery({
    queryKey: ['staff', 'senior-pastor'],
    queryFn: staffApi.getSeniorPastors,
    staleTime: 5 * 60 * 1000,
  })
  const { data: ministerList = [], isLoading: loadingMinister } = useQuery({
    queryKey: ['staff', 'MINISTER'],
    queryFn: () => staffApi.getByCategory('MINISTER'),
    staleTime: 5 * 60 * 1000,
  })

  const pastors = ministerList.filter((s) => s.position === 'PASTOR' && !s.isSeniorPastor)
  const evangelists = ministerList.filter((s) => s.position === 'EVANGELIST')
  const associatePastors = ministerList.filter((s) => s.position === 'OTHER' && s.customPosition === '협력목사')

  const showAssociate = loadingMinister || associatePastors.length > 0 || isAdmin

  return (
    <>
      <SeniorPastorSection staffList={seniorPastors} isLoading={loadingSenior}
        onEdit={onEdit} onDelete={onDelete} onUpload={onUpload} onDeleteImage={onDeleteImage} onAdd={onAdd} />
      <MinisterSection title="부목사" subtitle="Pastor" bg="bg-slate-50"
        staffList={pastors} isLoading={loadingMinister}
        onEdit={onEdit} onDelete={onDelete} onUpload={onUpload} onDeleteImage={onDeleteImage}
        onAdd={onAdd} addPosition="PASTOR" />
      <MinisterSection title="전도사" subtitle="Evangelist" bg="bg-white"
        staffList={evangelists} isLoading={loadingMinister}
        onEdit={onEdit} onDelete={onDelete} onUpload={onUpload} onDeleteImage={onDeleteImage}
        onAdd={onAdd} addPosition="EVANGELIST" />
      {showAssociate && (
        <MinisterSection title="협력목사" subtitle="Associate Pastor" bg="bg-slate-50"
          staffList={associatePastors} isLoading={loadingMinister}
          onEdit={onEdit} onDelete={onDelete} onUpload={onUpload} onDeleteImage={onDeleteImage}
          onAdd={onAdd} addPosition="OTHER" addCustomPosition="협력목사" />
      )}
    </>
  )
}

// ─── 교직원 탭 ────────────────────────────────────────────────────────────────

const EmployeeTab = ({ onEdit, onDelete, onAdd }) => {
  const { data: employeeList = [], isLoading } = useQuery({
    queryKey: ['staff', 'EMPLOYEE'],
    queryFn: () => staffApi.getByCategory('EMPLOYEE'),
    staleTime: 5 * 60 * 1000,
  })
  return <EmployeeSection staffList={employeeList} isLoading={isLoading}
    onEdit={onEdit} onDelete={onDelete} onAdd={onAdd} />
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState('MINISTER')
  const [createModal, setCreateModal] = useState({ open: false, initialValues: {} })
  const [editModal, setEditModal] = useState({ open: false, staffId: null })

  const { invalidate, handleDelete, handleUploadImage, handleDeleteImage } = useStaffAdmin()

  const openCreate = (position, isSeniorPastor, category, customPosition = '') =>
    setCreateModal({ open: true, initialValues: { position, isSeniorPastor, category, customPosition } })

  const openEdit = (staffId) => setEditModal({ open: true, staffId })

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow="Our Staff"
        title="섬기는 분들"
        subtitle="그리스도 사랑교회를 섬기는 주의 종들을 소개합니다"
      />

      {/* 카테고리 탭 */}
      <section className="py-8 bg-white px-6 border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-4 justify-center">
            {[
              { key: 'MINISTER', label: '교역자' },
              { key: 'ELDER',    label: '장로' },
              { key: 'EMPLOYEE', label: '교회 직원' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-8 py-3 text-lg font-medium transition-all border-b-2 ${
                  activeTab === key
                    ? 'text-slate-900 border-slate-900 font-semibold'
                    : 'text-slate-400 border-transparent hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 탭 콘텐츠 */}
      {activeTab === 'MINISTER' && (
        <MinisterTab
          onEdit={openEdit} onDelete={handleDelete}
          onUpload={handleUploadImage} onDeleteImage={handleDeleteImage} onAdd={openCreate}
        />
      )}
      {activeTab === 'ELDER' && (
        <ElderTab
          onEdit={openEdit} onDelete={handleDelete}
          onUpload={handleUploadImage} onDeleteImage={handleDeleteImage} onAdd={openCreate}
        />
      )}
      {activeTab === 'EMPLOYEE' && (
        <EmployeeTab onEdit={openEdit} onDelete={handleDelete} onAdd={openCreate} />
      )}


      {/* 모달 */}
      <CreateModal
        isOpen={createModal.open}
        initialValues={createModal.initialValues}
        onClose={() => setCreateModal((s) => ({ ...s, open: false }))}
        onCreated={invalidate}
      />
      <EditModal
        isOpen={editModal.open}
        staffId={editModal.staffId}
        onClose={() => setEditModal((s) => ({ ...s, open: false }))}
        onUpdated={invalidate}
      />
    </div>
  )
}
