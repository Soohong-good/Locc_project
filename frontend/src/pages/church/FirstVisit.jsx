import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'

const HeroSection = () => (
  <section className="pt-20 border-b border-[#171717] relative bg-[#171717]">
    <div className="absolute inset-0 z-0">
      <img src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2000&auto=format&fit=crop" alt="Church Interior"
        className="w-full h-full object-cover opacity-30 grayscale-[50%] mix-blend-overlay" />
    </div>
    <div className="max-w-[1600px] mx-auto relative z-10 border-x border-[#171717]/50 min-h-[500px] flex flex-col items-center justify-center text-center p-8 md:p-16">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#FAF9F6]/70 font-mono mb-6 block">FIRST VISIT GUIDE</span>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 text-[#FAF9F6]">처음 교회에 방문하신 분</h1>
      <p className="text-lg font-light text-[#FAF9F6]/80 max-w-2xl leading-relaxed break-keep">
        그리스도사랑교회를 찾아주셔서 감사합니다. 처음 방문하시는 분들을 위한 안내입니다.
      </p>
    </div>
  </section>
)

const WorshipGuideSection = () => (
  <section className="border-b border-[#E5E5E5] bg-[#FAF9F6]">
    <div className="max-w-[1000px] mx-auto p-12 md:p-24 flex flex-col items-center text-center">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-6 block">SUNDAY WORSHIP</span>
      <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#2C2C2C] mb-12">주일예배 안내</h2>
      <p className="text-[#2C2C2C] font-light leading-relaxed mb-16 text-lg max-w-2xl break-keep">
        그리스도사랑교회는 매주 주일 오전 9시와 11시에 예배를 드립니다. 처음 오시는 분들도 부담 없이 참석하실 수 있습니다.
      </p>
      <div className="w-full flex flex-col border-t border-[#E5E5E5]">
        {[
          { title: '주일 1부 예배', time: '09:00', location: '본당' },
          { title: '주일 2부 예배', time: '11:00', location: '본당' },
          { title: '주일 오후 예배', time: '15:00', location: '본당' },
        ].map((item) => (
          <div key={item.title} className="flex justify-between items-center py-8 border-b border-[#E5E5E5] hover:bg-[#F4F2EA] transition-colors px-4 group cursor-default">
            <span className="font-bold text-xl text-[#2C2C2C] group-hover:text-[#737373] transition-colors">{item.title}</span>
            <div className="text-right">
              <span className="block text-3xl font-mono font-light tracking-tighter text-[#2C2C2C]">{item.time}</span>
              <span className="text-sm text-[#737373]">{item.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const WorshipOrderSection = () => {
  const items = [
    '예배 시작 10분 전까지 도착하시면 여유롭게 준비하실 수 있습니다.',
    '예배는 찬양, 기도, 말씀, 헌금 순서로 진행됩니다.',
    '처음 오시는 분들을 위해 안내위원이 도와드립니다.',
    '예배 후 애찬(간단한 식사)이 준비되어 있습니다.',
  ]
  return (
    <section className="border-b border-[#171717] bg-[#171717] text-[#FAF9F6]">
      <div className="max-w-[1000px] mx-auto p-12 md:p-24 flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#FAF9F6]/50 font-mono mb-6 block">WORSHIP ORDER</span>
        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF9F6] mb-12">예배 순서 안내</h2>
        <ul className="space-y-10 text-left w-full max-w-2xl mx-auto">
          {items.map((item, idx) => (
            <li key={idx} className={`flex items-start gap-6 ${idx !== items.length - 1 ? 'border-b border-[#E5E5E5]/10 pb-8' : ''}`}>
              <span className="w-1.5 h-1.5 bg-[#FAF9F6] mt-3 rounded-full shrink-0" />
              <span className="text-lg font-light text-[#FAF9F6]/90 leading-relaxed break-keep">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const RegistrationSection = () => (
  <section className="border-b border-[#E5E5E5] bg-[#FAF9F6]">
    <div className="max-w-[1000px] mx-auto p-12 md:p-24 flex flex-col items-center text-center">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-6 block">REGISTRATION</span>
      <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#2C2C2C] mb-12">교인 등록 방법</h2>
      <p className="text-[#2C2C2C] font-light leading-relaxed mb-16 text-lg max-w-2xl break-keep">
        그리스도사랑교회의 정식 교인이 되기를 원하시는 분들은 아래 절차를 통해 등록하실 수 있습니다.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#E5E5E5] border border-[#E5E5E5] w-full">
        {[
          { num: '1', title: '새가족 교실 수료', desc: '9주간의 새가족 교실을 통해 성경과 하나님, 교회에 대해 배웁니다.' },
          { num: '2', title: '등록 신청',        desc: '새가족 교실 수료 후 교인 등록 신청서를 작성합니다.' },
        ].map(({ num, title, desc }) => (
          <div key={num} className="bg-[#FAF9F6] p-12 hover:bg-[#F4F2EA] transition-colors group flex flex-col items-center text-center min-h-[320px]">
            <span className="font-mono text-6xl text-[#E5E5E5] mb-8 group-hover:text-[#171717] transition-colors tracking-tighter">{num}</span>
            <h4 className="text-xl font-bold mb-4 text-[#2C2C2C]">{title}</h4>
            <p className="text-sm text-[#737373] font-light leading-relaxed break-keep">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const curriculum = [
  { week: 'WEEK 1', title: '하나님이 주신 구원',                   verse: '롬 8:1-2, 요 14:6' },
  { week: 'WEEK 2', title: '구원 받은 하나님의 자녀',               verse: '엡 2:1-8' },
  { week: 'WEEK 3', title: '유일한 구원자이신 예수 그리스도',        verse: '행 4:12' },
  { week: 'WEEK 4', title: '성도의 두 가지 싸움',                   verse: '히 12:4, 벧전 5:7-8' },
  { week: 'WEEK 5', title: '배우고 확신한 일에 거하라',              verse: '딤후 3:16-17' },
  { week: 'WEEK 6', title: '영적인 사실을 확인하고 응답 받는 기도',  verse: '요 14:14, 15:16, 16:24' },
  { week: 'WEEK 7', title: '교회에서 예배하는 신앙생활',             verse: '요 4:23-24' },
  { week: 'WEEK 8', title: '그리스도사랑교회의 비전',                verse: '롬 11:3-5' },
  { week: 'WEEK 9', title: '수료식',                               verse: '과정 완료 및 교인 등록' },
]

const ClassCurriculumSection = () => (
  <section className="border-b border-[#E5E5E5] bg-[#FAF9F6]">
    <div className="max-w-[1000px] mx-auto p-12 md:p-24 flex flex-col items-center text-center">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-6 block">NEW FAMILY CLASS</span>
      <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#2C2C2C] mb-12">새가족 교실 과정</h2>
      <p className="text-[#2C2C2C] font-light leading-relaxed mb-16 text-lg max-w-2xl break-keep">
        새가족 교실은 처음 교회에 오신 분들을 위한 9주간 과정입니다. 성경과 하나님, 교회에 대해 알아가고, 신앙의 기초를 다지는 시간입니다.
      </p>
      <div className="w-full flex flex-col border-t border-[#E5E5E5]">
        {curriculum.map((item, idx) => (
          <div key={idx} className="py-6 border-b border-[#E5E5E5] flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 hover:bg-[#F4F2EA] transition-colors">
            <div className="flex items-center gap-6">
              <span className="font-mono text-[#737373] text-sm">{item.week}</span>
              <span className="font-bold text-lg text-[#2C2C2C]">{item.title}</span>
            </div>
            <span className="text-sm text-[#737373] font-mono">{item.verse}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const classInfo = [
  { label: '시간', value: '주일 오전 10시', sub: '(2부 예배 전)' },
  { label: '장소', value: '새가족실',       sub: '(1층 101호실)' },
  { label: '대상', value: '그리스도사랑교회에 처음 오신 분', sub: '' },
  { label: '기간', value: '9주 과정',       sub: '' },
]

const ClassInfoSection = () => (
  <section className="border-b border-[#171717] bg-[#171717] text-[#FAF9F6]">
    <div className="max-w-[1000px] mx-auto p-12 md:p-24 flex flex-col items-center text-center">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#FAF9F6]/50 font-mono mb-6 block">CLASS INFO</span>
      <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF9F6] mb-16">새가족 교실 정보</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 w-full max-w-2xl">
        {classInfo.map((item, idx) => (
          <div key={idx} className="border-t border-[#FAF9F6]/20 pt-8">
            <span className="block text-xs font-mono text-[#FAF9F6]/50 uppercase tracking-widest mb-3">{item.label}</span>
            <span className="block text-xl font-medium text-[#FAF9F6]">{item.value}</span>
            {item.sub && <span className="block text-sm text-[#FAF9F6]/70 mt-1">{item.sub}</span>}
          </div>
        ))}
      </div>
    </div>
  </section>
)

const InvitationSection = () => (
  <section className="border-b border-[#171717] bg-[#171717] text-[#FAF9F6]">
    <div className="max-w-[1000px] mx-auto p-16 md:p-24 flex flex-col items-center text-center">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#FAF9F6]/50 font-mono mb-6 block">INVITATION</span>
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">함께 예배하시길 환영합니다</h2>
      <p className="text-lg font-light text-[#FAF9F6]/80 mb-12 max-w-lg leading-relaxed break-keep">
        그리스도사랑교회는 모든 분들을 환영합니다. 주일에 함께 예배하시길 바랍니다.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
        <Link to="/church/contact" className="w-full sm:w-auto px-10 py-4 border border-[#FAF9F6] text-[#FAF9F6] font-bold text-sm tracking-widest uppercase hover:bg-[#FAF9F6] hover:text-[#171717] transition-colors flex items-center justify-center gap-2">
          오시는 길 <ArrowRight size={18} />
        </Link>
        <Link to="/worship/sermon/sunday-morning" className="w-full sm:w-auto px-10 py-4 bg-[#FAF9F6] border border-[#FAF9F6] text-[#171717] font-bold text-sm tracking-widest uppercase hover:bg-transparent hover:text-[#FAF9F6] transition-colors flex items-center justify-center gap-2">
          주일예배 <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  </section>
)

export default function FirstVisitPage() {
  return (
    <div className="bg-[#FAF9F6] text-[#2C2C2C]">
      <HeroSection />
      <WorshipGuideSection />
      <WorshipOrderSection />
      <RegistrationSection />
      <ClassCurriculumSection />
      <ClassInfoSection />
      <InvitationSection />
    </div>
  )
}
