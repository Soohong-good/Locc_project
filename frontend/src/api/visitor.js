import client from './client'

/** 방문자 카운트 증가 (앱 마운트 시 1회 호출) */
export const recordVisit = async () => {
  await client.post('/api/visitor/count')
}
