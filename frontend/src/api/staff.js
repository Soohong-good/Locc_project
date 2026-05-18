import client from '@/api/client'

export const staffApi = {
  /** 전체 목록 */
  getAll: () => client.get('/api/staff').then((r) => r.data.data),

  /** 카테고리별 (MINISTER | EMPLOYEE) */
  getByCategory: (category) =>
    client.get(`/api/staff/category/${category}`).then((r) => r.data.data ?? []),

  /** 담임목사 목록 */
  getSeniorPastors: () =>
    client.get('/api/staff/senior-pastor').then((r) => r.data.data ?? []),

  /** 단건 조회 */
  getById: (id) =>
    client.get(`/api/staff/${id}`).then((r) => r.data.data ?? r.data),

  /** 설교자 목록 (담임목사, 목사, 전도사) */
  getPreachers: () => client.get('/api/staff/preachers').then((r) => r.data.data),

  /** 생성 */
  create: (body) =>
    client.post('/api/staff', body).then((r) => r.data.data ?? r.data),

  /** 수정 */
  update: (id, body) => client.put(`/api/staff/${id}`, body),

  /** 삭제 */
  delete: (id) => client.delete(`/api/staff/${id}`),

  /** 이미지 업로드 */
  uploadImage: (id, file) => {
    const formData = new FormData()
    formData.append('image', file)
    return client.post(`/api/staff/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /** 이미지 삭제 */
  deleteImage: (id) => client.delete(`/api/staff/${id}/image`),
}
