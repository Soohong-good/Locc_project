import client from './client'

/**
 * 마이페이지 API
 * 모든 엔드포인트는 인증 필요 (/api/mypage/*)
 */

// 내 정보 조회
export const getMyInfo = async () => {
  const { data } = await client.get('/api/mypage/info')
  return data.data
}

// 프로필 수정 (이름, 연락처, 주소, 성별, 생년월일)
export const updateProfile = async (body) => {
  const { data } = await client.put('/api/mypage/profile', body)
  return data
}

// 비밀번호 변경
export const changePassword = async ({ currentPassword, newPassword, newPasswordConfirm }) => {
  const { data } = await client.put('/api/mypage/password', {
    currentPassword,
    newPassword,
    newPasswordConfirm,
  })
  return data
}
