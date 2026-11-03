import { getRetreatData } from '@/api/sermons'
import CategorySermonPage from '@/components/sermon/CategorySermonPage'

const CONFIG = {
  category:      '수련회특강',
  queryKey:      'retreat',
  fetchPage:     getRetreatData,
  eyebrow:       'Retreat & Special Lecture',
  title:         '수련회/특강 말씀',
  latestHeading: '수련회/특강 최신 말씀',
  featuredLabel: '수련회/특강',
  placeholder:   'Retreat & Lecture',
  // 세부 구분 탭 (id = serviceNumber, null = 전체) — 동기화 시 제목에 "축제"가 있으면 수련회, 그 외 특강
  tabs: [
    { id: null, label: '전체' },
    { id: 1,    label: '수련회' },
    { id: 2,    label: '특강' },
  ],
}

const RetreatPage = () => <CategorySermonPage config={CONFIG} />

export default RetreatPage
