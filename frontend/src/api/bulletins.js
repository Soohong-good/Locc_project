import client from './client'

/** 주보 목록 조회 (페이지네이션 + 검색) */
export const getBulletins = ({ page = 0, size = 10, keyword } = {}) => {
  const params = { page, size }
  if (keyword?.trim()) params.keyword = keyword.trim()
  return client.get('/api/bulletin', { params }).then((r) => r.data.data)
}

/** 주보 단건 상세 조회 */
export const getBulletin = (id) =>
  client.get(`/api/bulletin/${id}`).then((r) => r.data.data)

/** 조회수 증가 */
export const increaseBulletinViews = (id) =>
  client.post(`/api/bulletin/${id}/view`).then((r) => r.data)

/** 주보 등록 (ADMIN, FormData — PDF + title + content) */
export const createBulletin = (formData) =>
  client.post('/api/bulletin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.data)

/** 주보 삭제 (ADMIN) */
export const deleteBulletin = (id) =>
  client.delete(`/api/bulletin/${id}`).then((r) => r.data)
