/**
 * 찬양대 이름 — 백엔드 ChoirSyncService.classifyChoirName()이 저장하는 값과 반드시 일치해야 한다.
 * (원니스→시온 개명 통합, 미가엘/장로/대학청년/중창단 등은 전부 주일오후찬양대로 분류)
 */
export const CHOIR_NAMES = {
  SION:             '시온찬양대',
  HALLELUJAH:       '할렐루야찬양대',
  JUYOUNGGWANG:     '주영광찬양대',
  SUNDAY_AFTERNOON: '주일오후찬양대',
}

/** 메인 페이지 찬양대 섹션 고정 슬롯 순서 (왼쪽 → 오른쪽) */
export const MAIN_CHOIR_SLOT_ORDER = [
  CHOIR_NAMES.HALLELUJAH,
  CHOIR_NAMES.SION,
  CHOIR_NAMES.SUNDAY_AFTERNOON,
  CHOIR_NAMES.JUYOUNGGWANG,
]
