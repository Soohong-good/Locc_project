import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminDepartments,
  getWorshipYouTubeStatus,
  updateDepartmentVideo,
  updateAllDepartmentVideos,
  updateNewYearPlaylist,
  updateNewYearVideo,
  updateBibleSchoolPlaylist,
  updateBibleSchoolVideo,
  getSermonPlaylistStatus,
  refreshSermonPlaylist,
  refreshAllSermonPlaylists,
} from '@/api/youtube'

// ── 공통 컴포넌트 ────────────────────────────────────────────────────────

/** 토스트 메시지 */
const Toast = ({ message, type, onClose }) => {
  if (!message) return null
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {message}
      <button onClick={onClose} className="ml-3 opacity-70 hover:opacity-100">✕</button>
    </div>
  )
}

/** 현재 영상 표시 뱃지 */
const VideoStatus = ({ videoId, title }) => {
  if (!videoId) {
    return <span className="text-xs text-gray-400 italic">영상 미설정</span>
  }
  return (
    <div className="flex items-center gap-2">
      <img
        src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
        alt="썸네일"
        className="w-16 h-11 object-cover rounded"
      />
      <div>
        <p className="text-xs text-gray-500">현재 영상</p>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-600 hover:underline line-clamp-1"
        >
          {title || videoId}
        </a>
      </div>
    </div>
  )
}

/** 갱신 버튼 */
const UpdateButton = ({ onClick, isPending, label = '갱신' }) => (
  <button
    onClick={onClick}
    disabled={isPending}
    className="px-4 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors whitespace-nowrap"
  >
    {isPending ? '갱신 중...' : label}
  </button>
)

// ── 섹션: 부서 YouTube ───────────────────────────────────────────────────

const DepartmentSection = ({ onToast }) => {
  const queryClient = useQueryClient()

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['admin', 'youtube', 'departments'],
    queryFn: getAdminDepartments,
  })

  const [pendingCode, setPendingCode] = useState(null)

  const singleMutation = useMutation({
    mutationFn: updateDepartmentVideo,
    onMutate: (code) => setPendingCode(code),
    onSuccess: (_, code) => {
      onToast(`${code} 부서 영상이 갱신되었습니다`, 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'departments'] })
    },
    onError: () => onToast('갱신 중 오류가 발생했습니다', 'error'),
    onSettled: () => setPendingCode(null),
  })

  const allMutation = useMutation({
    mutationFn: updateAllDepartmentVideos,
    onSuccess: () => {
      onToast('전체 부서 영상이 갱신되었습니다', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'departments'] })
    },
    onError: () => onToast('전체 갱신 중 오류가 발생했습니다', 'error'),
  })

  // youtubeChannelId가 있는 부서만 표시
  const activeDepartments = departments.filter((d) => d.youtubeChannelId)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">부서 YouTube</h2>
          <p className="text-xs text-gray-500 mt-0.5">매일 오전 6시 자동 갱신 · 부서별 채널 기준</p>
        </div>
        <UpdateButton
          onClick={() => allMutation.mutate()}
          isPending={allMutation.isPending}
          label="전체 일괄 갱신"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="py-10 text-center text-gray-400 text-sm">불러오는 중...</div>
        ) : activeDepartments.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">채널 ID가 등록된 부서가 없습니다</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">부서</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">현재 영상</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">갱신</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeDepartments.map((dept) => (
                <tr key={dept.code} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{dept.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{dept.code}</p>
                  </td>
                  <td className="px-4 py-3">
                    <VideoStatus videoId={dept.latestVideoId} title={dept.latestVideoTitle} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <UpdateButton
                      onClick={() => singleMutation.mutate(dept.code)}
                      isPending={pendingCode === dept.code}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── 섹션: 주일예배 / 기타예배 재생목록 ────────────────────────────────────

/** 탭 정의: 주일예배와 기타예배를 그룹으로 묶어 표시 */
const SERMON_GROUPS = [
  {
    groupKey: 'sunday',
    groupLabel: '주일예배',
    items: [
      { key: 'sunday-morning-1', label: '주일오전 1부' },
      { key: 'sunday-morning-2', label: '주일오전 2부' },
      { key: 'sunday-afternoon', label: '주일오후' },
    ],
  },
  {
    groupKey: 'weekday',
    groupLabel: '기타예배',
    items: [
      { key: 'wednesday', label: '수요예배' },
      { key: 'friday',    label: '금요기도회' },
    ],
  },
]

const SermonPlaylistSection = ({ onToast }) => {
  const queryClient = useQueryClient()
  const [pendingKey, setPendingKey] = useState(null)
  const [isRefreshingAll, setIsRefreshingAll] = useState(false)

  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ['admin', 'youtube', 'sermon-playlists'],
    queryFn: getSermonPlaylistStatus,
  })

  // key → status 맵으로 변환
  const statusMap = Object.fromEntries(
    playlists.map((p) => [p.key, p])
  )

  const refreshMutation = useMutation({
    mutationFn: refreshSermonPlaylist,
    onMutate: (key) => setPendingKey(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'sermon-playlists'] })
      onToast('최신 영상이 갱신되었습니다', 'success')
    },
    onError: () => onToast('갱신 중 오류가 발생했습니다', 'error'),
    onSettled: () => setPendingKey(null),
  })

  // 전체 일괄 갱신
  const handleRefreshAll = async () => {
    setIsRefreshingAll(true)
    try {
      await refreshAllSermonPlaylists()
      queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'sermon-playlists'] })
      onToast('전체 예배 최신 영상이 갱신되었습니다', 'success')
    } catch {
      onToast('일괄 갱신 중 오류가 발생했습니다', 'error')
    } finally {
      setIsRefreshingAll(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">주일예배 / 기타예배</h2>
          <p className="text-xs text-gray-500 mt-0.5">재생목록 ID는 application.yml에서 관리 · 최신 영상 수동 갱신 가능</p>
        </div>
        <UpdateButton
          onClick={handleRefreshAll}
          isPending={isRefreshingAll}
          label="전체 일괄 갱신"
        />
      </div>

      <div className="space-y-4">
        {SERMON_GROUPS.map((group) => (
          <div key={group.groupKey} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* 그룹 헤더 */}
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {group.groupLabel}
              </span>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-gray-400 text-sm">불러오는 중...</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs w-32">예배</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs">현재 최신 영상</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs hidden md:table-cell">재생목록 ID</th>
                    <th className="px-4 py-2.5 text-right font-medium text-gray-500 text-xs w-24">갱신</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {group.items.map(({ key, label }) => {
                    const s = statusMap[key]
                    return (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-800 text-sm">{label}</span>
                        </td>
                        <td className="px-4 py-4">
                          {s?.latestVideoId ? (
                            <div className="flex items-center gap-3">
                              <img
                                src={`https://img.youtube.com/vi/${s.latestVideoId}/mqdefault.jpg`}
                                alt="썸네일"
                                className="w-24 h-14 object-cover rounded flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs text-gray-400 mb-0.5">현재 영상</p>
                                <a
                                  href={`https://www.youtube.com/watch?v=${s.latestVideoId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-blue-600 hover:underline line-clamp-2 leading-snug"
                                >
                                  {s.latestVideoTitle || s.latestVideoId}
                                </a>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">영상 미설정</span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {s?.playlistId ? (
                            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 break-all">
                              {s.playlistId}
                            </code>
                          ) : (
                            <span className="text-xs text-red-400 italic">미설정</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <UpdateButton
                            onClick={() => refreshMutation.mutate(key)}
                            isPending={pendingKey === key}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 섹션: 예배 YouTube ───────────────────────────────────────────────────

const WorshipYouTubeCard = ({ title, badge, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {badge && (
        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">{badge}</span>
      )}
    </div>
    {children}
  </div>
)

const PlaylistInput = ({ placeholder, value, onChange, onSave, isSaving }) => (
  <div className="flex gap-2 mt-3">
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      onClick={onSave}
      disabled={isSaving || !value.trim()}
      className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors whitespace-nowrap"
    >
      {isSaving ? '저장 중...' : '저장'}
    </button>
  </div>
)

const WorshipSection = ({ onToast }) => {
  const queryClient = useQueryClient()
  const [newYearPlaylistInput, setNewYearPlaylistInput] = useState('')
  const [bibleSchoolPlaylistInput, setBibleSchoolPlaylistInput] = useState('')

  const { data: worshipStatus, isLoading } = useQuery({
    queryKey: ['admin', 'youtube', 'worship'],
    queryFn: getWorshipYouTubeStatus,
  })

  const newYearPlaylistMutation = useMutation({
    mutationFn: () => updateNewYearPlaylist(newYearPlaylistInput.trim()),
    onSuccess: () => {
      onToast('재생목록 ID가 저장되었습니다', 'success')
      setNewYearPlaylistInput('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'worship'] })
    },
    onError: () => onToast('저장 중 오류가 발생했습니다', 'error'),
  })

  const newYearVideoMutation = useMutation({
    mutationFn: updateNewYearVideo,
    onSuccess: () => {
      onToast('송구영신예배 영상이 갱신되었습니다', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'worship'] })
      queryClient.invalidateQueries({ queryKey: ['newyear'] })
      queryClient.invalidateQueries({ queryKey: ['worship', 'newyear'] })
    },
    onError: () => onToast('갱신 중 오류가 발생했습니다', 'error'),
  })

  const bibleSchoolPlaylistMutation = useMutation({
    mutationFn: () => updateBibleSchoolPlaylist(bibleSchoolPlaylistInput.trim()),
    onSuccess: () => {
      onToast('재생목록 ID가 저장되었습니다', 'success')
      setBibleSchoolPlaylistInput('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'worship'] })
    },
    onError: () => onToast('저장 중 오류가 발생했습니다', 'error'),
  })

  const bibleSchoolVideoMutation = useMutation({
    mutationFn: updateBibleSchoolVideo,
    onSuccess: () => {
      onToast('성경학교 영상이 갱신되었습니다', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'youtube', 'worship'] })
    },
    onError: () => onToast('갱신 중 오류가 발생했습니다', 'error'),
  })

  if (isLoading) {
    return <div className="py-6 text-center text-gray-400 text-sm">불러오는 중...</div>
  }

  const { newYear, bibleSchool } = worshipStatus ?? {}

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">예배 YouTube</h2>
        <p className="text-xs text-gray-500 mt-0.5">재생목록 ID 설정 후 수동 갱신</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* 송구영신예배 */}
        <WorshipYouTubeCard title="송구영신예배" badge="수동 갱신">
          <VideoStatus videoId={newYear?.latestVideoId} title={newYear?.latestVideoTitle} />

          {newYear?.youtubePlaylistId && (
            <p className="mt-2 text-xs text-gray-400">
              재생목록: <code className="bg-gray-100 px-1 rounded">{newYear.youtubePlaylistId}</code>
            </p>
          )}

          <PlaylistInput
            placeholder="재생목록 ID (PLxxxxxxxxxx)"
            value={newYearPlaylistInput}
            onChange={setNewYearPlaylistInput}
            onSave={() => newYearPlaylistMutation.mutate()}
            isSaving={newYearPlaylistMutation.isPending}
          />

          <div className="mt-3">
            <UpdateButton
              onClick={() => newYearVideoMutation.mutate()}
              isPending={newYearVideoMutation.isPending}
              label="최신 영상 갱신"
            />
          </div>
        </WorshipYouTubeCard>

        {/* 성경학교 */}
        <WorshipYouTubeCard title="성경학교" badge="매주 토요일 자동">
          <VideoStatus videoId={bibleSchool?.latestVideoId} title={bibleSchool?.latestVideoTitle} />

          {bibleSchool?.youtubePlaylistId && (
            <p className="mt-2 text-xs text-gray-400">
              재생목록: <code className="bg-gray-100 px-1 rounded">{bibleSchool.youtubePlaylistId}</code>
            </p>
          )}

          <PlaylistInput
            placeholder="재생목록 ID (PLxxxxxxxxxx)"
            value={bibleSchoolPlaylistInput}
            onChange={setBibleSchoolPlaylistInput}
            onSave={() => bibleSchoolPlaylistMutation.mutate()}
            isSaving={bibleSchoolPlaylistMutation.isPending}
          />

          <div className="mt-3">
            <UpdateButton
              onClick={() => bibleSchoolVideoMutation.mutate()}
              isPending={bibleSchoolVideoMutation.isPending}
              label="최신 영상 수동 갱신"
            />
          </div>
        </WorshipYouTubeCard>

      </div>

      {/* 안내 */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
        <p className="font-medium mb-1">📋 재생목록 ID 찾는 방법</p>
        <p>YouTube 재생목록 URL에서 <code className="bg-blue-100 px-1 rounded">list=</code> 뒤의 문자열을 입력하세요.</p>
        <p className="mt-0.5 text-blue-500">예: youtube.com/playlist?list=<strong>PLxxxxxxxxxxxxxxx</strong></p>
      </div>
    </div>
  )
}

// ── 메인 페이지 ──────────────────────────────────────────────────────────

const AdminYouTubePage = () => {
  const [toast, setToast] = useState({ message: '', type: '' })

  const showToast = (message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: '' }), 4000)
  }

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-xl font-bold text-gray-900">YouTube 관리</h1>
        <p className="text-sm text-gray-500 mt-1">부서 채널 · 예배 영상 수동 갱신</p>
      </div>

      <DepartmentSection onToast={showToast} />
      <SermonPlaylistSection onToast={showToast} />
      <WorshipSection onToast={showToast} />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
    </div>
  )
}

export default AdminYouTubePage
