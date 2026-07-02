import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Play,
  BookOpen, HandsPraying, Church, Megaphone,
  X,
} from '@phosphor-icons/react'

const serifStyle = { fontFamily: "'Nanum Myeongjo', serif" }

const HeroSection = () => (
  <section
    className="pt-20 border-b border-white/10"
    style={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(15,23,42,0.85)' }}
  >
    <div className="max-w-[1600px] mx-auto min-h-[500px] lg:min-h-[60vh] flex flex-col items-center justify-center text-center px-8 py-24 border-x border-white/10">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-px bg-white/20" />
        <span className="font-mono text-sm tracking-[0.2em] text-white/50 uppercase">The Way of Salvation</span>
        <div className="w-12 h-px bg-white/20" />
      </div>
      <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tight">복음말씀</h1>
      <p className="text-2xl md:text-3xl text-white/70 font-light leading-relaxed max-w-2xl break-keep">
        하나님께서는 우리를 사랑하셔서<br className="hidden sm:block" />
        독생자 예수 그리스도를 보내주셨습니다.
      </p>
    </div>
  </section>
)

const GOSPEL_STEPS = [
  {
    num: '01', title: '하나님의 사랑',
    primaryVerse: { text: '"하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라"', ref: '요한복음 3:16' },
    desc: '하나님은 우리를 창조하셨고, 우리를 사랑하십니다. 하나님께서는 우리가 그분을 알고, 그분과 교제하며, 그분 안에서 기쁨과 평안을 누리기를 원하십니다.',
    secondaryVerse: null,
  },
  {
    num: '02', title: '인간의 죄',
    primaryVerse: { text: '"모든 사람이 죄를 범하였으매 하나님의 영광에 이르지 못하더니"', ref: '로마서 3:23' },
    desc: '그러나 인간은 하나님께 불순종하여 죄를 지었습니다. 죄는 우리를 하나님으로부터 분리시키고, 영원한 사망으로 이끕니다.',
    secondaryVerse: { text: '"죄의 삯은 사망이요 하나님의 은사는 그리스도 예수 우리 주 안에 있는 영생이니라"', ref: '로마서 6:23' },
  },
  {
    num: '03', title: '하나님의 구원',
    primaryVerse: { text: '"그리스도께서 우리를 위하여 저주를 받은 바 되사 율법의 저주에서 우리를 속량하셨으니"', ref: '갈라디아서 3:13' },
    desc: '하나님께서는 우리를 너무나 사랑하셔서 독생자 예수 그리스도를 이 땅에 보내주셨습니다. 예수님은 우리의 죄를 대신하여 십자가에서 죽으시고, 사흘 만에 부활하심으로 죄와 사망의 권세를 이기셨습니다.',
    secondaryVerse: { text: '"우리가 아직 죄인 되었을 때에 그리스도께서 우리를 위하여 죽으심으로 하나님께서 우리에 대한 자기의 사랑을 확증하셨느니라"', ref: '로마서 5:8' },
  },
  {
    num: '04', title: '우리의 응답',
    primaryVerse: { text: '"네가 만일 네 입으로 예수를 주로 시인하며 또 하나님께서 그를 죽은 자 가운데서 살리신 것을 네 마음에 믿으면 구원을 받으리라"', ref: '로마서 10:9' },
    desc: '우리는 예수 그리스도를 우리의 구주로 믿고 시인해야 합니다. 우리의 죄를 회개하고, 예수님을 우리 삶의 주인으로 고백하며, 그분을 믿고 순종해야 합니다.',
    secondaryVerse: { text: '"영접하는 자 곧 그 이름을 믿는 자들에게는 하나님의 자녀가 되는 권세를 주셨으니"', ref: '요한복음 1:12' },
  },
]

const GospelSection = () => (
  <>
    {GOSPEL_STEPS.map((step, idx) => {
      const dark = idx % 2 === 1
      const border = dark ? 'border-white/10' : 'border-[#E5E5E5]'
      return (
        <section key={step.num} className={`border-b ${border}`} style={{ position: 'relative', zIndex: 1, backgroundColor: dark ? 'rgba(15,23,42,0.82)' : '#ffffff' }}>
          <div className={`max-w-[1600px] mx-auto border-x ${border}`}>
            <div className="p-12 md:p-16 lg:p-24 flex flex-col items-center text-center">
              <span className={`font-mono text-base mb-8 block ${dark ? 'text-white/40' : 'text-[#A3A3A3]'}`}>{step.num}</span>
              <h3 className={`text-3xl md:text-4xl font-bold mb-12 ${dark ? 'text-white' : 'text-[#171717]'}`}>{step.title}</h3>
              <div className="space-y-8 max-w-3xl w-full">
                <div className="space-y-3">
                  <p className={`italic text-2xl md:text-3xl leading-[1.8] break-keep ${dark ? 'text-white/90' : 'text-[#171717]'}`} style={serifStyle}>{step.primaryVerse.text}</p>
                  <p className={`text-base font-light ${dark ? 'text-white/50' : 'text-[#A3A3A3]'}`}>{step.primaryVerse.ref}</p>
                </div>
                <p className={`text-lg md:text-xl font-light leading-[1.9] break-keep ${dark ? 'text-white/75' : 'text-[#737373]'}`}>{step.desc}</p>
                {step.secondaryVerse && (
                  <div className={`space-y-3 pt-4 border-t ${border}`}>
                    <p className={`italic text-xl md:text-2xl leading-[1.8] break-keep ${dark ? 'text-white/90' : 'text-[#171717]'}`} style={serifStyle}>{step.secondaryVerse.text}</p>
                    <p className={`text-base font-light ${dark ? 'text-white/50' : 'text-[#A3A3A3]'}`}>{step.secondaryVerse.ref}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )
    })}
    <section className="border-b border-white/10" style={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(15,23,42,0.82)' }}>
      <div className="max-w-[1600px] mx-auto border-x border-white/10">
        <div className="p-12 md:p-16 lg:p-24 flex flex-col items-center">
          <div className="bg-white/10 border border-white/20 text-white p-8 md:p-12 max-w-3xl w-full text-center">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-white/50 mb-8">회개의 기도</h4>
            <div className="space-y-6 text-lg md:text-xl font-light leading-[1.9] text-white/90 break-keep">
              <p>사랑의 하나님!</p>
              <p>저는 전적으로 타락한 죄인입니다.<br />지금까지 죄 아래서 하나님을 모르며 제가 주인이 되어서 살았습니다.</p>
              <p>저의 모든 죄를 회개하며, 오직 하나님의 은혜로 예수님이 나를 위해서<br />이 땅에 오셔서 십자가에서 죽으시고 부활하신 그리스도라는 사실을 믿습니다.</p>
              <p>나의 공로가 아닌 예수님의 의로우심을 의지하며,<br />예수님을 나의 구주, 나의 주인으로 믿습니다.</p>
              <p>예수 그리스도와 연합된 구원받은 자로 살도록 인도해주세요.<br />살아계신 예수 그리스도 이름으로 기도합니다.</p>
              <p className="pt-2">아멘.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </>
)

const NEW_LIFE_ITEMS = [
  { icon: BookOpen,     title: '성경 읽기', desc: '매일 성경을 읽으며 하나님의 말씀으로 양육받으세요.' },
  { icon: HandsPraying, title: '기도',      desc: '하나님과 대화하며 그분과의 관계를 깊이 해가세요.' },
  { icon: Church,       title: '예배',      desc: '교회에 출석하여 하나님을 예배하고 교제하세요.' },
  { icon: Megaphone,    title: '전도',      desc: '다른 사람들에게 복음을 전하며 하나님의 사랑을 나누세요.' },
]

const NewLifeSection = () => (
  <section className="bg-[#FFFFFF]" style={{ position: 'relative', zIndex: 1 }}>
    <div className="max-w-[1600px] mx-auto px-8 py-24 md:py-32 border-x border-[#E5E5E5] flex flex-col items-center text-center">
      <span className="font-mono text-[#A3A3A3] text-base mb-6 block">05</span>
      <h2 className="text-5xl font-bold text-[#171717] mb-12">새로운 삶</h2>
      <div className="max-w-3xl">
        <p className="italic text-2xl md:text-3xl text-[#171717] leading-[1.8] break-keep mb-6" style={serifStyle}>
          "그런즉 누구든지 그리스도 안에 있으면 새로운 피조물이라 이전 것은 지나갔으니 보라 새 것이 되었도다"
        </p>
        <p className="text-base text-[#A3A3A3] font-light">고린도후서 5:17</p>
      </div>
    </div>
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-[#E5E5E5] gap-px border-x border-b border-[#E5E5E5]">
      {NEW_LIFE_ITEMS.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="bg-white p-12 hover:bg-neutral-50 transition-colors group flex flex-col min-h-[320px]">
          <Icon size={30} className="text-[#E5E5E5] group-hover:text-[#171717] transition-colors mb-10" />
          <h4 className="text-xl font-bold text-[#171717] mb-4">{title}</h4>
          <p className="text-base text-[#737373] font-light leading-relaxed break-keep mt-auto">{desc}</p>
        </div>
      ))}
    </div>
  </section>
)

const VIDEOS = [
  { id: 'SaKP1_ppwyA', startTime: null,  date: '2026년 1월 2일 금요기도회 말씀', title: '예수님은 누구신가 1', subtitle: '죄에서 우리를 구원할 예수 (마태복음 1:18–23)' },
  { id: 'cHtB4Id_Nyw',  startTime: 7869, date: '2024년 12월 22일',              title: '성탄생명초청축제 말씀', subtitle: null },
]

const VideoSection = () => {
  const [activeVideo, setActiveVideo] = useState(null)
  return (
    <section className="bg-[#FFFFFF]" style={{ position: 'relative', zIndex: 1 }}>
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/90" onClick={() => setActiveVideo(null)}>
          <div className="w-full max-w-5xl" onClick={e => e.stopPropagation()}>
            <div className="aspect-video">
              <iframe width="100%" height="100%"
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1${activeVideo.startTime ? `&start=${activeVideo.startTime}` : ''}`}
                title={activeVideo.title} frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen className="w-full h-full"
              />
            </div>
            <button onClick={() => setActiveVideo(null)} className="mt-6 flex items-center gap-2 text-white/50 hover:text-white text-sm uppercase tracking-[0.15em] transition-colors">
              <X size={16} /> 닫기
            </button>
          </div>
        </div>
      )}
      <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5]">
        <div className="px-12 md:px-16 lg:px-24 py-24 md:py-32 border-b border-[#E5E5E5]">
          <span className="font-mono text-[#A3A3A3] text-base mb-6 block">06</span>
          <h2 className="text-5xl font-bold text-[#171717] mb-4">복음 영상</h2>
          <p className="text-xl text-[#737373] font-light break-keep leading-relaxed">복음 메시지를 담은 영상을 통해 예수님을 더 깊이 알아가세요.</p>
        </div>
        {VIDEOS.map((video, idx) => {
          const reversed = idx % 2 === 1
          return (
            <div key={video.id} className={`grid grid-cols-1 lg:grid-cols-12 border-b border-[#E5E5E5] ${idx > 0 ? 'mt-20 md:mt-28 border-t' : ''}`}>
              <div className={`lg:col-span-5 px-12 md:px-16 lg:px-24 py-20 md:py-28 flex flex-col justify-center bg-white border-b lg:border-b-0 ${reversed ? 'lg:border-l order-first lg:order-last' : 'lg:border-r'} border-[#E5E5E5]`}>
                <p className="text-base text-[#A3A3A3] mb-4">{video.date}</p>
                <h3 className="text-2xl md:text-3xl font-bold text-[#171717] leading-tight break-keep">
                  {video.title}
                  {video.subtitle && <span className="font-normal text-xl mt-3 block text-[#737373]">{video.subtitle}</span>}
                </h3>
              </div>
              <button className={`lg:col-span-7 relative bg-[#0f0f0f] group cursor-pointer overflow-hidden border-b lg:border-b-0 border-[#E5E5E5] ${reversed ? 'order-last lg:order-first' : ''}`}
                style={{ aspectRatio: '16/9', minHeight: '300px' }} onClick={() => setActiveVideo(video)}>
                <img src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:border-white transition-all duration-500">
                    <Play size={24} weight="fill" className="text-white group-hover:text-[#171717] transition-colors duration-500" />
                  </div>
                </div>
              </button>
            </div>
          )
        })}
        <div className="px-12 md:px-16 lg:px-24 py-20 flex justify-center">
          <a href="https://www.youtube.com/@그리스도사랑교회-k4z" target="_blank" rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 text-base font-bold tracking-[0.1em] uppercase border-b border-[#171717] pb-1 hover:text-[#737373] hover:border-[#737373] transition-all">
            <span>교회 유튜브 채널 방문하기</span>
            <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  )
}

const CTASection = () => (
  <section style={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(15,23,42,0.90)' }}>
    <div className="max-w-[1600px] mx-auto px-8 py-32 md:py-40 text-center border-x border-white/10">
      <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-8">예수님을 믿고 더 알기를 원하시나요?</h2>
      <p className="text-xl md:text-2xl text-[#A3A3A3] font-light mb-16 max-w-2xl mx-auto leading-relaxed break-keep">
        더 자세한 상담이나 도움이 필요하시면<br className="hidden sm:block" />
        언제든지 연락 주시거나 교회를 방문해 주세요.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/church/contact" className="w-full sm:w-auto px-10 py-4 bg-white text-[#171717] text-base font-bold tracking-[0.1em] uppercase hover:bg-neutral-200 transition-colors">교회 연락처</Link>
        <Link to="/help" className="w-full sm:w-auto px-10 py-4 border border-white/20 text-white text-base font-bold tracking-[0.1em] uppercase hover:bg-white/10 transition-colors">도움 요청</Link>
      </div>
    </div>
  </section>
)

export default function SalvationPage() {
  return (
    <div className="relative text-[#171717] selection:bg-[#171717] selection:text-white min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'url(/images/bg-hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&display=swap');`}</style>
      <HeroSection />
      <GospelSection />
      <NewLifeSection />
      <VideoSection />
      <CTASection />
    </div>
  )
}
