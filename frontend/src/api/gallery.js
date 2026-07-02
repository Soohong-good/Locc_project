import client from './client'

/** 통합 갤러리 목록 (게시판 형식) — departmentCode 생략 시 전체 */
export const getGalleryList = ({ departmentCode, page = 0 } = {}) =>
  client.get('/api/galleries', { params: { departmentCode, page } }).then((r) => r.data.data)

/** 갤러리 이미지 상세 (조회수 증가 포함, 부서 코드 불필요) */
export const getGalleryDetail = (imageId) =>
  client.get(`/api/galleries/${imageId}`).then((r) => r.data.data)

/** 같은 업로드 그룹의 전체 이미지 (부서 코드 불필요) */
export const getGalleryGroupImages = (imageId) =>
  client.get(`/api/galleries/${imageId}/group`).then((r) => r.data.data)
