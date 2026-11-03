const HeroSection = () => (
  <section className="pt-20 bg-[#171717] text-[#FAF9F6] border-b border-[#171717]">
    <div className="max-w-[1600px] mx-auto min-h-[60vh] grid grid-cols-1 lg:grid-cols-12 border-x border-white/10 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
      <div className="lg:col-span-5 p-8 md:p-16 lg:p-24 flex flex-col justify-end">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#888] font-mono mb-8 block">Mission</span>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-4">선교</h1>
      </div>
      <div className="lg:col-span-7 p-8 md:p-16 lg:p-24 flex flex-col justify-end bg-[#171717]">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">미션비전</h2>
        <p className="text-xl md:text-2xl text-[#888] font-light leading-relaxed break-keep max-w-2xl">
          모든 민족에게 복음을 전파하는 후원자와 동역자를 세웁니다.
        </p>
      </div>
    </div>
  </section>
)

const visionItems = [
  { num: '01', title: '전 세계',   desc: '세계의 끝까지 복음을 전파하는 후원자와 동역자를 세웁니다.' },
  { num: '02', title: '제자 훈련', desc: '하나님의 말씀과 비전으로 세워지는 제자를 훈련합니다.' },
  { num: '03', title: '교회 개척', desc: '현지 교회와 함께 복음의 불을 지피며 세워갑니다.' },
]

const VisionSection = () => (
  <section className="border-b border-[#E5E5E5] bg-[#FAF9F6]">
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E5] border-x border-[#E5E5E5]">
      {visionItems.map(({ num, title, desc }) => (
        <div key={num} className="p-8 md:p-16 lg:p-24 flex flex-col hover:bg-[#F4F2EA] transition-colors group">
          <span className="text-5xl md:text-7xl font-mono text-[#E5E5E5] font-light mb-8 group-hover:text-[#2C2C2C] transition-colors">{num}</span>
          <h3 className="text-2xl font-bold mb-6 text-[#2C2C2C]">{title}</h3>
          <p className="text-[#737373] font-light leading-relaxed break-keep mt-auto">{desc}</p>
        </div>
      ))}
    </div>
  </section>
)

const activityRows = [
  { title: '해외 선교', desc: '해외에서 복음을 전하는 다양한 선교사와 사역을 후원하고 동역합니다.' },
  { title: '국내 선교', desc: '한국 내에서 복음이 필요한 지역과 대상을 찾아 섬깁니다. 미자립 교회를 돕고, 이주민·다문화·그리스도의 사랑을 실천합니다.' },
  { title: '단기 선교', desc: '매년 여름과 겨울, 선교지를 직접 방문하여 복음을 전하고 현지 교회를 돕습니다. 단기 선교를 통해 선교에 대한 비전을 품게 됩니다.' },
]

const ActivitiesSection = () => (
  <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] divide-y divide-[#E5E5E5]">
      {activityRows.map(({ title, desc }) => (
        <div key={title} className="grid grid-cols-1 lg:grid-cols-12 hover:bg-[#F4F2EA] transition-colors">
          <div className="lg:col-span-4 p-8 md:p-16 border-b lg:border-b-0 lg:border-r border-[#E5E5E5] flex items-center">
            <h3 className="text-3xl font-bold text-[#2C2C2C]">{title}</h3>
          </div>
          <div className="lg:col-span-8 p-8 md:p-16 flex items-center">
            <p className="text-lg text-[#737373] font-light leading-relaxed break-keep max-w-3xl">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
)

// ── 국가별 배경 국기 (CSS로만 그림 — 실제 이미지 에셋 없이 흐리게 깔리는 장식용) ──
const FlagUS = () => (
  <div className="absolute inset-0" style={{
    backgroundImage: 'repeating-linear-gradient(180deg, #B22234 0, #B22234 7.7%, #FFFFFF 7.7%, #FFFFFF 15.4%)',
  }}>
    <div className="absolute top-0 left-0" style={{ width: '40%', height: '53.8%', background: '#3C3B6E' }} />
  </div>
)

const FlagPH = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-x-0 top-0 h-1/2" style={{ background: '#0038A8' }} />
    <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: '#CE1126' }} />
    <div className="absolute inset-y-0 left-0" style={{ width: '45%', background: '#FFFFFF', clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
  </div>
)

const COUNTRY_FLAGS = { US: FlagUS, PH: FlagPH }
const COUNTRY_CODE  = { USA: 'US', Philippines: 'PH' }

const WavingFlag = ({ code }) => {
  const Flag = COUNTRY_FLAGS[code]
  if (!Flag) return null
  return (
    <div aria-hidden="true" className="absolute inset-0 md:inset-y-0 md:left-auto md:right-0 md:w-72 overflow-hidden pointer-events-none opacity-[0.12] blur-[3px]">
      <div className="w-full h-full animate-flag-wave">
        <Flag />
      </div>
    </div>
  )
}

const missionFields = [
  { name: 'GLL센터 (다문화센터)',   en: 'Multicultural Center', sub: null,                   missionary: null,       desc: '다문화 가정 아이들을 위한 문화센터로서, 다문화 가정과 해외 거주 경험이 있는 아이들의 정체성 확립과 문화적응을 돕는 사역을 지원하고 있습니다.' },
  { name: '미국',                   en: 'USA',                 sub: null,                   missionary: '이원규 협력선교사', desc: '미국 내 한인 디아스포라와 현지인을 대상으로 복음 전파와 교회 개척 사역을 감당하고 있습니다.' },
  { name: '필리핀',                 en: 'Philippines',         sub: null,                   missionary: '신남선 협력선교사', desc: '필리핀 중부지역(central Luzon)에서 성경적 교회를 세우고, 후대를 치유하며, 현지인 교회를 살리는 사역을 하고 있습니다.' },
  { name: '성경번역 선교회',         en: 'Bible Translation',   sub: null,                   missionary: '임오랑 협력선교사', desc: '자국어 성경이 없는 소수민족들을 위한 성경 번역 및 문자 개발 사역을 지원하고 있습니다.' },
  { name: '액츠신학 연구원 후원',    en: 'All Nations Christ Theological Seminaries (ACTS)', sub: null, missionary: null, desc: '액츠신학 연구원(ACTS)을 통해 차세대 선교 리더 양성과 신학 교육을 지원하고 있습니다.' },
]

const StatusSection = () => (
  <section className="bg-[#F4F2EA] border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] p-8 md:p-16 lg:p-24">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-4 block">Status</span>
      <h2 className="text-4xl font-bold tracking-tight text-[#2C2C2C]">선교현황</h2>
      <p className="text-[#737373] font-light mt-4">교회와 성도가 후원하는 선교사와 사역을 소개합니다.</p>
    </div>
  </section>
)

const MissionFieldSection = () => (
  <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5]">
      <ul className="flex flex-col divide-y divide-[#E5E5E5]">
        {missionFields.map(({ name, en, sub, missionary, desc }) => (
          <li key={name} className="group relative overflow-hidden hover:bg-[#F4F2EA] transition-colors">
            <WavingFlag code={COUNTRY_CODE[en]} />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 p-8 md:px-16 lg:px-24 py-12 lg:py-16 gap-6 lg:gap-0">
              <div className="lg:col-span-5 flex flex-col justify-center pr-8">
                <h4 className="text-2xl font-bold text-[#2C2C2C] mb-2">{name}</h4>
                <span className="text-sm font-mono text-[#737373] uppercase tracking-wider block">{en}</span>
                {missionary && <span className="text-base font-medium text-[#2C2C2C] mt-3 block">{missionary}</span>}
              </div>
              <div className="lg:col-span-7 flex flex-col justify-center pl-0 lg:pl-12 border-l-0 lg:border-l border-[#E5E5E5]">
                {sub && <p className="text-[#737373] font-light leading-relaxed break-keep text-lg mb-2">{sub}</p>}
                <p className="text-[#2C2C2C] font-medium leading-relaxed break-keep">{desc}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
)

const supportItems = [
  { title: '기도 후원', desc: '선교사와 사역을 위해\n기도로 동역합니다.' },
  { title: '재정 후원', desc: '선교 사역을 위해\n재정적으로 후원합니다.' },
  { title: '직접 참여', desc: '단기선교와 현지 방문을 통해\n직접 동역합니다.' },
]

const SupportSection = () => (
  <section className="bg-[#171717] text-[#FAF9F6]">
    <div className="max-w-[1600px] mx-auto border-x border-white/10 flex flex-col">
      <div className="p-8 md:p-16 lg:p-24 border-b border-white/10 flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#888] font-mono mb-6 block">Support</span>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">선교 후원</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 border-b border-white/10">
        {supportItems.map(({ title, desc }) => (
          <div key={title} className="p-8 md:p-16 lg:p-20 flex flex-col justify-center items-center text-center hover:bg-[#222] transition-colors">
            <h3 className="text-2xl font-bold mb-6">{title}</h3>
            <p className="text-[#888] font-light leading-relaxed break-keep whitespace-pre-line">{desc}</p>
          </div>
        ))}
      </div>
      <div className="p-8 md:p-16 flex flex-col items-center text-center bg-[#111]">
        <p className="text-lg font-medium text-[#FAF9F6] mb-4">함께 선교에 동참하시는 분들을 환영합니다.</p>
        <div className="flex flex-col md:flex-row items-center gap-4 text-[#888] font-mono text-sm tracking-wider">
          <span>Tel. 053-962-8948</span>
          <span className="hidden md:inline w-1 h-1 rounded-full bg-[#555]" />
          <span>cmedia881213@gmail.com</span>
        </div>
      </div>
    </div>
  </section>
)

export default function MissionPage() {
  return (
    <div className="bg-[#FAF9F6] text-[#2C2C2C]">
      <HeroSection />
      <VisionSection />
      <ActivitiesSection />
      <StatusSection />
      <MissionFieldSection />
      <SupportSection />
    </div>
  )
}
