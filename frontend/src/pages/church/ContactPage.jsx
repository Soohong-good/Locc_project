import { MapPin, Phone, Copy, TrainRegional, Car, Bus } from '@phosphor-icons/react'
import KakaoMap from '@/components/ui/KakaoMap'

const contactRows = [
  { label: '전화',       values: ['053-962-8948', '053-961-0931'] },
  { label: '팩스',       values: ['053-961-0862'] },
  { label: '사랑선교원', values: ['053-965-8948'] },
  { label: '이메일',     values: ['cmedia881213@gmail.com'] },
]

const HeroSection = () => (
  <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 bg-[#171717] text-[#FAF9F6] border-b border-[#2C2C2C]">
    <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24 border-x border-[#2C2C2C]">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#888] font-mono mb-6 block">Location &amp; Contact</span>
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-8">오시는 길</h1>
      <p className="text-lg font-light text-[#888]">그리스도사랑교회로 오시는 길을 안내합니다</p>
    </div>
  </section>
)

const MapSection = () => (
  <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E5] border-x border-[#E5E5E5]">
      <div className="lg:col-span-4 p-8 md:p-16 lg:p-24 flex flex-col gap-20 bg-[#FAF9F6]">
        <div>
          <MapPin size={30} className="text-[#2C2C2C] mb-6" />
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#737373] mb-6 block font-semibold">Address</h3>
          <p className="text-lg font-medium leading-relaxed text-[#2C2C2C] break-keep mb-6">
            대구광역시 동구<br />안심로55길 59<br />
            <span className="text-[#737373] font-light text-base">(안심동)</span>
          </p>
          <p className="text-lg font-bold text-[#2C2C2C] tracking-tight">그리스도사랑교회</p>
        </div>
        <div>
          <Phone size={30} className="text-[#2C2C2C] mb-6" />
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#737373] mb-6 block font-semibold">Contact</h3>
          <div className="space-y-0">
            {contactRows.map(({ label, values }) => (
              <div key={label} className={`flex justify-between items-start py-4 group ${label === '이메일' ? '' : 'border-b border-[#E5E5E5]'}`}>
                <span className="text-sm font-medium text-[#2C2C2C] mt-1">{label}</span>
                <div className="text-right">
                  {values.map((v) => (
                    <span key={v} className="block text-base font-mono tracking-tighter text-[#737373] group-hover:text-[#2C2C2C] transition-colors">{v}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-8 relative min-h-[500px] lg:min-h-full overflow-hidden">
        <KakaoMap />
      </div>
    </div>
  </section>
)

const busStops = [
  { stop: '경북교통',   buses: '805, 836, 동구10, 동구4, 동구4-1, 북구3' },
  { stop: '안심지구대', buses: '708, 836, 급행5, 동구10' },
  { stop: '동부고교',   buses: '55, 555, 808, 814, 818, 북구3' },
  { stop: '반야월역',   buses: '518, 618, 651, 805, 836, 848, 동구4-1, 동구10, 급행10, 수성3, 수성3-1, 수성6' },
]

const TransportSection = () => (
  <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E5] border-x border-[#E5E5E5]">
      <div className="lg:col-span-4 p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-[#FAF9F6]">
        <Copy size={30} className="text-[#2C2C2C] mb-6" />
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-4 block">Transportation</span>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#2C2C2C]">대중교통 안내</h2>
      </div>
      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E5E5E5] bg-[#FAF9F6]">
        <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center gap-16">
          <div>
            <h4 className="text-xl font-bold text-[#2C2C2C] mb-6 flex items-center gap-3">
              <TrainRegional size={24} weight="fill" className="text-[#737373]" /> 지하철
            </h4>
            <div className="text-[#737373] leading-relaxed font-light text-base space-y-2">
              <p className="flex items-center gap-3"><span className="w-2 h-2 bg-[#2C2C2C] inline-block shrink-0" />1호선 반야월역 4번 출구 하차</p>
              <p className="flex items-center gap-3"><span className="w-2 h-2 bg-transparent inline-block shrink-0" />도보 약 10분</p>
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold text-[#2C2C2C] mb-6 flex items-center gap-3">
              <Car size={24} weight="fill" className="text-[#737373]" /> 주차
            </h4>
            <div className="text-[#737373] leading-relaxed font-light text-base">
              <p className="flex items-center gap-3"><span className="w-2 h-2 bg-[#2C2C2C] inline-block shrink-0" />교회 주차장 이용 가능</p>
            </div>
          </div>
        </div>
        <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center">
          <h4 className="text-xl font-bold text-[#2C2C2C] mb-10 flex items-center gap-3">
            <Bus size={24} weight="fill" className="text-[#737373]" /> 시내버스
          </h4>
          <ul className="space-y-0">
            {busStops.map(({ stop, buses }, i) => (
              <li key={stop} className={`flex flex-col xl:flex-row xl:items-baseline py-5 gap-2 xl:gap-8 group ${i < busStops.length - 1 ? 'border-b border-[#E5E5E5]' : ''}`}>
                <span className="font-medium text-[#2C2C2C] w-32 shrink-0 group-hover:text-[#737373] transition-colors">{stop}</span>
                <span className="text-sm text-[#737373] font-mono leading-relaxed tracking-tight break-all md:break-normal">{buses}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
)

export default function ContactPage() {
  return (
    <div className="bg-[#FAF9F6] text-[#2C2C2C]">
      <HeroSection />
      <MapSection />
      <TransportSection />
    </div>
  )
}
