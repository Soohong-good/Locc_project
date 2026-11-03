import { BookOpen, Clock, Info, CheckCircle, CaretRight, Desktop, ChalkboardTeacher, Books } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

const programInfoItems = [
  { label: 'Program', value: '리딩지저스 성경읽기' },
  { label: 'Duration', value: '12주 과정' },
  { label: 'Location', value: '교육관 3층' },
  { label: 'Application', value: '교회 사무실 문의' },
]

const features = [
  {
    num: '01',
    icon: <BookOpen size={36} className="text-[#D4D4D4]" />,
    title: '성경 전체 개관',
    desc: '구약과 신약 전체를 균형 있게 읽으며 하나님의 구원 역사를 한눈에 파악합니다.',
  },
  {
    num: '02',
    icon: <Clock size={36} className="text-[#D4D4D4]" />,
    title: '체계적 통독',
    desc: '단순한 읽기를 넘어 본문의 맥락과 흐름을 이해하며 말씀 속에 깊이 들어갑니다.',
  },
  {
    num: '03',
    icon: <Info size={36} className="text-[#D4D4D4]" />,
    title: '소그룹 나눔',
    desc: '함께 읽고 나누며 공동체 안에서 말씀이 삶이 되는 경험을 합니다.',
  },
  {
    num: '04',
    icon: <BookOpen size={36} className="text-[#D4D4D4]" />,
    title: '1년 1독 완성',
    desc: '계획적인 읽기 일정을 통해 1년 안에 성경 1독을 완성할 수 있도록 돕습니다.',
  },
]

const processSteps = [
  { step: '01', title: '등록 및 오리엔테이션', desc: '참가 신청 후 오리엔테이션을 통해 리딩지저스 방법론과 일정을 안내합니다.' },
  { step: '02', title: '매주 읽기 & 소그룹', desc: '정해진 본문을 주중에 개인으로 읽고, 주말 소그룹에서 함께 나눕니다.' },
  { step: '03', title: '수료 및 다음 단계', desc: '12주 과정 수료 후 그사랑 제자대학 진학 등 다음 훈련 단계로 연결됩니다.' },
]

const semesterCurriculum = {
  spring: ['조직신학', '성경', '교리사', '성경의 세계관', '소명'],
  fall: ['조직신학', '성경', '교리사', '성경의 세계관', '소명'],
}

const SUBJECT_DESC = {
  '조직신학': '성경이 가르치는 신앙 체계',
  '성경': '구약과 신약의 이해',
  '교리사': '교회의 역사와 전통',
  '성경의 세계관': '그리스도인의 삶의 원리',
  '소명': '부르심에 응답하는 삶',
}

const specialLectures = [
  { num: '01', icon: <BookOpen size={36} />, title: '묵상훈련', desc: '하나님의 말씀을 묵상하고 기록하며 깊은 교제를 누리는 훈련' },
  { num: '02', icon: <Desktop size={36} />, title: '정보교육', desc: '교회의 기본적인 시스템과 정보를 배우는 교육' },
  { num: '03', icon: <ChalkboardTeacher size={36} />, title: '교사세미나', desc: '다음 세대를 위한 교사역할을 위한 세미나' },
  { num: '04', icon: <Books size={36} />, title: '신학세미나', desc: '신약과 주제를 깊이 있게 다루는 세미나' },
]

const HeroSection = () => (
  <section className="pt-20 border-b border-[#171717] bg-[#171717] text-[#FAF9F6] overflow-hidden relative">
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/bg-training.jpg')" }} />
    <div className="absolute inset-0" style={{ background: 'rgba(23,23,23,0.75)' }} />
    <div className="relative z-10 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-white/10 min-h-[600px] lg:min-h-[700px]">
      <div className="lg:col-span-8 p-8 md:p-16 lg:p-24 flex flex-col justify-end">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-white/60 font-mono mb-8 block">Training</span>
        <h1 className="text-6xl md:text-8xl lg:text-[8rem] font-bold tracking-tighter leading-none text-[#FAF9F6] mb-6 break-keep">훈련소개</h1>
        <p className="text-xl md:text-2xl font-light text-white/70 max-w-2xl break-keep">
          말씀과 훈련을 통해 그리스도의 제자로 세워지는 과정입니다.
        </p>
      </div>
      <div className="lg:col-span-4 bg-[#141414] border-l border-white/10 p-8 md:p-16 flex flex-col justify-end">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-white/40 font-mono mb-6 block">Programs</span>
        <ul className="space-y-4 text-white/70">
          {['01 리딩지저스 성경읽기', '02 그사랑 제자대학', '03 특강 및 기타 훈련'].map(item => (
            <li key={item} className="flex items-center gap-3 text-base font-light">
              <CaretRight size={14} className="text-white/40 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
)

const ProgramInfoSection = () => (
  <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-[#E5E5E5] border-x border-[#E5E5E5]">
      {programInfoItems.map(({ label, value }) => (
        <div key={label} className="p-6 sm:p-8 md:p-12 flex flex-col">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#737373] mb-3">{label}</span>
          <span className="text-xl font-bold text-[#2C2C2C]">{value}</span>
        </div>
      ))}
    </div>
  </section>
)

const ReadingJesusSection = () => (
  <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] relative overflow-hidden">
      <span className="text-[120px] lg:text-[200px] font-mono font-bold text-[#2C2C2C]/5 absolute -top-10 right-4 md:right-12 leading-none select-none z-0">01</span>
      <div className="relative z-10 pt-10 pb-0 p-8 md:p-16 lg:p-24">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-4 block">Bible Reading</span>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#2C2C2C]">리딩지저스 성경읽기</h2>
      </div>
    </div>
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E5] border-x border-[#E5E5E5]">
      <div className="lg:col-span-5 p-8 md:p-16 lg:p-24 bg-[#171717] flex flex-col justify-center">
        <h3 className="text-3xl font-bold text-[#FAF9F6] mb-8 break-keep">리딩지저스란?</h3>
        <p className="text-lg text-white/70 font-light leading-relaxed break-keep mb-6">
          리딩지저스는 성경 전체를 체계적으로 읽으며 하나님의 말씀을 가까이 하고 성경이 가르치는
          예수 그리스도를 깊이 알아가는 성경읽기 프로그램입니다.
        </p>
        <p className="text-lg text-white/70 font-light leading-relaxed break-keep">
          개인 읽기와 소그룹 나눔을 통해 말씀이 삶이 되는 경험을 함께합니다.
        </p>
      </div>
      <div className="lg:col-span-7 p-8 md:p-16 lg:p-24 bg-[#FAF9F6]">
        <h4 className="text-xl font-bold text-[#2C2C2C] mb-8 border-b border-[#E5E5E5] pb-4">프로그램 안내</h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {[
            { dt: '대상', dd: '등록 교인 누구나' },
            { dt: '기간', dd: '매년 1월 ~ 12월 (연간 운영)' },
            { dt: '시간', dd: '주일 오후 (소그룹별 조율)' },
            { dt: '장소', dd: '교육관 소그룹실' },
          ].map(({ dt, dd }) => (
            <div key={dt}>
              <dt className="text-xs font-mono uppercase tracking-widest text-[#737373] mb-2">{dt}</dt>
              <dd className="text-lg font-medium text-[#2C2C2C]">{dd}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
)

const FeaturesSection = () => (
  <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-[#E5E5E5] gap-px border-x border-[#E5E5E5]">
      {features.map(({ num, icon, title, desc }) => (
        <div key={num} className="bg-[#FAF9F6] p-8 md:p-12 hover:bg-[#F4F2EA] transition-colors flex flex-col min-h-[300px]">
          <div className="mb-8">{icon}</div>
          <h4 className="text-xl font-bold mb-4 flex items-center gap-3 text-[#2C2C2C]">
            <span className="font-mono text-[#E5E5E5] text-lg font-bold">{num}</span>
            {title}
          </h4>
          <p className="text-sm text-[#737373] font-light leading-relaxed mt-auto break-keep">{desc}</p>
        </div>
      ))}
    </div>
  </section>
)

const ProcessSection = () => (
  <section className="bg-[#171717] text-[#FAF9F6] border-b border-[#333333]">
    <div className="max-w-[1600px] mx-auto border-x border-[#333333]">
      <div className="p-8 md:p-16 lg:p-24 border-b border-[#333333]">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-white/40 font-mono mb-4 block">Process</span>
        <h2 className="text-4xl font-bold tracking-tight text-[#FAF9F6]">진행 방식</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#333333]">
        {processSteps.map(({ step, title, desc }) => (
          <div key={step} className="p-8 md:p-16 lg:p-20 flex flex-col min-h-[280px]">
            <span className="text-4xl font-mono font-bold text-[#333333] mb-8">{step}</span>
            <h3 className="text-xl font-bold text-[#FAF9F6] mb-4">{title}</h3>
            <p className="text-white/50 font-light leading-relaxed break-keep text-sm mt-auto">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const DiscipleUniversitySection = () => (
  <section className="bg-[#FAF9F6] border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] relative overflow-hidden">
      <span className="text-[120px] lg:text-[200px] font-mono font-bold text-[#2C2C2C]/5 absolute -top-10 right-4 md:right-12 leading-none select-none z-0">02</span>
      <div className="relative z-10 pt-10 pb-0 p-8 md:p-16 lg:p-24">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-4 block">Disciple University</span>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#2C2C2C]">그사랑 제자대학</h2>
      </div>
    </div>
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E5] border-x border-[#E5E5E5]">
      <div className="p-8 md:p-16 lg:p-20">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#737373] mb-4 block">Spring Semester</span>
        <h3 className="text-2xl font-bold text-[#2C2C2C] mb-8">봄학기</h3>
        <p className="text-[#737373] font-light mb-8 break-keep">봄학기에는 신앙의 기초를 다지는 핵심 과목들을 수강합니다.</p>
        <ul className="space-y-4">
          {semesterCurriculum.spring.map(item => (
            <li key={item} className="flex items-start gap-4">
              <CheckCircle size={24} weight="fill" className="text-[#555] mt-0.5 shrink-0" />
              <div>
                <strong className="text-[#2C2C2C] font-medium block mb-1">{item}</strong>
                <span className="text-[#737373] text-sm font-light">{SUBJECT_DESC[item]}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-[#141414] p-8 md:p-16 lg:p-20">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 mb-4 block">Fall Semester</span>
        <h3 className="text-2xl font-bold text-[#FAF9F6] mb-8">가을학기</h3>
        <p className="text-white/50 font-light mb-8 break-keep">가을학기에는 심화 과정과 현장 적용을 중심으로 훈련합니다.</p>
        <ul className="space-y-4">
          {semesterCurriculum.fall.map(item => (
            <li key={item} className="flex items-start gap-4">
              <CheckCircle size={24} weight="fill" className="text-[#555] mt-0.5 shrink-0" />
              <div>
                <strong className="text-white font-medium block mb-1 text-lg">{item}</strong>
                <span className="text-[#A3A3A3] text-sm font-light break-keep block leading-relaxed">{SUBJECT_DESC[item]}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-12 p-8 bg-[#141414] border border-[#333]">
          <h4 className="text-xl font-bold mb-4 text-white">수강 대상</h4>
          <strong className="block text-xl font-medium mb-4 text-[#E5E5E5]">새가족반 수료자</strong>
          <p className="text-[#A3A3A3] font-light leading-relaxed break-keep">
            새가족반을 수료하신 모든 분들이 참여하실 수 있습니다.
            연 2회 진행되며, 봄학기 또는 가을학기에 등록하실 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  </section>
)

const SpecialLecturesSection = () => (
  <section className="bg-[#FAF9F6] text-[#2C2C2C] border-b border-[#E5E5E5]">
    <div className="max-w-[1600px] mx-auto p-8 md:p-16 lg:p-24 border-x border-[#E5E5E5] relative overflow-hidden">
      <span className="text-[120px] lg:text-[200px] font-mono font-bold text-[#2C2C2C]/5 absolute -top-12 right-4 md:right-12 lg:right-20 leading-none select-none z-0">03</span>
      <div className="relative z-10 pt-10 pb-4">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#737373] font-mono mb-4 block">Special Lectures</span>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">특강 및 기타 훈련</h2>
      </div>
    </div>
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-[#E5E5E5] gap-px border-x border-[#E5E5E5]">
      {specialLectures.map(({ num, icon, title, desc }) => (
        <div key={num} className="bg-[#FAF9F6] p-8 md:p-12 hover:bg-[#F4F2EA] transition-colors flex flex-col min-h-[300px]">
          <div className="mb-8 text-[#D4D4D4]">{icon}</div>
          <h4 className="text-xl font-bold mb-4 flex items-center gap-3 text-[#2C2C2C]">
            <span className="font-mono text-[#E5E5E5] text-lg font-bold">{num}</span>
            {title}
          </h4>
          <p className="text-sm text-[#737373] font-light leading-relaxed mt-auto break-keep">{desc}</p>
        </div>
      ))}
    </div>
  </section>
)

const CTASection = () => (
  <section className="bg-[#171717] text-[#FAF9F6] border-b border-[#333333]">
    <div className="max-w-[1600px] mx-auto p-16 md:p-24 lg:p-32 flex flex-col items-center text-center border-x border-[#333333]">
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">훈련에 참여하고 싶으신가요?</h2>
      <p className="text-lg text-[#A3A3A3] font-light mb-12 max-w-2xl break-keep leading-relaxed">
        아래 훈련 프로그램에 대해 자세히 알아보고, 교회 사무실로 문의해 주세요.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
        <a
          href="#"
          className="w-full sm:w-auto px-10 py-5 bg-[#FAF9F6] text-[#2C2C2C] font-bold text-sm tracking-[0.2em] uppercase hover:bg-[#E5E5E5] transition-colors text-center"
        >
          온라인 신청
        </a>
        <Link
          to="/church/contact"
          className="w-full sm:w-auto px-10 py-5 border border-[#555] text-[#FAF9F6] font-bold text-sm tracking-[0.2em] uppercase hover:bg-[#222] transition-colors text-center"
        >
          교회 사무실 문의
        </Link>
      </div>
    </div>
  </section>
)

export default function TrainingIntroPage() {
  return (
    <main className="bg-[#FAF9F6] text-[#2C2C2C]">
      <HeroSection />
      <ProgramInfoSection />
      <ReadingJesusSection />
      <FeaturesSection />
      <ProcessSection />
      <DiscipleUniversitySection />
      <SpecialLecturesSection />
      <CTASection />
    </main>
  )
}
