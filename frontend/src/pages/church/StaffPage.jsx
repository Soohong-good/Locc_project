import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GraduationCap, User, NotePencil, Trash, PlusCircle, X, Warning, UploadSimple } from '@phosphor-icons/react'
import { staffApi } from '@/api/staff'
import useAuthStore from '@/stores/authStore'

/* ── 유틸 ── */
const POSITION_LABEL = { PASTOR: '목사', EVANGELIST: '전도사', OTHER: '기타' }
const POSITION_EN    = { PASTOR: 'Pastor', EVANGELIST: 'Evangelist', OTHER: 'Other' }
const CATEGORY_LABEL = { MINISTER: '교역자', EMPLOYEE: '교회 직원', ELDER: '장로' }

const getDisplayPosition = (s) => {
  if (s.customPosition) return s.customPosition
  if (s.isSeniorPastor) return '담임목사'
  return POSITION_LABEL[s.position] ?? s.position
}

const splitLines = (text) =>
  text
    ? text
        .split(/\n|,\s*-\s*/)
        .map((l) => l.trim().replace(/^-\s*/, ''))
        .filter(Boolean)
    : []

const StaffImg = ({ imagePath, size = 'full', className = '' }) => {
  const src = imagePath || null
  if (src) {
    return (
      <img src={src} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling?.style?.removeProperty('display') }}
        className={`absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80 ${className}`} />
    )
  }
  return null
}

/* ── 관리자 오버레이 버튼 ── */
function AdminActions({ onEdit, onDelete, light = false }) {
  return (
    <div className={`absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
      <button onClick={(e) => { e.stopPropagation(); onEdit() }}
        className={`p-1.5 rounded ${light ? 'bg-white/90 text-[#2C2C2C] hover:bg-white' : 'bg-black/70 text-white hover:bg-black'} transition-colors`}
        title="수정">
        <NotePencil size={14} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onDelete() }}
        className={`p-1.5 rounded ${light ? 'bg-white/90 text-red-600 hover:bg-red-50' : 'bg-black/70 text-red-400 hover:bg-red-600 hover:text-white'} transition-colors`}
        title="삭제">
        <Trash size={14} />
      </button>
    </div>
  )
}

/* ── 수정/등록 모달 ── */
function StaffModal({ staff, onClose, onSaved }) {
  const isEdit = !!staff
  const [form, setForm] = useState({
    name:            staff?.name            ?? '',
    englishName:     staff?.englishName     ?? '',
    position:        staff?.position        ?? 'PASTOR',
    category:        staff?.category        ?? 'MINISTER',
    isSeniorPastor:  staff?.isSeniorPastor  ?? false,
    customPosition:  staff?.customPosition  ?? '',
    responsibility:  staff?.responsibility  ?? '',
    displayOrder:    staff?.displayOrder    ?? 0,
  })
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState(staff?.imagePath ?? null)
  const [imageToDelete, setImageToDelete] = useState(false)
  const [error, setError]               = useState('')
  const [saving, setSaving]             = useState(false)

  const hasOriginalImage = !!staff?.imagePath
  const objectUrlRef = useRef(null)

  // blob URL 메모리 누수 방지 — 교체/언마운트 시 직전에 생성한 URL revoke
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleImageChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (!f.type.startsWith('image/')) { setError('이미지 파일만 가능합니다.'); return }
    if (f.size > 10 * 1024 * 1024) { setError('10MB 이하 이미지만 가능합니다.'); return }
    setError('')
    setImageFile(f)
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(f)
    objectUrlRef.current = url
    setImagePreview(url)
    setImageToDelete(false)
  }

  const handleImageDelete = () => {
    setImagePreview(null)
    setImageFile(null)
    setImageToDelete(true)
  }

  const handleSave = async () => {
    setError('')
    if (!form.name.trim())        { setError('이름을 입력해주세요.'); return }
    if (!form.englishName.trim()) { setError('영문 이름을 입력해주세요.'); return }
    setSaving(true)
    try {
      let savedId = staff?.id
      const body = {
        name:           form.name.trim(),
        englishName:    form.englishName.trim(),
        position:       form.position,
        category:       form.category,
        isSeniorPastor: form.isSeniorPastor,
        customPosition: form.customPosition.trim() || null,
        responsibility: form.responsibility.trim() || null,
        displayOrder:   Number(form.displayOrder) || 0,
      }
      if (isEdit) {
        await staffApi.update(staff.id, body)
        if (imageToDelete && hasOriginalImage) {
          await staffApi.deleteImage(staff.id)
        }
      } else {
        const created = await staffApi.create(body)
        savedId = created?.id
      }
      if (imageFile && savedId) {
        await staffApi.uploadImage(savedId, imageFile)
      }
      onSaved()
    } catch (e) {
      setError(e?.response?.data?.message ?? '저장 중 오류가 발생했습니다.')
      setSaving(false)
    }
  }

  const labelCls = 'block text-[11px] font-semibold text-[#737373] uppercase tracking-widest mb-1.5'
  const inputCls = 'w-full border border-[#E5E5E5] rounded px-3 py-2 text-[14px] text-[#2C2C2C] focus:outline-none focus:border-[#171717] transition-colors bg-white'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
          <h2 className="text-[16px] font-bold text-[#2C2C2C]">{isEdit ? '직원 정보 수정' : '새 직원 등록'}</h2>
          <button onClick={onClose} className="text-[#737373] hover:text-[#2C2C2C]"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* 이미지 */}
          <div>
            <label className={labelCls}>사진</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-24 bg-[#F5F5F5] border border-[#E5E5E5] relative flex items-center justify-center overflow-hidden shrink-0">
                {imagePreview
                  ? <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  : <User size={28} className="text-[#A3A3A3]" />
                }
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 px-4 py-2 border border-[#E5E5E5] rounded text-[13px] text-[#737373] cursor-pointer hover:border-[#171717] hover:text-[#2C2C2C] transition-colors">
                  <UploadSimple size={16} /> 이미지 선택
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imagePreview && (
                  <button type="button" onClick={handleImageDelete}
                    className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded text-[13px] text-red-500 hover:border-red-400 hover:bg-red-50 transition-colors">
                    <Trash size={14} /> 이미지 삭제
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* 이름 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>이름 *</label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="홍길동" />
            </div>
            <div>
              <label className={labelCls}>영문 이름 *</label>
              <input type="text" value={form.englishName} onChange={(e) => set('englishName', e.target.value)} className={inputCls} placeholder="Hong, Gil Dong" />
            </div>
          </div>
          {/* 직분 / 카테고리 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>직분</label>
              <select value={form.position} onChange={(e) => set('position', e.target.value)} className={inputCls}>
                <option value="PASTOR">목사</option>
                <option value="EVANGELIST">전도사</option>
                <option value="OTHER">기타</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>카테고리</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                <option value="MINISTER">교역자</option>
                <option value="EMPLOYEE">교회 직원</option>
                <option value="ELDER">장로</option>
              </select>
            </div>
          </div>
          {/* 기타 직책명 / 노출순서 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>기타 직책명 <span className="normal-case font-normal">(협력목사, 원로장로 등)</span></label>
              <input type="text" value={form.customPosition} onChange={(e) => set('customPosition', e.target.value)} className={inputCls} placeholder="예: 협력목사" />
            </div>
            <div>
              <label className={labelCls}>노출 순서</label>
              <input type="number" value={form.displayOrder} onChange={(e) => set('displayOrder', e.target.value)} className={inputCls} min={0} />
            </div>
          </div>
          {/* 담임목사 여부 */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div onClick={() => set('isSeniorPastor', !form.isSeniorPastor)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isSeniorPastor ? 'bg-[#171717]' : 'bg-[#E5E5E5]'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isSeniorPastor ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="text-[14px] text-[#2C2C2C]">담임목사</span>
          </label>
          {/* 담당 / 학력 */}
          <div>
            <label className={labelCls}>담당 업무 / 학력 <span className="normal-case font-normal">(줄바꿈으로 항목 구분)</span></label>
            <textarea value={form.responsibility} onChange={(e) => set('responsibility', e.target.value)} rows={5}
              className={`${inputCls} resize-none`} placeholder="담당 업무나 학력을 입력하세요&#10;줄바꿈으로 항목을 구분합니다" />
          </div>
        </div>
        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-100 flex items-center gap-2">
            <Warning size={15} className="text-red-500 shrink-0" />
            <p className="text-[13px] text-red-600">{error}</p>
          </div>
        )}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#E5E5E5] bg-[#FAF9F6]">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-[#737373] hover:text-[#2C2C2C]">취소</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 bg-[#171717] text-white text-[13px] font-medium rounded hover:bg-[#2C2C2C] disabled:opacity-50 transition-colors">
            {saving ? '저장 중...' : (isEdit ? '저장' : '등록')}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── 섹션들 ── */
const HeroSection = () => (
  <section className="bg-[#171717] text-[#FAF9F6] pt-32 pb-24 border-b border-[#171717]">
    <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
      <span className="text-xs uppercase tracking-[0.2em] font-mono text-[#737373] mb-6 block">Our Staff</span>
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-8">섬기는 분들</h1>
      <p className="text-lg md:text-xl font-light text-[#A3A3A3]">그리스도 사랑교회를 섬기는 주의 종들을 소개합니다</p>
    </div>
  </section>
)

function SeniorPastorSection({ staff, isAdmin, onEdit, onDelete }) {
  if (!staff) return null
  const lines = splitLines(staff.responsibility)
  return (
    <section id="pastors" className="border-b border-[#E5E5E5] bg-[#FAF9F6]">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-[#E5E5E5] divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E5]">
        <div className="lg:col-span-5 p-8 md:p-16 lg:p-24 flex flex-col justify-between bg-[#F4F2EA]">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#2C2C2C]">담임목사</h2>
            <span className="text-xs font-mono text-[#737373] uppercase tracking-widest block">Senior Pastor</span>
          </div>
          <div className="relative w-full aspect-[4/5] bg-[#E5E5E5] mt-16 group">
            {staff.imagePath
              ? <img src={staff.imagePath} alt={staff.name}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80" />
              : <div className="absolute inset-0 flex items-center justify-center">
                  <User size={64} className="text-[#A3A3A3]" />
                </div>
            }
            {isAdmin && <AdminActions onEdit={() => onEdit(staff)} onDelete={() => onDelete(staff)} />}
          </div>
        </div>
        <div className="lg:col-span-7 p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-[#FAF9F6]">
          <h3 className="text-5xl lg:text-6xl font-bold mb-4 text-[#2C2C2C]">{staff.name}</h3>
          <p className="font-mono text-lg text-[#737373] mb-16 uppercase tracking-widest">{staff.englishName}</p>
          {lines.length > 0 && (
            <div className="border-t border-[#E5E5E5] pt-12">
              <div className="flex items-center gap-3 mb-8">
                <GraduationCap size={24} className="text-[#2C2C2C]" />
                <h4 className="text-lg font-bold text-[#2C2C2C]">학력</h4>
              </div>
              <ul className="space-y-5 text-[#737373] font-light leading-relaxed break-keep">
                {lines.map((line, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="text-[#2C2C2C] mt-1">-</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function AssociatePastorSection({ pastors, isAdmin, onEdit, onDelete }) {
  if (pastors.length === 0) return null
  return (
    <section className="border-b border-[#E5E5E5] bg-[#FAF9F6]">
      <div className="max-w-[1600px] mx-auto p-8 md:p-16 lg:p-24 border-x border-b border-[#E5E5E5] flex flex-col items-center text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#2C2C2C]">부목사</h2>
        <span className="text-xs font-mono text-[#737373] uppercase tracking-widest block">Pastor</span>
      </div>
      <div className={`max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 ${pastors.length >= 4 ? 'lg:grid-cols-4' : pastors.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} divide-y sm:divide-y-0 sm:divide-x divide-[#E5E5E5] border-x border-[#E5E5E5]`}>
        {pastors.map((s, i) => (
          <div key={s.id} className={`p-8 md:p-12 lg:p-16 flex flex-col group hover:bg-[#F4F2EA] transition-colors relative ${i < pastors.length - 1 ? 'border-b sm:border-b-0 border-[#E5E5E5]' : ''}`}>
            <div className="w-full aspect-[3/4] bg-[#E5E5E5] mb-10 relative flex items-center justify-center overflow-hidden">
              {s.imagePath
                ? <img src={s.imagePath} alt={s.name} className="w-full h-full object-cover" />
                : <User size={40} className="text-[#A3A3A3] group-hover:text-[#2C2C2C] transition-colors" />
              }
              {isAdmin && <AdminActions onEdit={() => onEdit(s)} onDelete={() => onDelete(s)} light />}
            </div>
            <div className="mt-auto flex flex-col items-center text-center">
              <h3 className="text-2xl font-bold mb-2 text-[#2C2C2C]">{s.name}</h3>
              <p className="font-mono text-xs text-[#737373] mb-6 uppercase tracking-widest">{s.englishName}</p>
              {s.responsibility && <p className="text-sm font-light text-[#737373] leading-relaxed break-keep">{s.responsibility}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function EvangelistSection({ evangelists, isAdmin, onEdit, onDelete }) {
  if (evangelists.length === 0) return null
  return (
    <section className="border-b border-[#E5E5E5] bg-[#FAF9F6]">
      <div className="max-w-[1600px] mx-auto p-8 md:p-16 lg:p-24 border-x border-b border-[#E5E5E5] bg-[#F4F2EA]">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#2C2C2C]">전도사</h2>
        <span className="text-xs font-mono text-[#737373] uppercase tracking-widest block">Evangelist</span>
      </div>
      <div className={`max-w-[1600px] mx-auto grid grid-cols-1 ${evangelists.length > 1 ? 'lg:grid-cols-2' : ''} divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E5] border-x border-[#E5E5E5]`}>
        {evangelists.map((s) => (
          <div key={s.id} className="p-8 md:p-12 lg:p-16 flex flex-col sm:flex-row gap-8 lg:gap-12 group hover:bg-[#F4F2EA] transition-colors bg-[#FAF9F6] relative">
            <div className="w-full sm:w-48 xl:w-64 aspect-[3/4] bg-[#E5E5E5] shrink-0 relative flex items-center justify-center overflow-hidden">
              {s.imagePath
                ? <img src={s.imagePath} alt={s.name} className="w-full h-full object-cover" />
                : <User size={40} className="text-[#A3A3A3] group-hover:text-[#2C2C2C] transition-colors" />
              }
              {isAdmin && <AdminActions onEdit={() => onEdit(s)} onDelete={() => onDelete(s)} light />}
            </div>
            <div className="flex flex-col justify-center py-4">
              <h3 className="text-3xl font-bold mb-2 text-[#2C2C2C]">{s.name}</h3>
              <p className="font-mono text-sm text-[#737373] mb-8 uppercase tracking-widest">{s.englishName}</p>
              <div className="w-8 h-px bg-[#E5E5E5] mb-6 group-hover:bg-[#171717] transition-colors" />
              {s.responsibility && <p className="text-base font-light text-[#737373] leading-relaxed break-keep">{s.responsibility}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CoopPastorSection({ coopPastors, isAdmin, onEdit, onDelete }) {
  if (coopPastors.length === 0) return null
  return (
    <section className="border-b border-[#E5E5E5] bg-[#FAF9F6]">
      <div className="max-w-[1600px] mx-auto p-8 md:p-16 lg:p-24 border-x border-b border-[#E5E5E5] flex flex-col items-center text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#2C2C2C]">협력목사</h2>
        <span className="text-xs font-mono text-[#737373] uppercase tracking-widest block">Associate Pastor</span>
      </div>
      <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5]">
        {coopPastors.map((s) => (
          <div key={s.id} className="border-b border-[#E5E5E5] last:border-b-0 p-8 md:p-16 lg:p-24 bg-[#F4F2EA] hover:bg-[#FAF9F6] transition-colors group flex flex-col sm:flex-row items-center sm:items-stretch gap-8 sm:gap-12 lg:gap-16 relative">
            <div className="w-full sm:w-56 xl:w-72 aspect-square sm:aspect-[3/4] bg-[#E5E5E5] shrink-0 relative flex items-center justify-center overflow-hidden">
              {s.imagePath
                ? <img src={s.imagePath} alt={s.name} className="w-full h-full object-cover" />
                : <User size={40} className="text-[#A3A3A3] group-hover:text-[#2C2C2C] transition-colors" />
              }
              {isAdmin && <AdminActions onEdit={() => onEdit(s)} onDelete={() => onDelete(s)} light />}
            </div>
            <div className="flex flex-col justify-center text-center sm:text-left w-full py-4">
              <h3 className="text-4xl lg:text-5xl font-bold mb-4 text-[#2C2C2C]">{s.name}</h3>
              <p className="font-mono text-base text-[#737373] uppercase tracking-widest">{s.englishName}</p>
              {s.responsibility && (
                <p className="mt-8 text-[#737373] font-light leading-relaxed break-keep">{s.responsibility}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const ELDER_GROUPS = [
  { key: '시무', label: '시무장로', en: 'Ruling Elder' },
  { key: '원로', label: '원로장로', en: 'Senior Elder' },
  { key: '은퇴', label: '은퇴장로', en: 'Retired Elder' },
]

function ElderCard({ s, isAdmin, onEdit, onDelete }) {
  return (
    <div className="p-8 md:p-10 lg:p-12 flex flex-col items-center text-center group hover:bg-[#F4F2EA] transition-colors relative">
      <div className="w-full aspect-square bg-[#E5E5E5] mb-6 relative flex items-center justify-center overflow-hidden">
        {s.imagePath
          ? <img src={s.imagePath} alt={s.name} className="w-full h-full object-cover" />
          : <User size={32} className="text-[#A3A3A3] group-hover:text-[#2C2C2C] transition-colors" />
        }
        {isAdmin && <AdminActions onEdit={() => onEdit(s)} onDelete={() => onDelete(s)} light />}
      </div>
      <h3 className="text-xl font-bold mb-1 text-[#2C2C2C]">{s.name}</h3>
      <p className="font-mono text-xs text-[#737373] uppercase tracking-widest">{s.englishName}</p>
    </div>
  )
}

function ElderSection({ elders, isAdmin, onEdit, onDelete }) {
  if (elders.length === 0) return null

  const groups = ELDER_GROUPS.map((g) => ({
    ...g,
    members: elders.filter((e) => (e.customPosition ?? '시무') === g.key),
  })).filter((g) => g.members.length > 0)

  return (
    <section className="border-b border-[#E5E5E5] bg-[#FAF9F6]">
      <div className="max-w-[1600px] mx-auto p-8 md:p-16 lg:p-24 border-x border-b border-[#E5E5E5] bg-[#F4F2EA]">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#2C2C2C]">장로</h2>
        <span className="text-xs font-mono text-[#737373] uppercase tracking-widest block">Elder</span>
      </div>
      {groups.map((g) => (
        <div key={g.key} className="max-w-[1600px] mx-auto border-x border-b border-[#E5E5E5]">
          <div className="px-8 md:px-16 lg:px-24 py-6 flex items-baseline gap-4 border-b border-[#E5E5E5] bg-[#FAF9F6]">
            <h3 className="text-lg font-bold text-[#2C2C2C]">{g.label}</h3>
            <span className="text-xs font-mono text-[#A3A3A3] uppercase tracking-widest">{g.en}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x divide-y divide-[#E5E5E5]">
            {g.members.map((s) => (
              <ElderCard key={s.id} s={s} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

function EmployeeSection({ employees, isAdmin, onEdit, onDelete }) {
  if (employees.length === 0) return null
  return (
    <section className="border-b border-[#E5E5E5] bg-[#FAF9F6]">
      <div className="max-w-[1600px] mx-auto p-8 md:p-16 lg:p-24 border-x border-b border-[#E5E5E5]">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#2C2C2C]">교회 직원</h2>
        <span className="text-xs font-mono text-[#737373] uppercase tracking-widest block">Staff</span>
      </div>
      <div className={`max-w-[1600px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x divide-y divide-[#E5E5E5] border-x border-[#E5E5E5]`}>
        {employees.map((s) => (
          <div key={s.id} className="p-8 md:p-10 lg:p-12 flex flex-col items-center text-center group hover:bg-[#F4F2EA] transition-colors relative">
            <div className="w-full aspect-square bg-[#E5E5E5] mb-6 relative flex items-center justify-center overflow-hidden">
              {s.imagePath
                ? <img src={s.imagePath} alt={s.name} className="w-full h-full object-cover" />
                : <User size={32} className="text-[#A3A3A3] group-hover:text-[#2C2C2C] transition-colors" />
              }
              {isAdmin && <AdminActions onEdit={() => onEdit(s)} onDelete={() => onDelete(s)} light />}
            </div>
            <h3 className="text-xl font-bold mb-1 text-[#2C2C2C]">{s.name}</h3>
            <p className="font-mono text-xs text-[#737373] mb-3 uppercase tracking-widest">{s.englishName}</p>
            {s.responsibility && <p className="text-xs text-[#737373] break-keep leading-relaxed">{s.responsibility}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

function EmptyTabMessage({ onAdd }) {
  return (
    <div className="py-32 text-center border-x border-[#E5E5E5] max-w-[1600px] mx-auto">
      <p className="text-[#737373] font-light mb-6">등록된 데이터가 없습니다.</p>
      <button onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 bg-[#171717] text-white text-[14px] font-medium rounded mx-auto hover:bg-[#2C2C2C] transition-colors">
        <PlusCircle size={18} /> 직원 등록
      </button>
    </div>
  )
}

/* ── 메인 페이지 ── */
export default function StaffPage() {
  const queryClient = useQueryClient()
  const { isAdminOrOperator } = useAuthStore()
  const isAdmin = isAdminOrOperator?.() ?? false

  const [activeTab, setActiveTab]     = useState('minister')
  const [editTarget, setEditTarget]   = useState(null)
  const [createOpen, setCreateOpen]   = useState(false)

  const { data: allStaff = [], isLoading } = useQuery({
    queryKey: ['staff', 'all'],
    queryFn: staffApi.getAll,
    staleTime: 60_000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => staffApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  })

  const handleDelete = (s) => {
    if (!confirm(`"${s.name}" 정보를 삭제하시겠습니까?`)) return
    deleteMutation.mutate(s.id)
  }

  const handleSaved = () => {
    setEditTarget(null)
    setCreateOpen(false)
    queryClient.invalidateQueries({ queryKey: ['staff'] })
  }

  // 분류
  const sorted       = [...allStaff].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
  const seniorPastor = sorted.find((s) => s.isSeniorPastor)
  const pastors      = sorted.filter((s) => s.category === 'MINISTER' && s.position === 'PASTOR' && !s.isSeniorPastor && !s.customPosition)
  const evangelists  = sorted.filter((s) => s.category === 'MINISTER' && s.position === 'EVANGELIST' && !s.customPosition)
  // MINISTER 중 담임목사·부목사·전도사에 해당하지 않는 나머지 (협력목사, customPosition 있는 전도사 등)
  const coopPastors  = sorted.filter((s) => {
    if (s.category !== 'MINISTER' || s.isSeniorPastor) return false
    return !pastors.some((p) => p.id === s.id) && !evangelists.some((e) => e.id === s.id)
  })
  const elders       = sorted.filter((s) => s.category === 'ELDER')
  const employees    = sorted.filter((s) => s.category === 'EMPLOYEE')

  return (
    <div className="bg-[#FAF9F6] text-[#2C2C2C]">
      <HeroSection />

      {/* 관리자 추가 버튼 */}
      {isAdmin && (
        <div className="bg-[#171717] border-b border-[#333]">
          <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24 py-4 flex justify-end">
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#171717] text-[12px] font-semibold rounded hover:bg-[#FAF9F6] transition-colors">
              <PlusCircle size={16} /> 새 직원 등록
            </button>
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="border-b border-[#E5E5E5] bg-[#FAF9F6] sticky top-20 z-40">
        <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] flex justify-center gap-12 md:gap-24 font-mono px-6 overflow-x-auto">
          {[
            { key: 'minister', label: '교역자', show: seniorPastor || pastors.length > 0 || evangelists.length > 0 || coopPastors.length > 0 },
            { key: 'elder',    label: '장로',   show: elders.length > 0 },
            { key: 'employee', label: '교회 직원', show: employees.length > 0 },
          ].filter((t) => t.show || isAdmin).map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`py-6 text-sm font-bold tracking-widest border-b-2 whitespace-nowrap transition-colors ${
                activeTab === t.key
                  ? 'border-[#171717] text-[#2C2C2C]'
                  : 'border-transparent text-[#737373] hover:text-[#2C2C2C]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="py-32 text-center text-[#737373] font-light text-lg border-x border-[#E5E5E5] max-w-[1600px] mx-auto">
          불러오는 중...
        </div>
      )}

      {/* 섹션 — 활성 탭만 렌더링 */}
      {activeTab === 'minister' && (
        <>
          <SeniorPastorSection staff={seniorPastor} isAdmin={isAdmin} onEdit={setEditTarget} onDelete={handleDelete} />
          <AssociatePastorSection pastors={pastors} isAdmin={isAdmin} onEdit={setEditTarget} onDelete={handleDelete} />
          <EvangelistSection evangelists={evangelists} isAdmin={isAdmin} onEdit={setEditTarget} onDelete={handleDelete} />
          <CoopPastorSection coopPastors={coopPastors} isAdmin={isAdmin} onEdit={setEditTarget} onDelete={handleDelete} />
          {!isLoading && !seniorPastor && pastors.length === 0 && evangelists.length === 0 && coopPastors.length === 0 && isAdmin && (
            <EmptyTabMessage onAdd={() => setCreateOpen(true)} />
          )}
        </>
      )}
      {activeTab === 'elder' && (
        <>
          <ElderSection elders={elders} isAdmin={isAdmin} onEdit={setEditTarget} onDelete={handleDelete} />
          {!isLoading && elders.length === 0 && isAdmin && <EmptyTabMessage onAdd={() => setCreateOpen(true)} />}
        </>
      )}
      {activeTab === 'employee' && (
        <>
          <EmployeeSection employees={employees} isAdmin={isAdmin} onEdit={setEditTarget} onDelete={handleDelete} />
          {!isLoading && employees.length === 0 && isAdmin && <EmptyTabMessage onAdd={() => setCreateOpen(true)} />}
        </>
      )}

      {/* 모달 */}
      {editTarget  && <StaffModal staff={editTarget}  onClose={() => setEditTarget(null)} onSaved={handleSaved} />}
      {createOpen  && <StaffModal                     onClose={() => setCreateOpen(false)} onSaved={handleSaved} />}
    </div>
  )
}
