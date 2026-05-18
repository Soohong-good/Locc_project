import client from './client'

// ── 훈련 ─────────────────────────────────────────────────────────────────

/** 훈련 목록 (페이지네이션) */
export const getTrainingList = (page = 0, size = 20) =>
  client.get('/api/trainings', { params: { page, size } }).then((r) => r.data.data)

/** 신청 가능한 훈련 목록 */
export const getOpenTrainings = () =>
  client.get('/api/trainings/open').then((r) => r.data.data)

/** 훈련 상세 */
export const getTrainingDetail = (id) =>
  client.get(`/api/trainings/${id}`).then((r) => r.data.data)

/** 훈련 생성 (ADMIN) */
export const createTraining = (data) =>
  client.post('/api/trainings', data).then((r) => r.data.data)

/** 훈련 수정 (ADMIN) */
export const updateTraining = (id, data) =>
  client.put(`/api/trainings/${id}`, data).then((r) => r.data.data)

/** 훈련 삭제 (ADMIN) */
export const deleteTraining = (id) =>
  client.delete(`/api/trainings/${id}`).then((r) => r.data)

/** 훈련 마감 (ADMIN) */
export const closeTraining = (id) =>
  client.post(`/api/trainings/${id}/close`).then((r) => r.data)

// ── 신청 ─────────────────────────────────────────────────────────────────

/** 특정 훈련 신청자 목록 (ADMIN) */
export const getApplicationsByTraining = (trainingId, page = 0) =>
  client
    .get(`/api/applications/training/${trainingId}`, { params: { page, size: 50 } })
    .then((r) => r.data.data)

/** 내 신청내역 */
export const getMyApplications = () =>
  client.get('/api/applications/my').then((r) => r.data.data)

/** 훈련 신청 */
export const applyTraining = (data) =>
  client.post('/api/applications', data).then((r) => r.data.data)

/** 신청 취소 */
export const cancelApplication = (id) =>
  client.delete(`/api/applications/${id}`).then((r) => r.data)

/** 신청자 엑셀 다운로드 (Blob 반환) */
export const downloadApplicationsExcel = async (trainingId) => {
  const response = await client.get(`/api/applications/training/${trainingId}/excel`, {
    responseType: 'blob',
  })

  // Content-Disposition에서 파일명 추출
  const disposition = response.headers['content-disposition'] || ''
  let fileName = '신청자명단.xlsx'

  const matchStar = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
  if (matchStar?.[1]) {
    fileName = decodeURIComponent(matchStar[1])
  } else {
    const match = disposition.match(/filename\s*=\s*"([^"]+)"/i)
    if (match?.[1]) fileName = match[1]
  }

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const a   = document.createElement('a')
  a.href     = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
