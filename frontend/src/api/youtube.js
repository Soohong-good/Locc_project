import client from './client'

// ── 현황 조회 ────────────────────────────────────────────────────────────

/** 부서 전체 목록 (YouTube 현황 포함) */
export const getAdminDepartments = async () => {
  const { data } = await client.get('/api/admin/youtube/departments')
  return data.data
}

/** 예배 YouTube 현황 (송구영신예배 + 성경학교) */
export const getWorshipYouTubeStatus = async () => {
  const { data } = await client.get('/api/admin/youtube/worship')
  return data.data
}

// ── 부서 유튜브 갱신 ──────────────────────────────────────────────────────

/** 특정 부서 최신 영상 갱신 */
export const updateDepartmentVideo = async (departmentCode) => {
  const { data } = await client.post(`/api/department/${departmentCode}/youtube/update`)
  return data
}

/** 전체 부서 일괄 갱신 */
export const updateAllDepartmentVideos = async () => {
  const { data } = await client.post('/api/department/youtube/update-all')
  return data
}

// ── 송구영신예배 ─────────────────────────────────────────────────────────

/** 송구영신예배 재생목록 ID 설정 */
export const updateNewYearPlaylist = async (playlistId) => {
  const { data } = await client.put('/api/newyear/playlist', { playlistId })
  return data
}

/** 송구영신예배 최신 영상 수동 갱신 */
export const updateNewYearVideo = async () => {
  const { data } = await client.post('/api/newyear/update-video')
  return data
}

// ── 성경학교 ─────────────────────────────────────────────────────────────

/** 성경학교 재생목록 ID 설정 */
export const updateBibleSchoolPlaylist = async (playlistId) => {
  const { data } = await client.put('/api/bibleschool/playlist', { playlistId })
  return data
}

/** 성경학교 최신 영상 수동 갱신 */
export const updateBibleSchoolVideo = async () => {
  const { data } = await client.post('/api/bibleschool/update-video')
  return data
}

// ── 채널 ID / 재생목록 ID 설정 ───────────────────────────────────────────

/** 부서 YouTube 채널 ID 수정 */
export const updateDepartmentChannelId = async (code, channelId) => {
  const { data } = await client.patch(`/api/admin/youtube/departments/${code}/channel`, { channelId })
  return data
}

/** 예배 재생목록 ID 수정 (DB override) */
export const updateSermonPlaylistId = async (playlistKey, playlistId) => {
  const { data } = await client.patch(`/api/admin/youtube/sermon-playlists/${playlistKey}/playlist-id`, { playlistId })
  return data
}

// ── 주일예배 / 수요·금요예배 재생목록 ────────────────────────────────────

/** 예배 재생목록 현황 조회 (주일오전1부/2부, 주일오후, 수요, 금요) */
export const getSermonPlaylistStatus = async () => {
  const { data } = await client.get('/api/admin/youtube/sermon-playlists')
  return data.data
}

/** 모든 예배 재생목록 최신 영상 일괄 갱신 (순차 호출)
 *  개별 실패가 있어도 끝까지 진행하되, 성공/실패 키를 분리해 반환한다.
 *  @returns {Promise<{ succeeded: string[], failed: string[] }>}
 */
export const refreshAllSermonPlaylists = async () => {
  const keys = ['sunday-morning-1', 'sunday-morning-2', 'sunday-afternoon', 'wednesday', 'friday']
  const succeeded = []
  const failed = []
  for (const key of keys) {
    try {
      await refreshSermonPlaylist(key)
      succeeded.push(key)
    } catch {
      failed.push(key)
    }
  }
  return { succeeded, failed }
}

/** 특정 예배 재생목록 최신 영상 수동 갱신
 *  @param {string} playlistKey - 'sunday-morning-1' | 'sunday-morning-2' | 'sunday-afternoon' | 'wednesday' | 'friday'
 */
export const refreshSermonPlaylist = async (playlistKey) => {
  const { data } = await client.post(`/api/admin/youtube/sermon-playlists/${playlistKey}/refresh`)
  return data.data
}
