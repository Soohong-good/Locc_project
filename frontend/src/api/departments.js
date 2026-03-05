import client from './client'

// ── 부서 정보 ─────────────────────────────────────────────────────────────

/** 부서 정보 조회 */
export const getDepartment = (code) =>
  client.get(`/api/department/${code}`).then((r) => r.data.data)

// ── 게시판 ────────────────────────────────────────────────────────────────

/** 부서 게시판 목록 (최대 5개, 핀 우선) */
export const getDepartmentBoards = (code) =>
  client.get(`/api/department/${code}/board`).then((r) => r.data.data)

/** 게시판 글 상세 */
export const getDepartmentBoard = (code, boardId) =>
  client.get(`/api/department/${code}/board/${boardId}`).then((r) => r.data.data)

/** 게시판 글 작성 (ADMIN) */
export const createDepartmentBoard = (code, data) =>
  client.post(`/api/department/${code}/board`, data).then((r) => r.data.data)

/** 게시판 글 삭제 (ADMIN) */
export const deleteDepartmentBoard = (code, boardId) =>
  client.delete(`/api/department/${code}/board/${boardId}`).then((r) => r.data)

/** 게시판 핀 토글 (ADMIN) */
export const toggleDepartmentBoardPin = (code, boardId) =>
  client.post(`/api/department/${code}/board/${boardId}/pin`).then((r) => r.data)

// ── 갤러리 ────────────────────────────────────────────────────────────────

/** 갤러리 그룹 목록 (페이지네이션) */
export const getGalleryGroups = (code, { page = 0, size = 12 } = {}) =>
  client
    .get(`/api/departments/${code}/gallery/groups`, { params: { page, size } })
    .then((r) => r.data.data)

/** 그룹 제목으로 이미지 목록 조회 */
export const getGalleryImagesByTitle = (code, title) =>
  client
    .get(`/api/departments/${code}/gallery/titles/${encodeURIComponent(title)}/images`)
    .then((r) => r.data.data)

/** 갤러리 이미지 업로드 (ADMIN, FormData) */
export const uploadGalleryImages = (code, formData) =>
  client
    .post(`/api/departments/${code}/gallery`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data)

/** 갤러리 이미지 삭제 (ADMIN) */
export const deleteGalleryImage = (code, imageId) =>
  client.delete(`/api/departments/${code}/gallery/${imageId}`).then((r) => r.data)
