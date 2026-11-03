import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminDepartments,
  getSermonPlaylistStatus,
  getWorshipYouTubeStatus,
  updateDepartmentVideo,
  updateAllDepartmentVideos,
  updateDepartmentChannelId,
  refreshSermonPlaylist,
  refreshAllSermonPlaylists,
  updateSermonPlaylistId,
  updateNewYearPlaylist,
  updateNewYearVideo,
  updateBibleSchoolPlaylist,
  updateBibleSchoolVideo,
} from '@/api/youtube'
import { getChoirVideos, syncChoirPlaylist } from '@/api/choir'
import useAuthStore from '@/stores/authStore'
import {
  MagnifyingGlass, ArrowClockwise, Warning, CheckCircle, X,
  CaretRight, VideoCamera, Gear, Link, ListDashes,
  YoutubeLogo, Bell, Question,
} from '@phosphor-icons/react'
import { extractYouTubeId as extractVideoId } from '@/utils/youtube'

/* ── 토스트 ── */
function Toast({ toast, onClose }) {
  if (!toast) return null
  const isOk = toast.type === 'success'
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-[14px] font-medium transition-all ${
      isOk ? 'bg-[#1e293b] text-white' : 'bg-[#ffdad6] text-[#93000a]'
    }`}>
      {isOk ? <CheckCircle size={20} /> : <Warning size={20} />}
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={16} /></button>
    </div>
  )
}

/* ── 영상 카드 ── */
function VideoCard({ title, subLabel, videoId, videoTitle, onRefresh, isPending }) {
  const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null
  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-sm transition-all ${
      isPending ? 'border-2 border-dashed border-[#855300]' : 'border border-[#c5c6cd] hover:shadow-md'
    }`}>
      <div className="relative aspect-video bg-[#e5eeff]">
        {isPending ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <ArrowClockwise size={36} className="text-[#855300] animate-spin" />
            <span className="text-[11px] font-bold text-[#855300] uppercase tracking-wider">갱신 중...</span>
          </div>
        ) : thumbUrl ? (
          <img src={thumbUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <VideoCamera size={36} className="text-[#75777d]" />
            <span className="text-[11px] text-[#75777d]">영상 미설정</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
            isPending ? 'bg-[#fea619]/20 text-[#684000]' :
            videoId ? 'bg-[#e5eeff] text-[#45474c]' : 'bg-[#ffdad6]/40 text-[#93000a]'
          }`}>
            {isPending ? '갱신중' : videoId ? '연결됨' : '미설정'}
          </span>
          {subLabel && <span className="text-[10px] text-[#45474c]">{subLabel}</span>}
        </div>
        <h5 className="font-bold text-[14px] text-[#0b1c30] leading-snug">{title}</h5>
        {videoTitle
          ? <p className="text-[12px] text-[#45474c] mt-1 mb-2 line-clamp-2 leading-snug min-h-[2.5rem]">{videoTitle}</p>
          : <p className="text-[12px] text-[#c5c6cd] italic mt-1 mb-2 min-h-[2.5rem]">영상 정보 없음</p>
        }
        <div className="flex items-center justify-between border-t border-[#c5c6cd] pt-3">
          {videoId
            ? <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer"
                className="text-[11px] text-[#855300] hover:underline truncate max-w-[140px]">{videoId}</a>
            : <span className="text-[11px] text-[#75777d] italic">미연결</span>
          }
          {onRefresh && (
            <button onClick={onRefresh} disabled={isPending}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#091426] text-white text-[11px] font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shrink-0">
              <ArrowClockwise size={12} className={isPending ? 'animate-spin' : ''} />갱신
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── 인라인 편집 행 ── */
function EditableRow({ label, currentValue, placeholder, onSave, isSaving }) {
  const [editing, setEditing] = useState(false)
  const [input, setInput]     = useState('')
  const handleSave = () => {
    if (!input.trim()) return
    onSave(input.trim(), () => { setEditing(false); setInput('') })
  }
  return (
    <div className="py-3 border-b border-[#e5eeff] last:border-0">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="text-[13px] font-medium text-[#0b1c30] shrink-0">{label}</span>
        <div className="flex items-center gap-2 min-w-0">
          {currentValue
            ? <code className="bg-[#e5eeff] px-1.5 py-0.5 rounded text-[#091426] text-[10px] truncate max-w-[180px]">{currentValue}</code>
            : <span className="text-[11px] text-[#93000a] italic">미설정</span>
          }
          {!editing && (
            <button onClick={() => { setEditing(true); setInput(currentValue ?? '') }}
              className="shrink-0 text-[11px] text-[#091426] underline hover:opacity-70">수정</button>
          )}
        </div>
      </div>
      {editing && (
        <div className="flex gap-2 mt-1.5">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder} autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="flex-1 border border-[#c5c6cd] rounded-lg px-3 py-1.5 text-[12px] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#091426]/20" />
          <button onClick={handleSave} disabled={!input.trim() || isSaving}
            className="px-3 py-1.5 bg-[#091426] text-white text-[11px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 whitespace-nowrap">
            {isSaving ? '저장 중...' : '저장'}
          </button>
          <button onClick={() => { setEditing(false); setInput('') }}
            className="px-2 py-1.5 text-[#45474c] hover:text-[#0b1c30]"><X size={14} /></button>
        </div>
      )}
    </div>
  )
}

/* ── API 설정 모달 ── */
const SERMON_PLAYLIST_LABELS = {
  'sunday-morning-1': '주일오전 1부', 'sunday-morning-2': '주일오전 2부',
  'sunday-afternoon': '주일오후', 'wednesday': '수요예배', 'friday': '금요기도회',
  'retreat': '수련회/특강',
}

function ApiSettingsModal({ onClose, departments, playlists, worshipStatus, onToast, queryClient }) {
  const [nyInput, setNyInput] = useState('')
  const [bsInput, setBsInput] = useState('')
  const [savingPlaylistKey, setSavingPlaylistKey] = useState(null)
  const [savingDeptCode, setSavingDeptCode] = useState(null)
  const { newYear, bibleSchool } = worshipStatus ?? {}

  const nyPlaylistMut = useMutation({
    mutationFn: () => updateNewYearPlaylist(nyInput.trim()),
    onSuccess: () => { onToast('송구영신예배 재생목록 ID가 저장되었습니다', 'success'); setNyInput(''); queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'worship'] }) },
    onError: () => onToast('저장 중 오류가 발생했습니다', 'error'),
  })

  const bsPlaylistMut = useMutation({
    mutationFn: () => updateBibleSchoolPlaylist(bsInput.trim()),
    onSuccess: () => { onToast('성경학교 재생목록 ID가 저장되었습니다', 'success'); setBsInput(''); queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'worship'] }) },
    onError: () => onToast('저장 중 오류가 발생했습니다', 'error'),
  })

  const handleSaveSermonPlaylist = async (key, newId, onDone) => {
    setSavingPlaylistKey(key)
    try {
      await updateSermonPlaylistId(key, newId)
      onToast(`${SERMON_PLAYLIST_LABELS[key]} 재생목록 ID가 저장되었습니다`, 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'sermon-playlists'] })
      onDone()
    } catch { onToast('저장 중 오류가 발생했습니다', 'error') }
    finally { setSavingPlaylistKey(null) }
  }

  const handleSaveDeptChannel = async (code, newId, onDone) => {
    setSavingDeptCode(code)
    try {
      await updateDepartmentChannelId(code, newId)
      onToast('채널 ID가 저장되었습니다', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'departments'] })
      onDone()
    } catch { onToast('저장 중 오류가 발생했습니다', 'error') }
    finally { setSavingDeptCode(null) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#c5c6cd]">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-[#eff4ff] rounded-lg"><Gear size={20} className="text-[#091426]" /></span>
            <div>
              <h3 className="text-[16px] font-bold text-[#0b1c30]">API 설정</h3>
              <p className="text-[11px] text-[#45474c]">채널 ID · 재생목록 ID 관리</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#45474c] hover:text-[#0b1c30] transition-colors"><X size={22} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* 특별 예배 재생목록 */}
          <section>
            <div className="flex items-center gap-2 mb-3"><Link size={16} className="text-[#855300]" /><h4 className="text-[13px] font-bold text-[#0b1c30] uppercase tracking-wide">특별 예배 재생목록</h4></div>
            <div className="bg-[#f8f9ff] border border-[#c5c6cd] rounded-xl px-4 py-1">
              <div className="py-3 border-b border-[#e5eeff]">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="text-[13px] font-medium text-[#0b1c30] shrink-0">송구영신예배</span>
                  <div className="flex items-center gap-2 min-w-0">
                    {newYear?.youtubePlaylistId
                      ? <code className="bg-[#e5eeff] px-1.5 py-0.5 rounded text-[#091426] text-[10px] truncate max-w-[180px]">{newYear.youtubePlaylistId}</code>
                      : <span className="text-[11px] text-[#93000a] italic">미설정</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={nyInput} onChange={(e) => setNyInput(e.target.value)} placeholder="새 재생목록 ID (PLxxxxxxxxxx)"
                    onKeyDown={(e) => e.key === 'Enter' && nyPlaylistMut.mutate()}
                    className="flex-1 border border-[#c5c6cd] rounded-lg px-3 py-1.5 text-[12px] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#091426]/20" />
                  <button onClick={() => nyPlaylistMut.mutate()} disabled={!nyInput.trim() || nyPlaylistMut.isPending}
                    className="px-3 py-1.5 bg-[#091426] text-white text-[11px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 whitespace-nowrap">
                    {nyPlaylistMut.isPending ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="text-[13px] font-medium text-[#0b1c30] shrink-0">성경학교</span>
                  <div className="flex items-center gap-2 min-w-0">
                    {bibleSchool?.youtubePlaylistId
                      ? <code className="bg-[#e5eeff] px-1.5 py-0.5 rounded text-[#091426] text-[10px] truncate max-w-[180px]">{bibleSchool.youtubePlaylistId}</code>
                      : <span className="text-[11px] text-[#93000a] italic">미설정</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={bsInput} onChange={(e) => setBsInput(e.target.value)} placeholder="새 재생목록 ID (PLxxxxxxxxxx)"
                    onKeyDown={(e) => e.key === 'Enter' && bsPlaylistMut.mutate()}
                    className="flex-1 border border-[#c5c6cd] rounded-lg px-3 py-1.5 text-[12px] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#091426]/20" />
                  <button onClick={() => bsPlaylistMut.mutate()} disabled={!bsInput.trim() || bsPlaylistMut.isPending}
                    className="px-3 py-1.5 bg-[#091426] text-white text-[11px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 whitespace-nowrap">
                    {bsPlaylistMut.isPending ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            </div>
          </section>
          {/* 예배 재생목록 */}
          <section>
            <div className="flex items-center gap-2 mb-3"><ListDashes size={16} className="text-[#45474c]" /><h4 className="text-[13px] font-bold text-[#0b1c30] uppercase tracking-wide">예배 재생목록</h4></div>
            <div className="bg-[#f8f9ff] border border-[#c5c6cd] rounded-xl px-4 py-1">
              {playlists.map((p) => (
                <EditableRow key={p.key} label={SERMON_PLAYLIST_LABELS[p.key] ?? p.key}
                  currentValue={p.playlistId} placeholder="재생목록 ID (PLxxxxxxxxxx)"
                  isSaving={savingPlaylistKey === p.key}
                  onSave={(newId, onDone) => handleSaveSermonPlaylist(p.key, newId, onDone)} />
              ))}
            </div>
          </section>
          {/* 부서 채널 ID */}
          <section>
            <div className="flex items-center gap-2 mb-3"><YoutubeLogo size={16} className="text-[#ba1a1a]" /><h4 className="text-[13px] font-bold text-[#0b1c30] uppercase tracking-wide">부서 YouTube 채널 ID</h4></div>
            <div className="bg-[#f8f9ff] border border-[#c5c6cd] rounded-xl px-4 py-1">
              {departments.length === 0
                ? <p className="py-4 text-center text-[12px] text-[#75777d] italic">부서가 없습니다</p>
                : departments.map((d) => (
                  <EditableRow key={d.code} label={d.name} currentValue={d.youtubeChannelId}
                    placeholder="채널 ID (@channelname 또는 UCxxxxxxxxxx)"
                    isSaving={savingDeptCode === d.code}
                    onSave={(newId, onDone) => handleSaveDeptChannel(d.code, newId, onDone)} />
                ))
              }
            </div>
          </section>
        </div>
        <div className="px-6 py-4 border-t border-[#c5c6cd] flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 bg-[#091426] text-white text-[12px] font-semibold rounded-lg hover:opacity-90 transition-all">닫기</button>
        </div>
      </div>
    </div>
  )
}

/* ── 검색 결과 뷰 ── */
const ALL_SERMON_ITEMS = [
  { key: 'sunday-morning-1', label: '주일오전 1부' }, { key: 'sunday-morning-2', label: '주일오전 2부' },
  { key: 'sunday-afternoon', label: '주일오후' }, { key: 'wednesday', label: '수요예배' }, { key: 'friday', label: '금요기도회' },
  { key: 'retreat', label: '수련회/특강' },
]

function SearchResults({ keyword, departments, playlists, worshipStatus, onRefreshDept, onRefreshPlaylist, pendingDeptCode, pendingPlaylistKey }) {
  const kw = keyword.toLowerCase()
  const deptResults = departments.filter((d) =>
    d.name?.toLowerCase().includes(kw) || d.code?.toLowerCase().includes(kw) || d.latestVideoTitle?.toLowerCase().includes(kw))
  const playlistMap = Object.fromEntries(playlists.map((p) => [p.key, p]))
  const sermonResults = ALL_SERMON_ITEMS.filter(({ key, label }) => {
    const p = playlistMap[key]
    return label.toLowerCase().includes(kw) || p?.latestVideoTitle?.toLowerCase().includes(kw) || p?.playlistId?.toLowerCase().includes(kw)
  })
  const { newYear, bibleSchool } = worshipStatus ?? {}
  const worshipResults = [
    { id: 'newyear', label: '송구영신예배', data: newYear },
    { id: 'bibleschool', label: '성경학교', data: bibleSchool },
  ].filter(({ label, data }) => label.includes(kw) || data?.latestVideoTitle?.toLowerCase().includes(kw))
  const total = deptResults.length + sermonResults.length + worshipResults.length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MagnifyingGlass size={20} className="text-[#45474c]" />
        <h4 className="text-[18px] font-semibold text-[#0b1c30]">"{keyword}" 검색 결과</h4>
        <span className="text-[13px] text-[#45474c]">총 {total}건</span>
      </div>
      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-[#75777d]">
          <MagnifyingGlass size={48} className="text-[#c5c6cd] mb-3" />
          <p className="text-[14px]">검색 결과가 없습니다.</p>
        </div>
      )}
      {deptResults.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-[#45474c] uppercase tracking-widest mb-3">부서 채널 ({deptResults.length})</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {deptResults.map((dept) => (
              <VideoCard key={dept.code} title={dept.name} subLabel={dept.code}
                videoId={dept.latestVideoId} videoTitle={dept.latestVideoTitle}
                onRefresh={() => onRefreshDept(dept.code)} isPending={pendingDeptCode === dept.code} />
            ))}
          </div>
        </div>
      )}
      {sermonResults.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-[#45474c] uppercase tracking-widest mb-3">예배 재생목록 ({sermonResults.length})</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {sermonResults.map(({ key, label }) => {
              const p = playlistMap[key]
              return (
                <VideoCard key={key} title={label} subLabel={p?.playlistId ? `PL: ${p.playlistId.slice(0, 12)}...` : '미설정'}
                  videoId={p?.latestVideoId} videoTitle={p?.latestVideoTitle}
                  onRefresh={() => onRefreshPlaylist(key)} isPending={pendingPlaylistKey === key} />
              )
            })}
          </div>
        </div>
      )}
      {worshipResults.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-[#45474c] uppercase tracking-widest mb-3">특별 예배 ({worshipResults.length})</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {worshipResults.map(({ id, label, data }) => (
              <VideoCard key={id} title={label}
                subLabel={data?.youtubePlaylistId ? `PL: ${data.youtubePlaylistId.slice(0, 12)}...` : '재생목록 미설정'}
                videoId={data?.latestVideoId} videoTitle={data?.latestVideoTitle} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 메인 ── */
const SERMON_GROUPS = [
  { groupKey: 'sunday', groupLabel: '주일예배', items: [
    { key: 'sunday-morning-1', label: '주일오전 1부' },
    { key: 'sunday-morning-2', label: '주일오전 2부' },
    { key: 'sunday-afternoon', label: '주일오후' },
  ]},
  { groupKey: 'weekday', groupLabel: '수요·금요예배', items: [
    { key: 'wednesday', label: '수요예배' },
    { key: 'friday', label: '금요기도회' },
  ]},
  { groupKey: 'retreat', groupLabel: '수련회/특강', items: [
    { key: 'retreat', label: '수련회/특강' },
  ]},
]

const CHOIR_CATEGORIES = ['시온찬양대', '할렐루야찬양대', '주영광찬양대', '주일오후찬양대']

export default function AdminYouTubePage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const [activeSection, setActiveSection]         = useState('departments')
  const [syncingAll, setSyncingAll]               = useState(false)
  const [syncingAllDepts, setSyncingAllDepts]     = useState(false)
  const [toast, setToast]                         = useState(null)
  const [pendingDeptCode, setPendingDeptCode]     = useState(null)
  const [pendingPlaylistKey, setPendingPlaylistKey] = useState(null)
  const [nyInput, setNyInput]                     = useState('')
  const [bsInput, setBsInput]                     = useState('')
  const [searchKeyword, setSearchKeyword]         = useState('')
  const [showApiSettings, setShowApiSettings]     = useState(false)

  const showToast = (message, type) => { setToast({ message, type }); setTimeout(() => setToast(null), 4000) }

  const { data: departments = [], isLoading: deptLoading } = useQuery({
    queryKey: ['admin', 'youtube', 'departments'],
    queryFn: getAdminDepartments, staleTime: 60_000,
  })
  const { data: playlists = [], isLoading: playlistLoading } = useQuery({
    queryKey: ['admin', 'youtube', 'sermon-playlists'],
    queryFn: getSermonPlaylistStatus, staleTime: 60_000,
  })
  const { data: worshipStatus, isLoading: worshipLoading } = useQuery({
    queryKey: ['admin', 'youtube', 'worship'],
    queryFn: getWorshipYouTubeStatus, staleTime: 60_000,
  })
  const { data: choirData, isLoading: choirLoading } = useQuery({
    queryKey: ['admin', 'youtube', 'choir'],
    queryFn: () => getChoirVideos({ page: 0, size: 20 }), staleTime: 60_000,
  })

  const choirSyncMut = useMutation({
    mutationFn: syncChoirPlaylist,
    onSuccess: (result) => {
      showToast(`찬양대 영상 동기화 완료 (신규 ${result?.created ?? 0}건)`, 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'choir'] })
    },
    onError: () => showToast('찬양대 동기화 중 오류가 발생했습니다', 'error'),
  })

  const syncDept = useMutation({
    mutationFn: updateDepartmentVideo,
    onMutate: (code) => setPendingDeptCode(code),
    onSuccess: (_, code) => { showToast(`${code} 부서 영상이 갱신되었습니다`, 'success'); queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'departments'] }) },
    onError: () => showToast('갱신 중 오류가 발생했습니다', 'error'),
    onSettled: () => setPendingDeptCode(null),
  })

  const refreshPlaylist = useMutation({
    mutationFn: refreshSermonPlaylist,
    onMutate: (key) => setPendingPlaylistKey(key),
    onSuccess: () => { showToast('최신 영상이 갱신되었습니다', 'success'); queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'sermon-playlists'] }) },
    onError: () => showToast('갱신 중 오류가 발생했습니다', 'error'),
    onSettled: () => setPendingPlaylistKey(null),
  })

  const nyPlaylistMut = useMutation({
    mutationFn: () => updateNewYearPlaylist(nyInput.trim()),
    onSuccess: () => { showToast('재생목록 ID가 저장되었습니다', 'success'); setNyInput(''); queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'worship'] }) },
    onError: () => showToast('저장 중 오류가 발생했습니다', 'error'),
  })
  const nyVideoMut = useMutation({
    mutationFn: updateNewYearVideo,
    onSuccess: () => { showToast('송구영신예배 영상이 갱신되었습니다', 'success'); queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'worship'] }); queryClient.invalidateQueries({ queryKey: ['newyear'] }); queryClient.invalidateQueries({ queryKey: ['worship', 'newyear'] }) },
    onError: () => showToast('갱신 중 오류가 발생했습니다', 'error'),
  })

  const bsPlaylistMut = useMutation({
    mutationFn: () => updateBibleSchoolPlaylist(bsInput.trim()),
    onSuccess: () => { showToast('재생목록 ID가 저장되었습니다', 'success'); setBsInput(''); queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'worship'] }) },
    onError: () => showToast('저장 중 오류가 발생했습니다', 'error'),
  })
  const bsVideoMut = useMutation({
    mutationFn: updateBibleSchoolVideo,
    onSuccess: () => { showToast('성경학교 영상이 갱신되었습니다', 'success'); queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'worship'] }) },
    onError: () => showToast('갱신 중 오류가 발생했습니다', 'error'),
  })

  const handleSyncAllDepts = async () => {
    setSyncingAllDepts(true)
    try {
      await updateAllDepartmentVideos()
      queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'departments'] })
      showToast('전체 부서 영상이 갱신되었습니다', 'success')
    } catch { showToast('전체 부서 갱신 중 오류가 발생했습니다', 'error') }
    finally { setSyncingAllDepts(false) }
  }

  const handleSyncAll = async () => {
    setSyncingAll(true)
    try {
      await updateAllDepartmentVideos()
      const { failed } = await refreshAllSermonPlaylists()
      queryClient.invalidateQueries({ queryKey: ['admin', 'youtube'] })
      if (failed.length === 0) showToast('전체 갱신이 완료되었습니다', 'success')
      else showToast(`일부 재생목록 갱신에 실패했습니다 (${failed.join(', ')})`, 'error')
    } catch { showToast('전체 갱신 중 오류가 발생했습니다', 'error') }
    finally { setSyncingAll(false) }
  }

  const activeDepts   = departments.filter((d) => d.youtubeChannelId)
  const playlistCount = playlists.length || 5
  const totalSections = activeDepts.length + playlistCount + 2 + CHOIR_CATEGORIES.length
  const playlistMap   = Object.fromEntries(playlists.map((p) => [p.key, p]))
  const { newYear, bibleSchool } = worshipStatus ?? {}
  const choirVideos = choirData?.content ?? []
  const choirLatestByCategory = Object.fromEntries(
    CHOIR_CATEGORIES.map((cat) => [cat, choirVideos.find((v) => v.choirName === cat)])
  )
  const choirTotal = choirData?.pageInfo?.totalElements ?? 0
  const SECTIONS = [
    { key: 'departments', label: '부서 채널',    count: activeDepts.length },
    { key: 'sermons',     label: '예배 재생목록', count: playlistCount },
    { key: 'worship',     label: '특별 예배',     count: 2 },
    { key: 'choir',       label: '찬양대',       count: CHOIR_CATEGORIES.length },
  ]
  const isSearching = searchKeyword.trim().length > 0

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* 상단 헤더 */}
      <header className="sticky top-0 z-40 flex flex-wrap md:flex-nowrap justify-between items-center gap-y-2 md:h-16 py-3 md:py-0 px-4 md:px-6 border-b border-[#c5c6cd] bg-[#f8f9ff]/80 backdrop-blur-md shrink-0">
        <h2 className="text-[16px] md:text-[20px] font-extrabold text-[#0b1c30] whitespace-nowrap">YouTube 관리</h2>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
          <button onClick={handleSyncAll} disabled={syncingAll}
            className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-[#091426] text-white text-[11px] md:text-[12px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-60 transition-all shadow-md whitespace-nowrap">
            <ArrowClockwise size={16} className={syncingAll ? 'animate-spin' : ''} />
            {syncingAll ? '갱신 중...' : '전체 갱신'}
          </button>
          <button onClick={() => setShowApiSettings(true)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 border border-[#c5c6cd] bg-white text-[#0b1c30] text-[11px] md:text-[12px] font-semibold rounded-lg hover:bg-[#e5eeff] transition-all whitespace-nowrap">
            <Gear size={16} /> API 설정
          </button>
          <div className="border-l border-[#c5c6cd] pl-3 flex items-center gap-3">
            <div className="text-right">
              <p className="text-[12px] font-bold text-[#0b1c30]">{user?.name ?? '관리자'}</p>
              <p className="text-[10px] text-[#45474c] uppercase tracking-wider">Admin</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center text-white text-[12px] font-bold border border-[#d8e3fb]">
              {(user?.name ?? 'A')[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#cbd5e1] [&::-webkit-scrollbar-thumb]:rounded-full">
        <main className="p-8 space-y-8 max-w-[1440px] mx-auto w-full">

          {/* 페이지 헤더 */}
          <section>
            <nav className="flex items-center gap-2 text-[12px] text-[#45474c] mb-2">
              <span>Admin</span><CaretRight size={12} /><span className="text-[#091426] font-bold">YouTube 관리</span>
            </nav>
            <h2 className="text-[32px] font-semibold text-[#0b1c30] tracking-tight leading-10">YouTube 관리</h2>
            <p className="text-[14px] text-[#45474c] mt-1">부서 채널 · 예배 재생목록 영상을 갱신하고 관리합니다.</p>
          </section>

          {/* 통계 카드 */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: '연결된 부서', value: `${activeDepts.length}개`, badge: 'HEALTHY', badgeColor: 'bg-[#e5eeff] text-[#091426]', iconColor: 'text-[#ba1a1a]', iconBg: 'bg-[#ffdad6]/30' },
              { label: '예배 재생목록', value: `${playlistCount}개`, badge: 'AUTO', badgeColor: 'text-[#855300]', iconColor: 'text-[#855300]', iconBg: 'bg-[#fea619]/10' },
              { label: '특별 예배', value: '2개', badge: '수동 갱신', badgeColor: 'text-[#45474c]', iconColor: 'text-[#091426]', iconBg: 'bg-[#091426]/5' },
              { label: '전체 섹션', value: `${totalSections}건`, badge: 'ACTIVE', badgeColor: 'text-[#45474c]', iconColor: 'text-[#45474c]', iconBg: 'bg-[#e5eeff]' },
            ].map((c) => (
              <div key={c.label} className="bg-white border border-[#c5c6cd] p-6 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <span className={`p-2 rounded-lg ${c.iconBg}`}><YoutubeLogo size={22} className={c.iconColor} /></span>
                  {c.badge && <span className={`text-[12px] font-bold px-2 py-1 rounded ${c.badgeColor}`}>{c.badge}</span>}
                </div>
                <div className="mt-4">
                  <p className="text-[12px] font-medium text-[#45474c] uppercase tracking-tight">{c.label}</p>
                  <h3 className="text-[24px] font-semibold text-[#0b1c30] mt-1 leading-tight">{c.value}</h3>
                </div>
              </div>
            ))}
          </section>

          {/* 검색 + 섹션 탭 */}
          <div className="mb-4 px-3 pb-3">
            <div className="relative max-w-sm">
              <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#45474c] pointer-events-none" />
              <input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="부서명, 예배명, 영상 검색..."
                className="w-full pl-8 pr-8 py-2 bg-[#eff4ff] border border-[#c5c6cd] rounded-lg text-[12px] text-[#0b1c30] placeholder:text-[#75777d] focus:outline-none focus:ring-2 focus:ring-[#091426]/20 transition-all" />
              {searchKeyword && (
                <button onClick={() => setSearchKeyword('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#45474c] hover:text-[#0b1c30]">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* 콘텐츠 영역 */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 섹션 탭 */}
            <div className="lg:col-span-3 bg-white border border-[#c5c6cd] rounded-xl overflow-hidden flex flex-col shadow-sm">
              <div className="p-4 border-b border-[#c5c6cd] bg-[#eff4ff]">
                <h5 className="font-bold text-[14px] text-[#0b1c30]">{isSearching ? '검색 모드' : '섹션'}</h5>
              </div>
              <div className="flex-1 p-2 space-y-1">
                {SECTIONS.map(({ key, label, count }) => (
                  <button key={key} onClick={() => { setActiveSection(key); setSearchKeyword('') }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all text-[13px] font-medium ${
                      !isSearching && activeSection === key
                        ? 'bg-[#1e293b] text-white'
                        : isSearching ? 'text-[#c5c6cd] cursor-pointer hover:bg-[#dce9ff] hover:text-[#45474c]'
                        : 'text-[#45474c] hover:bg-[#dce9ff]'
                    }`}>
                    <span>{label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      !isSearching && activeSection === key ? 'bg-white/20 text-white' : 'bg-[#c5c6cd]/40 text-[#45474c]'
                    }`}>{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 콘텐츠 */}
            <div className="lg:col-span-9 space-y-6 pb-8 pr-1">
              {isSearching && (
                <SearchResults keyword={searchKeyword} departments={departments} playlists={playlists} worshipStatus={worshipStatus}
                  onRefreshDept={(code) => syncDept.mutate(code)} onRefreshPlaylist={(key) => refreshPlaylist.mutate(key)}
                  pendingDeptCode={pendingDeptCode} pendingPlaylistKey={pendingPlaylistKey} />
              )}

              {/* 부서 채널 */}
              {!isSearching && activeSection === 'departments' && (
                <div>
                  <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#f8f9ff]/95 backdrop-blur-sm py-2 z-10">
                    <div className="flex items-center gap-3"><div className="w-2 h-6 bg-[#855300] rounded-full" /><h4 className="text-[18px] font-semibold text-[#0b1c30]">부서 채널</h4></div>
                    <button onClick={handleSyncAllDepts} disabled={syncingAllDepts}
                      className="flex items-center gap-1.5 text-[#091426] font-bold text-[12px] hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                      {syncingAllDepts ? '갱신 중...' : '전체 일괄 갱신'}<ArrowClockwise size={14} className={syncingAllDepts ? 'animate-spin' : ''} />
                    </button>
                  </div>
                  {deptLoading
                    ? <div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => (<div key={i} className="bg-white border border-[#c5c6cd] rounded-xl overflow-hidden animate-pulse"><div className="aspect-video bg-[#e5eeff]" /><div className="p-4 space-y-2"><div className="h-3 bg-[#e5eeff] rounded w-1/2" /><div className="h-4 bg-[#e5eeff] rounded w-3/4" /></div></div>))}</div>
                    : activeDepts.length === 0
                    ? <div className="flex flex-col items-center justify-center py-16 text-[#45474c]"><YoutubeLogo size={48} className="text-[#c5c6cd] mb-3" /><p className="text-[14px]">YouTube 채널이 연결된 부서가 없습니다.</p></div>
                    : <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {activeDepts.map((dept) => (
                          <VideoCard key={dept.code} title={dept.name} subLabel={dept.code}
                            videoId={dept.latestVideoId} videoTitle={dept.latestVideoTitle}
                            onRefresh={() => syncDept.mutate(dept.code)} isPending={pendingDeptCode === dept.code} />
                        ))}
                      </div>
                  }
                </div>
              )}

              {/* 예배 재생목록 */}
              {!isSearching && activeSection === 'sermons' && (
                <div className="space-y-8">
                  {SERMON_GROUPS.map((group) => (
                    <div key={group.groupKey}>
                      <div className="flex items-center gap-3 mb-4 sticky top-0 bg-[#f8f9ff]/95 backdrop-blur-sm py-2 z-10">
                        <div className="w-2 h-6 bg-[#091426] rounded-full" /><h4 className="text-[18px] font-semibold text-[#0b1c30]">{group.groupLabel}</h4>
                      </div>
                      {playlistLoading
                        ? <div className="grid grid-cols-3 gap-4">{[...Array(group.items.length)].map((_, i) => (<div key={i} className="bg-white border border-[#c5c6cd] rounded-xl overflow-hidden animate-pulse"><div className="aspect-video bg-[#e5eeff]" /><div className="p-4 space-y-2"><div className="h-3 bg-[#e5eeff] rounded w-1/2" /><div className="h-4 bg-[#e5eeff] rounded w-3/4" /></div></div>))}</div>
                        : <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {group.items.map(({ key, label }) => {
                              const p = playlistMap[key]
                              return (
                                <VideoCard key={key} title={label} subLabel={p?.playlistId ? `PL: ${p.playlistId.slice(0, 12)}...` : '재생목록 미설정'}
                                  videoId={p?.latestVideoId} videoTitle={p?.latestVideoTitle}
                                  onRefresh={() => refreshPlaylist.mutate(key)} isPending={pendingPlaylistKey === key} />
                              )
                            })}
                          </div>
                      }
                    </div>
                  ))}
                </div>
              )}

              {/* 특별 예배 */}
              {!isSearching && activeSection === 'worship' && (
                <div>
                  <div className="flex items-center gap-3 mb-6 sticky top-0 bg-[#f8f9ff]/95 backdrop-blur-sm py-2 z-10">
                    <div className="w-2 h-6 bg-[#fea619] rounded-full" /><h4 className="text-[18px] font-semibold text-[#0b1c30]">특별 예배</h4>
                  </div>
                  {worshipLoading
                    ? <div className="grid grid-cols-2 gap-6">{[...Array(2)].map((_, i) => (<div key={i} className="bg-white border border-[#c5c6cd] rounded-xl overflow-hidden animate-pulse"><div className="aspect-video bg-[#e5eeff]" /><div className="p-6 space-y-3"><div className="h-4 bg-[#e5eeff] rounded w-1/3" /><div className="h-3 bg-[#e5eeff] rounded w-full" /></div></div>))}</div>
                    : <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 송구영신예배 */}
                        <div className="bg-white border border-[#c5c6cd] rounded-xl overflow-hidden shadow-sm">
                          <div className="relative aspect-video bg-[#e5eeff]">
                            {nyVideoMut.isPending
                              ? <div className="w-full h-full flex flex-col items-center justify-center gap-3"><ArrowClockwise size={36} className="text-[#855300] animate-spin" /><span className="text-[11px] font-bold text-[#855300]">갱신 중...</span></div>
                              : newYear?.latestVideoId
                              ? <img src={`https://img.youtube.com/vi/${newYear.latestVideoId}/mqdefault.jpg`} alt="송구영신예배" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex flex-col items-center justify-center gap-2"><VideoCamera size={36} className="text-[#75777d]" /><span className="text-[11px] text-[#75777d]">영상 미설정</span></div>
                            }
                          </div>
                          <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-[16px] text-[#0b1c30]">송구영신예배</h5>
                              <span className="text-[11px] text-[#45474c] bg-[#eff4ff] px-2 py-1 rounded-full">수동 갱신</span>
                            </div>
                            {newYear?.latestVideoTitle && <p className="text-[13px] text-[#45474c] line-clamp-2">{newYear.latestVideoTitle}</p>}
                            {newYear?.youtubePlaylistId && <p className="text-[11px] text-[#75777d]">재생목록: <code className="bg-[#e5eeff] px-1.5 py-0.5 rounded text-[#091426]">{newYear.youtubePlaylistId}</code></p>}
                            <div className="flex gap-2">
                              <input type="text" value={nyInput} onChange={(e) => setNyInput(e.target.value)} placeholder="재생목록 ID (PLxxxxxxxxxx)"
                                className="flex-1 border border-[#c5c6cd] rounded-lg px-3 py-2 text-[13px] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#091426]/20" />
                              <button onClick={() => nyPlaylistMut.mutate()} disabled={!nyInput.trim() || nyPlaylistMut.isPending}
                                className="px-3 py-2 bg-[#1e293b] text-white text-[12px] rounded-lg hover:opacity-90 disabled:opacity-50 transition-all whitespace-nowrap">
                                {nyPlaylistMut.isPending ? '저장 중...' : '저장'}
                              </button>
                            </div>
                            <button onClick={() => nyVideoMut.mutate()} disabled={nyVideoMut.isPending}
                              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#091426] text-white text-[12px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all">
                              <ArrowClockwise size={14} className={nyVideoMut.isPending ? 'animate-spin' : ''} />최신 영상 갱신
                            </button>
                          </div>
                        </div>
                        {/* 성경학교 */}
                        <div className="bg-white border border-[#c5c6cd] rounded-xl overflow-hidden shadow-sm">
                          <div className="relative aspect-video bg-[#e5eeff]">
                            {bsVideoMut.isPending
                              ? <div className="w-full h-full flex flex-col items-center justify-center gap-3"><ArrowClockwise size={36} className="text-[#855300] animate-spin" /><span className="text-[11px] font-bold text-[#855300]">갱신 중...</span></div>
                              : bibleSchool?.latestVideoId
                              ? <img src={`https://img.youtube.com/vi/${bibleSchool.latestVideoId}/mqdefault.jpg`} alt="성경학교" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex flex-col items-center justify-center gap-2"><VideoCamera size={36} className="text-[#75777d]" /><span className="text-[11px] text-[#75777d]">영상 미설정</span></div>
                            }
                          </div>
                          <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-[16px] text-[#0b1c30]">성경학교</h5>
                              <span className="text-[11px] text-[#45474c] bg-[#eff4ff] px-2 py-1 rounded-full">매주 토요일 자동</span>
                            </div>
                            {bibleSchool?.latestVideoTitle && <p className="text-[13px] text-[#45474c] line-clamp-2">{bibleSchool.latestVideoTitle}</p>}
                            {bibleSchool?.youtubePlaylistId && <p className="text-[11px] text-[#75777d]">재생목록: <code className="bg-[#e5eeff] px-1.5 py-0.5 rounded text-[#091426]">{bibleSchool.youtubePlaylistId}</code></p>}
                            <div className="flex gap-2">
                              <input type="text" value={bsInput} onChange={(e) => setBsInput(e.target.value)} placeholder="재생목록 ID (PLxxxxxxxxxx)"
                                className="flex-1 border border-[#c5c6cd] rounded-lg px-3 py-2 text-[13px] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#091426]/20" />
                              <button onClick={() => bsPlaylistMut.mutate()} disabled={!bsInput.trim() || bsPlaylistMut.isPending}
                                className="px-3 py-2 bg-[#1e293b] text-white text-[12px] rounded-lg hover:opacity-90 disabled:opacity-50 transition-all whitespace-nowrap">
                                {bsPlaylistMut.isPending ? '저장 중...' : '저장'}
                              </button>
                            </div>
                            <button onClick={() => bsVideoMut.mutate()} disabled={bsVideoMut.isPending}
                              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#091426] text-white text-[12px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all">
                              <ArrowClockwise size={14} className={bsVideoMut.isPending ? 'animate-spin' : ''} />최신 영상 수동 갱신
                            </button>
                          </div>
                        </div>
                      </div>
                  }
                  <div className="mt-6 p-4 bg-[#eff4ff] border border-[#c5c6cd] rounded-xl text-[12px] text-[#45474c]">
                    <p className="font-semibold text-[#0b1c30] mb-1">재생목록 ID 찾는 방법</p>
                    <p>YouTube 재생목록 URL에서 <code className="bg-white px-1.5 py-0.5 rounded border border-[#c5c6cd]">list=</code> 뒤의 문자열을 입력하세요.</p>
                    <p className="mt-0.5 text-[#75777d]">예: youtube.com/playlist?list=<strong className="text-[#091426]">PLxxxxxxxxxxxxxxx</strong></p>
                  </div>
                </div>
              )}

              {/* 찬양대 */}
              {!isSearching && activeSection === 'choir' && (
                <div>
                  <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#f8f9ff]/95 backdrop-blur-sm py-2 z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-6 bg-[#ba1a1a] rounded-full" />
                      <h4 className="text-[18px] font-semibold text-[#0b1c30]">찬양대</h4>
                      <span className="text-[11px] text-[#45474c] bg-[#eff4ff] px-2 py-1 rounded-full">매주 월요일 자동 · 총 {choirTotal}건</span>
                    </div>
                    <button onClick={() => choirSyncMut.mutate()} disabled={choirSyncMut.isPending}
                      className="flex items-center gap-1.5 text-[#091426] font-bold text-[12px] hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                      {choirSyncMut.isPending ? '동기화 중...' : '수동 동기화'}<ArrowClockwise size={14} className={choirSyncMut.isPending ? 'animate-spin' : ''} />
                    </button>
                  </div>
                  {choirLoading
                    ? <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => (<div key={i} className="bg-white border border-[#c5c6cd] rounded-xl overflow-hidden animate-pulse"><div className="aspect-video bg-[#e5eeff]" /><div className="p-4 space-y-2"><div className="h-3 bg-[#e5eeff] rounded w-1/2" /><div className="h-4 bg-[#e5eeff] rounded w-3/4" /></div></div>))}</div>
                    : <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {CHOIR_CATEGORIES.map((cat) => {
                          const v = choirLatestByCategory[cat]
                          return (
                            <VideoCard key={cat} title={cat}
                              subLabel={v ? '최근 영상' : '영상 없음'}
                              videoId={extractVideoId(v?.videoUrl)} videoTitle={v?.title} />
                          )
                        })}
                      </div>
                  }
                  <div className="mt-6 p-4 bg-[#eff4ff] border border-[#c5c6cd] rounded-xl text-[12px] text-[#45474c]">
                    <p className="font-semibold text-[#0b1c30] mb-1">찬양대 자동 동기화 안내</p>
                    <p>매주 월요일 새벽 3시(KST) YouTube 재생목록에서 새 영상을 자동으로 가져옵니다. 재생목록 ID는 서버 설정(<code className="bg-white px-1.5 py-0.5 rounded border border-[#c5c6cd]">YOUTUBE_PLAYLIST_CHOIR</code>)으로 관리되며, 급하게 반영이 필요하면 위 "수동 동기화" 버튼을 눌러 즉시 가져올 수 있습니다.</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* 하단 푸터 */}
      <footer className="h-12 shrink-0 flex items-center justify-between px-6 border-t border-[#c5c6cd] bg-white text-[11px] text-[#45474c] font-medium">
        <div>© 2026 그리스도사랑교회 관리자 시스템</div>
      </footer>

      {showApiSettings && (
        <ApiSettingsModal onClose={() => setShowApiSettings(false)} departments={departments} playlists={playlists}
          worshipStatus={worshipStatus} onToast={showToast} queryClient={queryClient} />
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
