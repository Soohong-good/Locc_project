/**
 * 교회 자체 갤러리(그리스도사랑교회 > 갤러리) 전용 코드
 * 사역 부서가 아니라 갤러리 저장소 역할이므로 DEPARTMENTS 목록에는 포함하지 않는다.
 */
export const CHURCH_GALLERY_CODE = 'church'

export const DEPARTMENTS = [
  { code: 'nursery',      label: '태영아부' },
  { code: 'preschool',    label: '유아유치부' },
  { code: 'children',     label: '초등부' },
  { code: 'youth',        label: '중고등부' },
  { code: 'young-adults', label: '대학청년부' },
  { code: 'newcomers',    label: '새가족부' },
  { code: 'multiethnic',  label: '다민족부' },
  { code: 'healing',      label: '치유부' },
]
