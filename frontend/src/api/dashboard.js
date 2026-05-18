import client from './client'

/** 관리자 대시보드 전체 데이터 조회 */
export const getDashboard = async () => {
  const { data } = await client.get('/api/admin/dashboard')
  return data.data
}
