import client from './client'

/**
 * 팝업 API
 */

/** 전체 팝업 목록 조회 (관리자용) */
export const getAllPopups = async (isActive = null) => {
  const params = isActive !== null ? { isActive } : {}
  const { data } = await client.get('/api/admin/popups', { params })
  return data.data
}

/** 팝업 상세 조회 */
export const getPopupDetail = async (id) => {
  const { data } = await client.get(`/api/popups/${id}`)
  return data.data
}

/** 팝업 생성 */
export const createPopup = async (formData) => {
  const { data } = await client.post('/api/popups', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data.data
}

/** 팝업 수정 */
export const updatePopup = async ({ id, formData }) => {
  const { data } = await client.put(`/api/popups/${id}`, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data.data
}

/** 팝업 삭제 */
export const deletePopup = async (id) => {
  const { data } = await client.delete(`/api/popups/${id}`)
  return data.data
}

/** 활성화 토글 */
export const togglePopupActive = async (id) => {
  const { data } = await client.patch(`/api/popups/${id}/toggle`)
  return data.data
}

/** 에디터 이미지 업로드 */
export const uploadPopupImage = async (file) => {
  const form = new FormData()
  form.append('image', file)
  const { data } = await client.post('/api/popups/upload-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data.url
}

/** 활성 팝업 목록 (공개용) */
export const getActivePopups = async () => {
  const { data } = await client.get('/api/popups/active')
  return data.data
}
