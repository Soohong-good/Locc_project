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

/** 주보 수정 (ADMIN, FormData — title + content + thumbnail 선택) */
export const updateBulletin = (id, formData) =>
  client.put(`/api/bulletin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.data)

/** 본문 에디터 이미지 업로드 → 이미지 URL 반환 */
export const uploadBulletinImage = async (file) => {
  const form = new FormData()
  form.append('image', file)
  const { data } = await client.post('/api/bulletin/upload-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data.url
}

/** 주보 삭제 (ADMIN) */
export const deleteBulletin = (id) =>
  client.delete(`/api/bulletin/${id}`).then((r) => r.data)
