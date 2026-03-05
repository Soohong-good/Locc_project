import client from './client'

/**
 * 공지사항 API
 */

// 목록 조회
export const getNotices = async ({ page = 0, size = 10, keyword } = {}) => {
  const { data } = await client.get('/api/notices', { params: { page, size, keyword } })
  return data.data
}

// 상세 조회
export const getNotice = async (id) => {
  const { data } = await client.get(`/api/notices/${id}`)
  return data.data
}

// 조회수 증가
export const increaseNoticeViews = async (id) => {
  await client.post(`/api/notices/${id}/views`)
}

// 고정 토글 (관리자)
export const toggleNoticePin = async (id) => {
  const { data } = await client.patch(`/api/notices/${id}/pin`)
  return data
}

// 삭제 (관리자)
export const deleteNotice = async (id) => {
  const { data } = await client.delete(`/api/notices/${id}`)
  return data
}
