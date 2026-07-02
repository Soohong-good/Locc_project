const sundayItems  = [
  { label: '1부 예배',  time: '오전 09:00', place: '본당' },
  { label: '2부 예배',  time: '오전 11:00', place: '본당' },
  { label: '오후 예배', time: '오후 15:00', note: '찬양 14:40', place: '본당' },
]
const weekdayItems = [
  { label: '수요예배',   time: '수요일 20:00', place: '본당' },
  { label: '금요기도회', time: '금요일 21:00', place: '본당' },
  { label: '새벽기도회', time: '매일 05:30',   place: '101호' },
]
const departmentItems = [
  { label: '태영아부',   time: '13:30', place: '204호' },
  { label: '유아유치부', time: '11:00', place: '204호' },
  { label: '초등부',     time: '09:00', place: '206호' },
  { label: '중고등부',   time: '10:30', place: '205호' },
  { label: '대청부',     time: '13:00', place: '교육관 3층' },
  { label: '다민족부',   time: '13:00', place: '206호' },
  { label: '새가족부',   time: '10:00', place: '101호' },
  { label: '치유부',     time: '13:10', place: '101호' },
]
const choirItems = [
  { service: '1부 예배',  name: '원니스' },
  { service: '2부 예배',  name: '할렐루야' },
  { service: '오후 예배', name: '미가엘 · 임마누엘' },
  { service: '수요 예배', name: '주영광' },
]
const specialItems = ['산업선교', '상담치유', '교정전도부', '벧엘기도조', '금요전도학교']

const HeroSection = () => (
  <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 bg-[#171717] text-[#FAF9F6] border-b border-[#2C2C2C]">
    <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24 border-x border-[#2C2C2C]">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#888] font-mono mb-6 block">Worship</span>
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-8">예배 안내</h1>
      <p className="text-lg font-light text-[#888]">하나님께 드리는 예배 시간을 안내합니다</p>
    </div>
  </section>
)

const WorshipRow = ({ label, time, note, place }) => (
  <div className="flex items-start justify-between py-6 border-b border-[#E5E5E5] last:border-b-0 group">
    <span className="text-xl font-medium text-[#2C2C2C] group-hover:text-[#737373] transition-colors">{label}</span>
    <div className="text-right">
      <span className="block text-xl font-mono font-semibold text-[#2C2C2C] tabular-nums">{time}</span>
      {note && <span className="block text-sm text-[#737373] mt-0.5">{note}</span>}
      {place && <span className="block text-sm text-[#737373] mt-1">{place}</span>}
    </div>
  </div>
)

const MainWorshipSection = () => (
  <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5]">
      <div className="p-8 md:p-16 lg:p-24 border-b border-[#E5E5E5] flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-4 block">Main Worship</span>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#2C2C2C]">주요 예배</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E5]">
        <div className="p-8 md:p-16 lg:p-20">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#737373] mb-3 block">Sunday Service</span>
          <h3 className="text-3xl font-bold text-[#2C2C2C] mb-10 border-l-4 border-[#2C2C2C] pl-4">주일예배</h3>
          <div>{sundayItems.map((item) => <WorshipRow key={item.label} {...item} />)}</div>
        </div>
        <div className="p-8 md:p-16 lg:p-20">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#737373] mb-3 block">Weekday Service</span>
          <h3 className="text-3xl font-bold text-[#2C2C2C] mb-10 border-l-4 border-[#E5E5E5] pl-4">주중 예배</h3>
          <div>{weekdayItems.map((item) => <WorshipRow key={item.label} {...item} />)}</div>
        </div>
      </div>
    </div>
  </section>
)

const DepartmentSection = () => (
  <section className="bg-[#F4F2EA] border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5]">
      <div className="p-8 md:p-16 lg:p-24 border-b border-[#E5E5E5] flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-4 block">Department Service</span>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#2C2C2C]">주일 기관별 예배</h2>
      </div>
      <div className="p-0">
        {departmentItems.map(({ label, time, place }, i) => (
          <div key={label} className={`max-w-[1600px] mx-auto flex items-center justify-between px-8 md:px-16 lg:px-24 py-6 ${i !== 0 ? 'border-t border-[#E5E5E5]' : ''} hover:bg-[#FAF9F6] transition-colors group`}>
            <span className="text-xl font-medium text-[#2C2C2C] group-hover:text-[#737373] transition-colors">{label}</span>
            <div className="flex items-center gap-6">
              <span className="text-xl font-mono font-semibold text-[#2C2C2C] tabular-nums">{time}</span>
              <span className="text-sm text-[#737373] bg-[#FAF9F6] border border-[#E5E5E5] px-3 py-1 min-w-[80px] text-center">{place}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const ChoirAndSpecialSection = () => (
  <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E5] border-x border-[#E5E5E5]">
      <div className="p-8 md:p-16 lg:p-20">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#737373] mb-4 block">Choir</span>
        <h3 className="text-3xl font-bold text-[#2C2C2C] mb-12">찬양대</h3>
        <ul>
          {choirItems.map(({ service, name }) => (
            <li key={service} className="flex items-center gap-6 py-5 border-b border-[#E5E5E5] last:border-b-0 group hover:bg-[#F4F2EA] -mx-8 px-8 md:-mx-16 md:px-16 lg:-mx-20 lg:px-20 transition-colors">
              <span className="text-[#737373] w-28 shrink-0 text-sm font-mono">{service}</span>
              <span className="text-[#2C2C2C] font-medium text-lg group-hover:text-[#737373] transition-colors">{name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-8 md:p-16 lg:p-20">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#737373] mb-4 block">Special Meeting</span>
        <h3 className="text-3xl font-bold text-[#2C2C2C] mb-12">특별 모임</h3>
        <ul>
          {specialItems.map((name) => (
            <li key={name} className="flex items-center gap-4 py-5 border-b border-[#E5E5E5] last:border-b-0 group hover:bg-[#F4F2EA] -mx-8 px-8 md:-mx-16 md:px-16 lg:-mx-20 lg:px-20 transition-colors">
              <span className="w-2 h-2 bg-[#2C2C2C] inline-block shrink-0 group-hover:bg-[#737373] transition-colors" />
              <span className="text-[#2C2C2C] text-lg font-medium group-hover:text-[#737373] transition-colors">{name}</span>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-sm text-[#737373] font-light leading-relaxed">
          각 모임은 정해진 시간과 장소에서 진행됩니다.<br />자세한 내용은 교회 사무실로 문의해주세요.
        </p>
      </div>
    </div>
  </section>
)

export default function WorshipGuidePage() {
  return (
    <div className="bg-[#FAF9F6] text-[#2C2C2C]">
      <HeroSection />
      <MainWorshipSection />
      <DepartmentSection />
      <ChoirAndSpecialSection />
    </div>
  )
}
