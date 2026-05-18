import client from './client'

/** 도움문의 제출 (공개, 비로그인 가능) */
export const submitHelpRequest = async (payload) => {
  const { data } = await client.post('/api/help-request', payload)
  return data
}

/**
 * 도움문의 관리자 API
 */

/** 목록 조회 (페이징 + 상태 필터) */
export const getHelpRequests = async ({ page = 0, size = 20, status = null } = {}) => {
  const params = { page, size }
  if (status) params.status = status
  const { data } = await client.get('/api/admin/help-requests', { params })
  return data.data // PageResponse<HelpRequestResponse>
}

/** 상태 변경 */
export const updateHelpRequestStatus = async ({ id, status }) => {
  const { data } = await client.patch(`/api/admin/help-requests/${id}/status`, { status })
  return data.data
}

/** 관리자 메모 저장 */
export const updateAdminMemo = async ({ id, adminMemo }) => {
  const { data } = await client.patch(`/api/admin/help-requests/${id}/memo`, { adminMemo })
  return data.data
}

/** 삭제 */
export const deleteHelpRequest = async (id) => {
  const { data } = await client.delete(`/api/admin/help-requests/${id}`)
  return data.data
}
