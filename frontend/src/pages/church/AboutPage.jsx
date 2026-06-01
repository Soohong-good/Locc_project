import { Link } from 'react-router-dom'

const AboutPage = () => (
  <div className="relative" style={{ backgroundColor: '#ffffff' }}>
    {/* ── 고정 배경 이미지 ─────────────────────────────────── */}
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        backgroundImage: 'url(/aboutPage.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    />

    {/* ── Hero — 반투명 (이미지 비침) ─────────────────────── */}
    <section className="pt-page pb-20 px-6 text-white relative" style={{ zIndex: 1, backgroundColor: 'rgba(15,23,42,0.60)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="animate-fade-in-up">
          <p className="text-xs font-medium tracking-[0.3em] uppercase mb-3 text-eyebrow">
            About Church
          </p>
          <h1 className="text-4xl md:text-5xl font-light leading-tight tracking-tight">
            그리스도 사랑교회
          </h1>
          <p className="mt-4 text-lg font-light text-slate-300 max-w-2xl">
            오직 성경, 오직 은혜, 오직 믿음, 오직 그리스도, 오직 하나님께만 영광을 고백하며,
            예배의 감격과 사랑의 교제가 넘치는 제자 공동체입니다.
          </p>
        </div>
      </div>
    </section>

    {/* ── 비전 — 불투명 흰색 (이미지 가려짐) ─────────────── */}
    <section className="py-32 px-6 relative" style={{ zIndex: 1, backgroundColor: '#ffffff' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-20">
          <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-4">Vision</p>
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-6">우리의 비전</h2>
          <div className="h-px w-16 bg-slate-300" />
        </div>
        <div className="space-y-16">
          {[
            { title: '그리스도 중심의 교회', desc: '예수 그리스도가 교회의 머리, 주인, 왕, 목자가 되심을 인정하며\n그리스도의 인도하심을 따라가는 교회입니다.' }, { title: '말씀 중심의 교회',     desc: '성경 말씀을 있는 그대로 가르치고 배우며,\n그 진리를 우리의 삶 가운데 적용하여 하나님의 뜻을 실천하는 교회입니다.' },
            { title: '예배하는 교회',         desc: '살아계신 하나님을 영과 진리로 예배하며,\n예배를 통해 하나님과의 친밀한 교제를 경험하는 교회입니다.' },
            { title: '사랑의 교회',           desc: '하나님의 사랑을 받은 자로서 서로를 진실하게 사랑하고 섬기며,\n세상에 그리스도의 사랑을 전하는 교회입니다.' },
            { title: '제자 세우는 교회',      desc: '자기를 부인하며 자기 십자가를 지고\n예수 그리스도를 따라가는 제자를 세우는 교회입니다.' },
          ].map(({ title, desc }) => (
            <div key={title}>
              <h3 className="text-2xl md:text-3xl font-light text-slate-900 mb-6">{title}</h3>
              <p className="text-lg md:text-xl text-slate-600 leading-[1.9] font-light">
                {desc.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── 핵심 가치 — 반투명 (이미지 비침) ───────────────── */}
    <section className="py-32 px-6 text-white relative" style={{ zIndex: 1, backgroundColor: 'rgba(15,23,42,0.65)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-20">
          <p className="text-xs tracking-[0.3em] uppercase mb-4 text-slate-400">Core Values</p>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">핵심 가치</h2>
          <div className="h-px w-16 bg-white/30" />
        </div>
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {[
            { num: '01', title: '말씀', desc: '성경을 하나님의 살아있는 말씀으로 믿으며, 강해설교를 통해 체계적으로 학습합니다.' },
            { num: '02', title: '예배', desc: '하나님을 경배하는 것을 가장 중요하게 여기며, 진심어린 예배를 드립니다.' },
            { num: '03', title: '기도', desc: '하나님과의 깊은 교제를 위해 끊임없이 기도하며 나아갑니다.' },
            { num: '04', title: '교제', desc: '그리스도 안에서 하나된 형제자매로서 진실한 사랑의 교제를 나눕니다.' },
            { num: '05', title: '전도', desc: '복음을 세상에 전하여 잃어버린 영혼을 구원하는 사명을 감당합니다.' },
            { num: '06', title: '섬김', desc: '그리스도의 마음으로 서로를 섬기고 지역사회를 섬깁니다.' },
          ].map(({ num, title, desc }) => (
            <div key={num} className="space-y-4">
              <div className="text-4xl font-light text-white/25">{num}</div>
              <h3 className="text-2xl font-light text-white">{title}</h3>
              <p className="text-lg text-slate-300 leading-[1.8] font-light">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── 신앙고백 — 불투명 흰색 (이미지 가려짐) ─────────── */}
    <section className="py-32 px-6 relative" style={{ zIndex: 1, backgroundColor: '#ffffff' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-20">
          <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-4">Statement of Faith</p>
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-6">신앙고백</h2>
          <div className="h-px w-16 bg-slate-300 mb-8" />
          <p className="text-lg text-slate-600 leading-[1.9] font-light">
            그리스도사랑교회는 <strong className="font-medium text-slate-900">웨스트민스터 신앙고백</strong>을 믿는 교회입니다.
          </p>
        </div>
        <div className="space-y-12">
          <div className="bg-slate-50 p-8 md:p-10">
            <h3 className="text-xl font-medium text-slate-900 mb-4">웨스트민스터 신앙고백</h3>
            <p className="text-base text-slate-600 leading-[1.9] font-light mb-6">
              웨스트민스터 신앙고백은 1646년 영국 웨스트민스터에서 작성된 개혁신앙의 대표적인 신앙고백서입니다.
              성경의 권위, 삼위일체 하나님, 그리스도의 구속 사역, 오직 은혜로 오직 믿음으로 구원받는다는 복음의 핵심 진리를 명확하게 고백하고 있습니다.
            </p>
            <Link to="/church/confession" className="inline-flex items-center text-slate-900 hover:text-slate-600 font-medium transition-colors">
              웨스트민스터 신앙고백 전문 보기
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="bg-slate-50 p-8 md:p-10">
            <h3 className="text-xl font-medium text-slate-900 mb-4">교회 소속</h3>
            <p className="text-lg text-slate-600 leading-[1.9] font-light">
              그리스도사랑교회는{' '}
              <a href="http://www.rpck.tv/" target="_blank" rel="noreferrer"
                className="font-medium text-slate-900 inline-flex items-center gap-1 hover:text-blue-600 transition-colors border-b border-slate-300 hover:border-blue-600">
                대한예수교장로회총회(개혁)
              </a>
              {' '}소속 교회입니다.
            </p>
          </div>
          {[
            { title: '성경',          desc: '우리는 신구약 성경 66권이 하나님의 영감으로 기록된 오류 없는 하나님의 말씀임을 믿습니다.' },
            { title: '하나님',        desc: '우리는 성부, 성자, 성령 삼위일체 하나님을 믿으며, 그분이 천지를 창조하시고 섭리하시는 분임을 믿습니다.' },
            { title: '예수 그리스도', desc: '우리는 예수 그리스도께서 참 하나님이시며 참 사람이시고, 십자가에서 우리의 죄를 위해 죽으시고 부활하심으로 구원의 길을 열어주셨음을 믿습니다.' },
            { title: '구원',          desc: '우리는 오직 예수 그리스도를 믿는 믿음으로만 구원받으며, 이는 전적인 하나님의 은혜임을 믿습니다.' },
            { title: '교회',          desc: '우리는 교회가 그리스도의 몸이며, 성도들의 모임을 통해 하나님의 나라를 이루어가는 하나님의 백성임을 믿습니다.' },
          ].map(({ title, desc }) => (
            <div key={title} className="border-l-2 border-slate-900 pl-8">
              <h3 className="text-xl font-medium text-slate-900 mb-4">{title}</h3>
              <p className="text-lg text-slate-600 leading-[1.9] font-light">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA — 반투명 (이미지 비침) ──────────────────────── */}
    <section className="py-24 px-6 text-white relative" style={{ zIndex: 1, backgroundColor: 'rgba(15,23,42,0.70)' }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-light text-white mb-6">여러분을 초대합니다</h2>
        <p className="text-lg md:text-xl text-slate-300 mb-12 font-light leading-[1.8]">
          그리스도 사랑교회는 모든 분들을 환영합니다.<br />
          함께 하나님을 예배하고 사랑의 교제를 나누시길 바랍니다.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/church/contact" className="inline-flex items-center px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 transition font-light tracking-wide">
            오시는 길
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link to="/" className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-slate-900 transition font-light tracking-wide">
            홈으로
          </Link>
        </div>
      </div>
    </section>
  </div>
)

export default AboutPage
