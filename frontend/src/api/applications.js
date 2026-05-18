import client from './client'

// ── 공통 ──────────────────────────────────────────────────────────────────────

/** 활성 카테고리 목록 (신청 폼 드롭다운용) */
export const getApplicationCategories = async () => {
  const { data } = await client.get('/api/facility-applications/categories')
  return data.data
}

// ── 일반 사용자 ───────────────────────────────────────────────────────────────

/** 신청 생성 */
export const createApplication = async (body) => {
  const { data } = await client.post('/api/facility-applications', body)
  return data.data
}

/** 내 신청 목록 */
export const getMyApplications = async ({ page = 0, size = 20 } = {}) => {
  const { data } = await client.get('/api/facility-applications/my', { params: { page, size } })
  return data.data
}

/** 신청 상세 */
export const getApplication = async (id) => {
  const { data } = await client.get(`/api/facility-applications/${id}`)
  return data.data
}

/** 신청 취소 */
export const cancelApplication = async (id) => {
  const { data } = await client.delete(`/api/facility-applications/${id}`)
  return data
}

// ── 관리자 ────────────────────────────────────────────────────────────────────

/** 전체 신청 목록 (관리자) */
export const getAdminApplications = async ({ page = 0, size = 20, categoryId, status } = {}) => {
  const { data } = await client.get('/api/admin/facility-applications', {
    params: { page, size, categoryId, status },
  })
  return data.data
}

/** 신청 상세 (관리자) */
export const getAdminApplication = async (id) => {
  const { data } = await client.get(`/api/admin/facility-applications/${id}`)
  return data.data
}

/** 처리 완료 */
export const completeApplication = async (id, adminMemo) => {
  const { data } = await client.patch(`/api/admin/facility-applications/${id}/complete`, { adminMemo })
  return data.data
}

/** 관리자 메모 수정 */
export const updateApplicationMemo = async (id, adminMemo) => {
  const { data } = await client.patch(`/api/admin/facility-applications/${id}/memo`, { adminMemo })
  return data.data
}

/** 엑셀 다운로드 */
export const downloadApplicationsExcel = async ({ categoryId, status } = {}) => {
  const response = await client.get('/api/admin/facility-applications/excel', {
    params: { categoryId, status },
    responseType: 'blob',
  })
  const url  = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href  = url
  link.setAttribute('download', '신청목록.xlsx')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// ── 관리자 — 카테고리 ─────────────────────────────────────────────────────────

/** 전체 카테고리 목록 (비활성 포함, 관리자용) */
export const getAdminApplicationCategories = async () => {
  const { data } = await client.get('/api/admin/facility-applications/categories')
  return data.data
}

/** 카테고리 생성 */
export const createApplicationCategory = async (body) => {
  const { data } = await client.post('/api/admin/facility-applications/categories', body)
  return data
}

/** 카테고리 수정 */
export const updateApplicationCategory = async (id, body) => {
  const { data } = await client.put(`/api/admin/facility-applications/categories/${id}`, body)
  return data
}

/** 카테고리 활성/비활성 토글 */
export const toggleApplicationCategory = async (id) => {
  const { data } = await client.patch(`/api/admin/facility-applications/categories/${id}/toggle`)
  return data
}
