import client from '@/api/client'

export const staffApi = {
  /** 전체 목록 */
  getAll: () => client.get('/api/staff').then((r) => r.data.data),

  /** 카테고리별 (MINISTER | EMPLOYEE) */
  getByCategory: (category) =>
    client.get(`/api/staff/category/${category}`).then((r) => r.data.data),
}
