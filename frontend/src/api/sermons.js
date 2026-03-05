import client from './client'

/**
 * 설교 API
 */

// 목록 조회
export const getSermons = async ({ page = 0, size = 10, keyword, category } = {}) => {
  const { data } = await client.get('/api/sermons', { params: { page, size, keyword, category } })
  return data.data
}

// 상세 조회
export const getSermon = async (id) => {
  const { data } = await client.get(`/api/sermons/${id}`)
  return data.data
}

// 최신 설교 조회
export const getLatestSermons = async (limit = 5) => {
  const { data } = await client.get('/api/sermons/latest', { params: { limit } })
  return data.data
}

// 카테고리별 목록
export const getSermonsByCategory = async ({ category, page = 0, size = 10 }) => {
  const { data } = await client.get(`/api/sermons/category/${category}`, { params: { page, size } })
  return data.data
}

// 삭제 (관리자)
export const deleteSermon = async (id) => {
  const { data } = await client.delete(`/api/sermons/${id}`)
  return data
}
