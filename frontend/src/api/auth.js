import client from './client'

/**
 * 로그인
 * @returns { accessToken, refreshToken, user }
 */
export const login = async ({ email, password }) => {
  const { data } = await client.post('/api/auth/login', { email, password })
  return data.data
}

/**
 * 로그아웃
 */
export const logout = async () => {
  await client.post('/api/auth/logout')
}

/**
 * 내 정보 조회
 */
export const getMe = async () => {
  const { data } = await client.get('/api/auth/me')
  return data.data
}

/**
 * 회원가입
 */
export const register = async (payload) => {
  const { data } = await client.post('/api/auth/register', payload)
  return data.data
}

/**
 * 이메일 중복 확인
 * @returns boolean (true = 사용 가능)
 */
export const checkEmail = async (email) => {
  const { data } = await client.get('/api/auth/check-email', { params: { email } })
  return data.data
}
