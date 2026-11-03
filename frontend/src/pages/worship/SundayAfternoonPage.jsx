import { getSundayAfternoonData } from '@/api/sermons'
import CategorySermonPage from '@/components/sermon/CategorySermonPage'

const CONFIG = {
  category:      '주일오후',
  queryKey:      'sunday-afternoon',
  fetchPage:     getSundayAfternoonData,
  eyebrow:       'Sunday Afternoon Service',
  title:         '주일오후 예배',
  latestHeading: '주일오후 최신 설교',
  featuredLabel: '주일오후',
  placeholder:   'Sunday Afternoon',
}

const SundayAfternoonPage = () => <CategorySermonPage config={CONFIG} />

export default SundayAfternoonPage
