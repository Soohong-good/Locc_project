import { Link } from 'react-router-dom'
import { CaretRight } from '@phosphor-icons/react'

const HeroSection = () => (
  <section className="relative bg-[#171717] h-[400px] lg:h-[500px] flex items-center overflow-hidden border-b border-[#E5E5E5]">
    {/* 배경 고정(parallax) — ValuesSection과 같은 이미지를 같은 위치로 공유해 두 섹션이 하나로 이어진 것처럼 보임 */}
    <div className="absolute inset-0 bg-cover bg-center lg:bg-fixed"
      style={{ backgroundImage: "url('/aboutPage.jpg')" }} />
    <div className="absolute inset-0 bg-gradient-to-r from-[#2a303c]/80 via-[#2a303c]/30 to-transparent" />
    <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
      <div className="max-w-3xl">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-white/70 font-mono mb-4 block">About Church</span>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">그리스도 사랑교회</h1>
        <p className="text-white/80 font-light leading-relaxed break-keep text-lg">
          교회 소개, 오직 성경, 오직 믿음, 오직 은혜, 오직 그리스도, 오직 하나님께만 영광을 돌려드리며, 예배와 삶에서 사랑하고 겸비하며 낮아지는 제자 공동체입니다.
        </p>
      </div>
    </div>
  </section>
)

const VISION_ITEMS = [
  { id: 'vision-1', title: '그리스도 중심의 교회', lines: ['예수 그리스도가 교회의 머리, 주님, 왕, 목자가 되심을 인정하며', '그리스도의 인도하심을 따라가는 교회입니다.'] },
  { id: 'vision-2', title: '말씀 중심의 교회',     lines: ['성경 말씀을 있는 그대로 가르치고 배우며,', '그 진리를 우리의 삶 가운데 적용하여 하나님의 뜻을 실천하는 교회입니다.'] },
  { id: 'vision-3', title: '예배하는 교회',        lines: ['살아계신 하나님을 영과 진리로 예배하며,', '예배를 통해 하나님과의 친밀한 교제를 누리는 교회입니다.'] },
  { id: 'vision-4', title: '사랑의 교회',          lines: ['하나님의 사랑을 받은 자로서 서로를 진실하게 사랑하고 섬기며,', '세상에 그리스도의 사랑을 전하는 교회입니다.'] },
  { id: 'vision-5', title: '제자 세우는 교회',     lines: ['자기를 부인하며 자기 십자가를 지고', '예수 그리스도를 따르는 제자를 세우는 교회입니다.'] },
]

const VisionSection = () => (
  <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E5] border-x border-[#E5E5E5]">
      <div className="lg:col-span-4 p-8 md:p-16 lg:p-24 bg-[#FAF9F6]">
        <div className="sticky top-32">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-4 block">Our Vision</span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#2C2C2C]">우리의 비전</h2>
        </div>
      </div>
      <div className="lg:col-span-8 bg-[#FAF9F6] flex flex-col">
        {VISION_ITEMS.map(({ id, title, lines }) => (
          <div key={id} className="p-8 md:p-16 lg:px-24 py-16 border-b border-[#E5E5E5] last:border-b-0">
            <h3 className="text-xl font-bold mb-4 text-[#2C2C2C]">{title}</h3>
            <p className="text-[#737373] font-light leading-relaxed break-keep max-w-2xl">{lines[0]}<br />{lines[1]}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const CORE_VALUES = [
  { id: 'value-1', num: '01', title: '말씀', desc: '성경을 하나님의 살아있는 말씀으로 믿으며, 강해설교를 통해 제자들로 세웁니다.' },
  { id: 'value-2', num: '02', title: '예배', desc: '하나님을 경배하는 것을 가장 중요하게 여기며, 친밀하고 예배를 드립니다.' },
  { id: 'value-3', num: '03', title: '기도', desc: '하나님의 뜻을 교회를 위해 끊임없이 기도하며 나아갑니다.' },
  { id: 'value-4', num: '04', title: '교제', desc: '그리스도 안에서 하나님 형제자매로서 진실한 사랑과 교제를 누립니다.' },
  { id: 'value-5', num: '05', title: '전도', desc: '복음을 세상에 전하여 잃어버린 영혼을 구원하는 사명을 감당합니다.' },
  { id: 'value-6', num: '06', title: '섬김', desc: '그리스도의 마음으로 서로를 살리고 지역사회를 섬깁니다.' },
]

const ValuesSection = () => (
  <section className="bg-[#171717] relative border-b border-[#E5E5E5]">
    {/* 배경 고정(parallax) — HeroSection과 같은 이미지를 같은 위치로 공유해 두 섹션이 하나로 이어진 것처럼 보임 */}
    <div className="absolute inset-0 bg-cover bg-center lg:bg-fixed"
      style={{ backgroundImage: "url('/aboutPage.jpg')" }} />
    <div className="absolute inset-0 bg-[#171717]/40" />
    <div className="relative z-10 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10 border-x border-white/10">
      <div className="lg:col-span-4 p-8 md:p-16 lg:p-24">
        <div className="sticky top-32">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50 font-mono mb-4 block">Core Values</span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">핵심 가치</h2>
        </div>
      </div>
      <div className="lg:col-span-8 p-8 md:p-16 lg:p-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20">
          {CORE_VALUES.map(({ id, num, title, desc }) => (
            <div key={id}>
              <span className="block text-4xl font-mono font-light text-white/30 mb-6">{num}</span>
              <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>
              <p className="text-white/70 font-light leading-relaxed break-keep">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
)

const CONFESSION_ITEMS = [
  { id: 'confession-1', title: '성경',          desc: '우리는 신구약 성경 66권이 하나님의 영감으로 기록된 오류 없는 하나님의 말씀임을 믿습니다.' },
  { id: 'confession-2', title: '하나님',        desc: '우리는 성부, 성자, 성령 삼위일체 하나님을 믿으며, 그분이 천지를 창조하시고 섭리하시는 분임을 믿습니다.' },
  { id: 'confession-3', title: '예수 그리스도', desc: '우리는 예수 그리스도께서 참 하나님이시며 참 사람이시고, 십자가에서 우리의 죄를 위해 죽으시고 부활하심으로 구원의 길을 열어주셨음을 믿습니다.' },
  { id: 'confession-4', title: '구원',          desc: '우리는 오직 예수 그리스도를 믿는 믿음으로만 구원받으며, 이는 전적인 하나님의 은혜임을 믿습니다.' },
  { id: 'confession-5', title: '교회',          desc: '우리는 교회가 그리스도의 몸이며, 성도들의 교제를 통해 하나님의 나라를 이루어가는 하나님의 백성임을 믿습니다.' },
]

const ConfessionSection = () => (
  <section className="bg-[#FAF9F6] border-b border-[#E5E5E5] relative overflow-hidden">
    <div className="absolute inset-0 bg-cover bg-center" />
    <div className="absolute inset-0 bg-[#FAF9F6]/70" />
    <div className="relative z-10 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E5] border-x border-[#E5E5E5]">
      <div className="lg:col-span-4 p-8 md:p-16 lg:p-24">
        <div className="sticky top-32">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-4 block">Statement of Faith</span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#2C2C2C] mb-6">신앙고백</h2>
          <p className="text-[#737373] font-light leading-relaxed break-keep">
            그리스도사랑교회는 <strong className="font-bold text-[#2C2C2C]">웨스트민스터 신앙고백</strong>을 믿는 교회입니다.
          </p>
        </div>
      </div>
      <div className="lg:col-span-8 p-8 md:p-16 lg:p-24">
        <div className="bg-[#F4F2EA] p-10 md:p-14 mb-8">
          <h3 className="text-lg font-bold mb-4 text-[#2C2C2C]">웨스트민스터 신앙고백</h3>
          <p className="text-[#737373] font-light leading-relaxed break-keep mb-8">
            웨스트민스터 신앙고백은 1646년 영국 웨스트민스터에서 작성된 개혁신앙의 대표적인 신앙고백서입니다.
            성경의 권위, 삼위일체 하나님, 그리스도의 구속 사역, 오직 은혜로 오직 믿음으로 구원받는다는 복음의 핵심 진리를 명확하게 고백하고 있습니다.
          </p>
          <Link to="/church/confession" className="inline-flex items-center gap-2 text-sm font-bold text-[#2C2C2C] hover:text-[#737373] transition-colors">
            웨스트민스터 신앙고백 전문 보기 <CaretRight size={14} />
          </Link>
        </div>
        <div className="bg-[#F4F2EA] p-10 md:p-14 mb-16">
          <h3 className="text-lg font-bold mb-4 text-[#2C2C2C]">교회 소속</h3>
            <p className="text-[#737373] font-light leading-relaxed break-keep">
                그리스도사랑교회는 <a href="http://www.rpck.tv/" target="_blank" rel="noreferrer"
                             className="font-medium text-slate-900 inline-flex items-center gap-1 hover:text-blue-600 transition-colors border-b border-slate-300 hover:border-blue-600">대한예수교장로회총회(개혁)</a> 소속
                교회입니다.
            </p>
        </div>
          <div className="space-y-12 pl-2 md:pl-6">
              {CONFESSION_ITEMS.map(({id, title, desc}) => (
                  <div key={id} className="border-l-[2px] border-[#171717] pl-6 py-1">
                      <h4 className="text-base font-bold mb-3 text-[#2C2C2C]">{title}</h4>
              <p className="text-[#737373] font-light leading-relaxed break-keep">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
)

const CTASection = () => (
  <section className="bg-[#171717] border-b border-[#E5E5E5] py-28 px-8 text-center relative overflow-hidden">
    <div className="absolute inset-0 bg-white/5 pointer-events-none" />
    <div className="max-w-2xl mx-auto relative z-10">
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6">여러분을 초대합니다</h2>
      <p className="text-white/80 font-light leading-relaxed break-keep mb-12">
        그리스도사랑교회는 모든 분들을 환영합니다.<br />함께 하나님을 예배하고 사랑의 교제를 나누시기 바랍니다.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/church/contact" className="bg-white text-[#2C2C2C] px-10 py-3 text-sm font-bold tracking-[0.1em] hover:bg-[#F4F2EA] transition-colors inline-flex justify-center items-center gap-2">
          오시는 길 <CaretRight size={14} />
        </Link>
        <Link to="/church/worship-guide" className="border border-white/30 text-white px-10 py-3 text-sm font-bold tracking-[0.1em] hover:bg-white/10 transition-colors inline-flex justify-center items-center">
          주일예배
        </Link>
      </div>
    </div>
  </section>
)

export default function AboutPage() {
  return (
    <div className="bg-[#FAF9F6] text-[#2C2C2C] pt-20">
      <HeroSection />
      <VisionSection />
      <ValuesSection />
      <ConfessionSection />
      <CTASection />
    </div>
  )
}
