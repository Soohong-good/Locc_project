import client from './client'

/**
 * 설교 API
 */

// 목록 조회 (SearchCondition 기반)
export const getSermons = async ({ page = 0, size = 10, keyword, category, preacher } = {}) => {
  const { data } = await client.get('/api/sermons', { params: { page, size, keyword, category, preacher } })
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

// 카테고리별 최신 설교 단건 조회 (쿼리파라미터 사용 - Cloudflare 한국어 경로 문제 회피)
export const getLatestSermonByCategory = async (category) => {
  const { data } = await client.get('/api/sermons', { params: { category, size: 1, page: 0 } })
  return data.data?.content?.[0] ?? null
}

// 주일 2부 최신 설교 단건
export const getLatestSundayMorning2 = async () => {
  const { data } = await client.get('/api/sermons/sunday-morning/2', { params: { page: 0, size: 1 } })
  return data.data
}

// 카테고리별 목록
export const getSermonsByCategory = async ({ category, page = 0, size = 10, keyword, preacher } = {}) => {
  const { data } = await client.get(`/api/sermons/category/${encodeURIComponent(category)}`, {
    params: { page, size, keyword, preacher },
  })
  return data.data
}

// 주일오전 (serviceNumber: 1 | 2)
export const getSundayMorningData = async ({ serviceNumber = 1, page = 0, size = 9, keyword, preacher } = {}) => {
  const { data } = await client.get(`/api/sermons/sunday-morning/${serviceNumber}`, {
    params: { page, size, keyword, preacher },
  })
  return data.data
}

// 주일오후
export const getSundayAfternoonData = async ({ page = 0, size = 9, keyword, preacher } = {}) => {
  const { data } = await client.get('/api/sermons/sunday-afternoon', {
    params: { page, size, keyword, preacher },
  })
  return data.data
}

// 기타예배 (type: 'wednesday' | 'friday')
export const getWeekdayData = async ({ type = 'wednesday', page = 0, size = 9, keyword, preacher } = {}) => {
  const { data } = await client.get(`/api/sermons/weekday/${type}`, {
    params: { page, size, keyword, preacher },
  })
  return data.data
}

// 훈련용 메시지 (serviceNumber: 1=성경학교, 2=기초복음메시지, 3=하이델베르크, 4=웨스트민스터)
export const getTrainingMessageData = async ({ serviceNumber = 1, page = 0, size = 9, keyword, preacher } = {}) => {
  const { data } = await client.get('/api/sermons/training-message', {
    params: { serviceNumber, page, size, keyword, preacher },
  })
  return data.data
}

// 생성 (multipart)
export const createSermon = async (formData) => {
  const { data } = await client.post('/api/sermons', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

// 수정 (multipart)
export const updateSermon = async ({ id, formData }) => {
  const { data } = await client.put(`/api/sermons/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

// 에디터 이미지 업로드
export const uploadSermonImage = async (file) => {
  const form = new FormData()
  form.append('image', file)
  const { data } = await client.post('/api/sermons/upload-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data.url
}

// 삭제 (관리자)
export const deleteSermon = async (id) => {
  const { data } = await client.delete(`/api/sermons/${id}`)
  return data
}

// 송구영신예배 최신 정보
export const getNewYearVideo = async () => {
  const { data } = await client.get('/api/newyear')
  return data.data
}
