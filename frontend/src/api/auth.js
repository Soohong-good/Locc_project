import client from './client'

/** 로그인 */
export const login = async ({ email, password }) => {
  const { data } = await client.post('/api/auth/login', { email, password })
  return data.data
}

/** 로그아웃 */
export const logout = async () => {
  await client.post('/api/auth/logout')
}

/** 내 정보 조회 */
export const getMe = async () => {
  const { data } = await client.get('/api/auth/me')
  return data.data ?? null  // undefined 방지 — 비로그인 시 서버가 data 필드 생략 가능
}

/** 회원가입 */
export const register = async (payload) => {
  const { data } = await client.post('/api/auth/register', payload)
  return data.data
}

/** 이메일 중복 확인
 *  - 성공(200): 사용 가능한 이메일
 *  - 실패(400): 이미 사용 중인 이메일 → axios가 throw, 호출부 catch에서 처리
 */
export const checkEmail = async (email) => {
  await client.post('/api/auth/check-email', { email })
}

// ─── 이메일 인증 ───────────────────────────────

/** 인증 코드 발송 */
export const sendVerificationCode = async (email) => {
  const { data } = await client.post('/api/auth/email/send-code', { email })
  return data
}

/** 인증 코드 검증 */
export const verifyEmailCode = async ({ email, code }) => {
  const { data } = await client.post('/api/auth/email/verify-code', { email, code })
  return data
}

// ─── 비밀번호 찾기/재설정 ───────────────────────

/** 비밀번호 재설정 이메일 발송 */
export const requestPasswordReset = async (email) => {
  const { data } = await client.post('/api/auth/password/reset-request', { email })
  return data
}

/** 재설정 토큰 유효성 검증 */
export const validateResetToken = async (token) => {
  const { data } = await client.get('/api/auth/password/validate-token', { params: { token } })
  return data
}

/** 비밀번호 재설정 실행 */
export const resetPassword = async ({ token, newPassword }) => {
  const { data } = await client.post('/api/auth/password/reset', { token, newPassword })
  return data
}

// ─── 소셜 로그인 추가 가입 ───────────────────────

/** 소셜 추가 정보 등록 완료 */
export const completeSocialRegistration = async (token, payload) => {
  const { data } = await client.post(
    `/api/social/complete-registration?token=${token}`,
    payload
  )
  return data
}

/** 이메일 충돌 후 소셜 계정 연결 (로그인 상태에서 호출) */
export const linkSocialAccount = async (linkToken) => {
  const { data } = await client.post(
    `/api/social/link-account?linkToken=${encodeURIComponent(linkToken)}`
  )
  return data
}
