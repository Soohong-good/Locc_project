import client from './client'

/**
 * 사용자 관리 API (관리자 전용)
 */

// 전체 목록
export const getUsers = async ({ page = 0, size = 20 } = {}) => {
  const { data } = await client.get('/api/admin/users', { params: { page, size } })
  return data.data
}

// 승인 대기 목록
export const getPendingUsers = async ({ page = 0, size = 20 } = {}) => {
  const { data } = await client.get('/api/admin/users/pending', { params: { page, size } })
  return data.data
}

// 승인 대기 수
export const getPendingCount = async () => {
  const { data } = await client.get('/api/admin/users/pending/count')
  return data.data
}

// 회원 상세
export const getUserDetail = async (id) => {
  const { data } = await client.get(`/api/admin/users/${id}`)
  return data.data
}

// 승인
export const approveUser = async (userId) => {
  const { data } = await client.post(`/api/admin/users/${userId}/approve`)
  return data
}

// 반려
export const rejectUser = async ({ userId, reason }) => {
  const { data } = await client.post(`/api/admin/users/${userId}/reject`, { reason })
  return data
}

// 차단
export const disableUser = async (userId) => {
  const { data } = await client.post(`/api/admin/users/${userId}/disable`)
  return data
}

// 차단 해제
export const enableUser = async (userId) => {
  const { data } = await client.post(`/api/admin/users/${userId}/enable`)
  return data
}

// 삭제
export const deleteUser = async (userId) => {
  const { data } = await client.delete(`/api/admin/users/${userId}`)
  return data
}

// 운영자 권한 부여
export const grantOperator = async (userId) => {
  const { data } = await client.post(`/api/admin/users/${userId}/grant-operator`)
  return data
}

// 운영자 권한 회수
export const revokeOperator = async (userId) => {
  const { data } = await client.post(`/api/admin/users/${userId}/revoke-operator`)
  return data
}
