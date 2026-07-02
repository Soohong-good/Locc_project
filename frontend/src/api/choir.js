import client from './client'

export const getChoirVideos = async ({ page = 0, size = 12, choirName } = {}) => {
  const { data } = await client.get('/api/choir', { params: { page, size, choirName } })
  return data.data
}

// 관리자 수동 동기화 (YouTube 재생목록 → choir_video 신규분 반영)
export const syncChoirPlaylist = async () => {
  const { data } = await client.post('/api/admin/choir/sync')
  return data.data
}
