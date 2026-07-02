import client from './client'

/**
 * 성경 본문 구간 조회
 * @param {string} ref 참조 문자열 (예: "고린도후서9:1~15", "고후 9:1-15", "요한복음 3:16")
 * @param {string} [version] 번역본 (기본: 개역개정)
 */
export const getBiblePassage = async (ref, version) => {
  if (!ref) return null
  const { data } = await client.get('/api/bible/passage', { params: { ref, version } })
  return data.data
}
