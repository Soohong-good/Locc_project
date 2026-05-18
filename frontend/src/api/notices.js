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

// 고정 공지사항 목록
export const getPinnedNotices = async () => {
  const { data } = await client.get('/api/notices/pinned')
  return data.data
}

// 최신 공지사항 N건 (메인페이지용)
export const getLatestNotices = async (size = 3) => {
  const { data } = await client.get('/api/notices', { params: { page: 0, size } })
  return data.data
}

// 생성 (multipart)
export const createNotice = async (formData) => {
  const { data } = await client.post('/api/notices', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

// 수정 (multipart)
export const updateNotice = async ({ id, formData }) => {
  const { data } = await client.put(`/api/notices/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

// 에디터 이미지 업로드
export const uploadNoticeImage = async (file) => {
  const form = new FormData()
  form.append('image', file)
  const { data } = await client.post('/api/notices/upload-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data.url
}

// 삭제 (관리자)
export const deleteNotice = async (id) => {
  const { data } = await client.delete(`/api/notices/${id}`)
  return data
}
