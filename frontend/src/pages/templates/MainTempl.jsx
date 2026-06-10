import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight, ArrowUpRight, Play, X,
  Baby, Star, Backpack, Books, GraduationCap, Globe,
  Handshake, Heartbeat, SpeakerNone, Plus, MapPin,
} from '@phosphor-icons/react'
import { getNewYearVideo, getLatestSundayMorning2 } from '@/api/sermons'
import TemplHeader from './components/TemplHeader'
import TemplFooter from './components/TemplFooter'

// ── 비디오 모달 ────────────────────────────────────────────────────────────
const VideoModal = ({ videoId, onClose }) => {
  if (!videoId) return null
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
      >
        <X size={32} />
      </button>
      <div
        className="w-full max-w-5xl mx-4 aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    </div>
  )
}

// ── 히어로 섹션 ────────────────────────────────────────────────────────────
const HeroSection = () => (
  <section className="pt-20 border-b border-neutral-200 bg-white">
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-5rem)] divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 border-x border-neutral-200">
      {/* 텍스트 */}
      <div className="lg:col-span-7 flex flex-col justify-center p-8 md:p-16 lg:p-24 xl:p-32 bg-white">
        <div className="flex items-center gap-4 mb-10">
          <span className="w-12 h-px bg-neutral-900" />
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400 font-mono">
            2026 Church Motto
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter leading-[1.1] text-neutral-900 mb-10 break-keep">
          "여호와의 거룩한<br />
          이름을 위함이라"
        </h1>

        <p className="text-[22px] text-neutral-400 mb-12 font-medium">에스겔 36:22</p>

        <div className="space-y-6 text-neutral-500 leading-relaxed font-light break-keep max-w-lg mb-16 text-xl">
          <p>"그러므로 너는 이스라엘 족속에게 이르기를 주 여호와께서 이같이 말씀하시되</p>
          <p>이스라엘 족속아 내가 이렇게 행함은{' '}
            <strong className="font-medium text-neutral-900">너희를 위함이 아니요</strong>{' '}
            너희가 들어간 그 이방 중에서 더럽힌{' '}
            <strong className="font-medium text-neutral-900">나의 거룩한 이름을 위함이라</strong>"
          </p>
        </div>

        <Link to="/salvation"
          className="group inline-flex items-center gap-4 text-sm font-bold tracking-[0.1em] uppercase border-b border-neutral-900 pb-2 hover:text-neutral-500 hover:border-neutral-500 transition-all w-fit">
          <span>복음말씀 듣기</span>
          <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 이미지 */}
      <div className="lg:col-span-5 relative min-h-[500px] lg:min-h-full bg-neutral-50">
        <img
          src="https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2938&auto=format&fit=crop"
          alt="Church Architecture"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  </section>
)

// ── 예배 소개 섹션 ─────────────────────────────────────────────────────────
const SCRIPTURES = [
  {
    num: '01',
    ref: '이사야 43:7',
    text: '내 이름으로 불려지는 모든 자 곧\n내가 내 영광을 위하여 창조한 자를 오게 하라\n그를 내가 지었고 그를 내가 만들었느니라',
  },
  {
    num: '02',
    ref: '시편 16:11',
    text: '주께서 생명의 길을 내게 보이시리니\n주의 앞에는 충만한 기쁨이 있고\n주의 오른쪽에는 영원한 즐거움이 있나이다',
  },
  {
    num: '03',
    ref: '요한복음 4:23',
    text: '아버지께 참되게 예배하는 자들은\n영과 진리로 예배할 때가 오나니 곧 이 때라\n아버지께서는 자기에게 이렇게 예배하는 자들을 찾으시느니라',
  },
]

const AboutWorshipSection = () => (
  <section className="border-b border-neutral-200 bg-white">
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 border-x border-neutral-200">
      {/* 왼쪽 설명 */}
      <div className="lg:col-span-5 p-8 md:p-16 lg:p-24 xl:p-32 flex flex-col justify-center bg-white">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400 font-mono mb-6 block">
          About Worship
        </span>
        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-12">그리스도 사랑교회의 예배</h2>
        <h3 className="text-xl font-bold mb-6 text-neutral-900">우리의 믿음</h3>
        <div className="space-y-6 text-neutral-500 leading-relaxed font-light break-keep">
          <p>"하나님을 영화롭게 하며 그를 영원토록 즐거워하는 것"을 삶의 제일 되는 목적으로 삼은 성도들이 모여 영과 진리로 예배를 드립니다.</p>
          <p>우리는 교회의 여러 사역 중 예배를 가장 소중히 여기며, 살아계신 삼위일체 하나님을 경배하고 기도하며, 선포되는 강해 설교를 통해 하나님의 말씀을 듣습니다.</p>
        </div>
      </div>

      {/* 오른쪽 말씀 목록 */}
      <div className="lg:col-span-7 flex flex-col divide-y divide-neutral-200 bg-neutral-50/30">
        {SCRIPTURES.map(({ num, ref, text }) => (
          <div key={num}
            className="flex-1 p-8 md:p-16 lg:p-20 flex flex-col justify-center hover:bg-neutral-50 transition-colors">
            <span className="text-xs font-mono text-neutral-400 mb-6 block">{num}</span>
            <h4 className="text-lg font-bold mb-4">{ref}</h4>
            <p className="text-neutral-500 font-light leading-relaxed break-keep max-w-xl whitespace-pre-line">{text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

// ── 예배 안내 섹션 ─────────────────────────────────────────────────────────
const SUNDAY = [
  { name: '1부 예배', time: '09:00', place: '본당' },
  { name: '2부 예배', time: '11:00', place: '본당' },
  { name: '오후 예배', time: '15:00', place: '본당' },
]
const WEEKDAY = [
  { name: '수요 예배', time: '20:00', place: '본당' },
  { name: '금요 기도회', time: '21:00', place: '본당' },
  { name: '새벽 기도', time: '05:30', place: '101호' },
]
const DEPARTMENTS = [
  { name: '태영아부', time: '13:30', place: '204호' },
  { name: '유아유치부', time: '11:00', place: '204호' },
  { name: '초등부', time: '09:00', place: '206호' },
  { name: '중·고등부', time: '10:30', place: '205호' },
  { name: '대학청년부', time: '13:00', place: '교육관3층' },
  { name: '다민족부', time: '13:00', place: '206호' },
  { name: '새가족부', time: '10:00', place: '101호' },
  { name: '치유부', time: '13:10', place: '101호' },
]

const ScheduleItem = ({ name, time, place, small }) => (
  <li className={`flex justify-between items-end ${small ? 'py-3' : 'py-5'} border-b border-neutral-200 group`}>
    <span className="font-medium text-neutral-900 group-hover:text-neutral-500 transition-colors">{name}</span>
    <div className={`${small ? 'flex gap-4 items-baseline' : 'text-right'}`}>
      {small && <span className="text-xs text-neutral-400">{place}</span>}
      <span className={`${small ? 'text-lg' : 'block text-2xl'} font-bold font-mono tracking-tighter text-neutral-900`}>{time}</span>
      {!small && <span className="text-xs text-neutral-400">{place}</span>}
    </div>
  </li>
)

const ScheduleSection = () => (
  <section className="border-b border-neutral-200 bg-white">
    <div className="max-w-[1600px] mx-auto p-8 md:p-16 lg:p-24 border-x border-b border-neutral-200 bg-white">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400 font-mono mb-4 block">Schedule</span>
      <h2 className="text-4xl font-bold tracking-tight">예배 안내</h2>
    </div>
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 border-x border-neutral-200 bg-white">
      {/* 주일예배 */}
      <div className="p-8 md:p-16 lg:p-20">
        <span className="text-xs font-mono text-neutral-400 mb-6 block uppercase tracking-widest">Sunday</span>
        <h3 className="text-2xl font-bold mb-12">주일예배</h3>
        <ul>
          {SUNDAY.map((s) => <ScheduleItem key={s.name} {...s} />)}
        </ul>
      </div>
      {/* 주중예배 */}
      <div className="p-8 md:p-16 lg:p-20">
        <span className="text-xs font-mono text-neutral-400 mb-6 block uppercase tracking-widest">Weekday</span>
        <h3 className="text-2xl font-bold mb-12">주중예배</h3>
        <ul>
          {WEEKDAY.map((s) => <ScheduleItem key={s.name} {...s} />)}
        </ul>
      </div>
      {/* 부서예배 */}
      <div className="p-8 md:p-16 lg:p-20">
        <span className="text-xs font-mono text-neutral-400 mb-6 block uppercase tracking-widest">Department</span>
        <h3 className="text-2xl font-bold mb-12">부서예배</h3>
        <ul>
          {DEPARTMENTS.map((s) => <ScheduleItem key={s.name} {...s} small />)}
        </ul>
      </div>
    </div>
  </section>
)

// ── 강단 말씀 섹션 ─────────────────────────────────────────────────────────
const extractVideoId = (url) => {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1)
    return u.searchParams.get('v') || null
  } catch {
    return null
  }
}

const TABS = [
  { label: '송구영신예배', href: '/worship/newyear' },
  { label: '최근 설교',   href: '/worship/sermon/sunday-morning' },
]

const SermonSection = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [modalVideoId, setModalVideoId] = useState(null)

  const { data: newYearData } = useQuery({
    queryKey: ['newyear', 'latest'],
    queryFn: getNewYearVideo,
    staleTime: 10 * 60 * 1000,
  })

  const { data: sundayData } = useQuery({
    queryKey: ['sermon', 'sunday-morning', 2, 'latest'],
    queryFn: getLatestSundayMorning2,
    staleTime: 5 * 60 * 1000,
  })

  const newYearVideoId   = newYearData?.latestVideoId ?? null
  const latestSermon     = sundayData?.latestSermon ?? null
  const latestVideoId    = extractVideoId(latestSermon?.videoUrl)

  // 현재 탭에 해당하는 videoId
  const currentVideoId = activeTab === 0 ? newYearVideoId : latestVideoId

  // 썸네일
  const thumbSrc = currentVideoId
    ? `https://img.youtube.com/vi/${currentVideoId}/maxresdefault.jpg`
    : 'https://images.unsplash.com/photo-1447015237013-0e80b2786ddc?q=80&w=2000&auto=format&fit=crop'

  // 탭별 타이틀 텍스트
  const thumbLabel = activeTab === 0
    ? { sub: '송구영신예배 · 겔 36:22-31', title: '하나님의 거룩한 이름을 위함이라' }
    : { sub: latestSermon?.sermonDate ?? '주일 오전 2부', title: latestSermon?.title ?? '최근 설교' }

  return (
    <>
      <section className="border-b border-neutral-200 bg-white">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 border-x border-neutral-200">

          {/* 왼쪽 탭 */}
          <div className="lg:col-span-5 p-8 md:p-16 lg:p-24 bg-white flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400 font-mono mb-6 block">
                Sermon Archive
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-16">강단 말씀</h2>
              <div className="flex flex-col gap-2">
                {TABS.map((tab, i) => (
                  <button key={tab.label}
                    onClick={() => setActiveTab(i)}
                    className={`flex justify-between items-center text-left py-5 border-b group transition-colors ${
                      activeTab === i
                        ? 'border-neutral-900 text-neutral-900'
                        : 'border-neutral-200 text-neutral-400 hover:text-neutral-900'
                    }`}>
                    <span className={`text-lg group-hover:translate-x-2 transition-transform ${activeTab === i ? 'font-bold' : 'font-medium'}`}>
                      {tab.label}
                    </span>
                    <ArrowRight size={20} className={activeTab !== i ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-16">
              <Link to={TABS[activeTab].href}
                className="inline-flex items-center gap-2 text-sm font-bold tracking-[0.1em] uppercase hover:text-neutral-500 transition-colors border-b border-neutral-900 pb-1 hover:border-neutral-500">
                전체 설교 보기 <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>

          {/* 오른쪽 썸네일 */}
          <div
            onClick={() => currentVideoId && setModalVideoId(currentVideoId)}
            className={`lg:col-span-7 relative group overflow-hidden min-h-[500px] bg-neutral-900 ${currentVideoId ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <img
              src={thumbSrc}
              alt={thumbLabel.title}
              className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-1000 ease-out"
              onError={(e) => {
                if (currentVideoId) {
                  e.currentTarget.src = `https://img.youtube.com/vi/${currentVideoId}/mqdefault.jpg`
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent group-hover:from-black/80 transition-colors duration-500" />
            <div className="absolute inset-0 p-8 md:p-16 lg:p-24 flex flex-col justify-end">
              <span className="text-white/70 font-mono text-sm mb-4 tracking-widest uppercase">
                {thumbLabel.sub}
              </span>
              <h3 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-10 break-keep">
                {thumbLabel.title}
              </h3>
              {currentVideoId && (
                <div className="w-16 h-16 bg-white text-neutral-900 flex items-center justify-center shadow-lg group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-300">
                  <Play size={20} weight="fill" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <VideoModal videoId={modalVideoId} onClose={() => setModalVideoId(null)} />
    </>
  )
}

// ── 사역 부서 섹션 ─────────────────────────────────────────────────────────
const DEPT_CARDS = [
  { icon: Baby,           name: '태영아부',    desc: '영아들을 말씀으로 돌보며 믿음의 첫 씨앗을 심어주는 부서입니다.', href: '/department/nursery' },
  { icon: Star,           name: '유아유치부',  desc: '유아들이 하나님의 사랑을 알아가며 밝고 건강하게 자라도록 인도합니다.', href: '/department/preschool' },
  { icon: Backpack,       name: '초등부',      desc: '어린이들이 말씀 안에서 자라나고 믿음의 뿌리를 깊이 내리도록 양육합니다.', href: '/department/children' },
  { icon: Books,          name: '중·고등부',   desc: '청소년들이 말씀 안에서 정체성을 발견하고 하나님의 사람으로 성장하도록 돕습니다.', href: '/department/youth' },
  { icon: GraduationCap, name: '대학청년부',  desc: '청년들이 하나님 안에서 비전을 발견하고 사명자로 세워지도록 함께합니다.', href: '/department/young-adults' },
  { icon: Globe,          name: '다민족부',    desc: '다양한 민족이 한 몸으로 모여 복음을 나누며 함께 예배하는 공동체입니다.', href: '/department/multiethnic' },
  { icon: Handshake,      name: '새가족부',    desc: '처음 방문하신 분들이 교회 가족으로 자연스럽게 정착하도록 따뜻하게 섬깁니다.', href: '/department/newcomers' },
  { icon: Heartbeat,      name: '치유부',      desc: '몸과 마음의 상처를 안고 있는 성도들이 주님 안에서 온전히 회복되도록 기도로 섬깁니다.', href: '/department/healing' },
]

const DepartmentsSection = () => (
  <section className="border-b border-neutral-200 bg-white">
    <div className="max-w-[1600px] mx-auto p-8 md:p-16 lg:p-24 border-x border-b border-neutral-200 bg-white">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400 font-mono mb-4 block">Departments</span>
      <h2 className="text-4xl font-bold tracking-tight">사역 부서</h2>
    </div>
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-neutral-200 gap-px border-x border-neutral-200">
      {DEPT_CARDS.map(({ icon: Icon, name, desc, href }) => (
        <Link key={name} to={href}
          className="bg-white p-8 md:p-12 hover:bg-neutral-50 transition-colors group flex flex-col h-full min-h-[300px]">
          <Icon size={40} className="mb-8 text-neutral-300 group-hover:text-neutral-900 transition-colors" />
          <h4 className="text-xl font-bold mb-4">{name}</h4>
          <p className="text-sm text-neutral-500 font-light leading-relaxed mt-auto break-keep">{desc}</p>
        </Link>
      ))}
    </div>
  </section>
)

// ── 공지 & 갤러리 섹션 ────────────────────────────────────────────────────
const GALLERY_IMGS = [
  {
    src: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=800&auto=format&fit=crop',
    alt: 'Gallery Image 1',
  },
  {
    src: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=800&auto=format&fit=crop',
    alt: 'Gallery Image 2',
  },
]

const NoticeGallerySection = () => (
  <section className="border-b border-neutral-200 bg-white">
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 bg-neutral-200 gap-px border-x border-neutral-200">
      {/* 공지 */}
      <div className="bg-white p-8 md:p-16 lg:p-24 flex flex-col">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400 font-mono mb-4 block">Notice</span>
            <h2 className="text-3xl font-bold tracking-tight">교회 공지</h2>
          </div>
          <Link to="/notices" className="text-2xl text-neutral-900 hover:text-neutral-400 transition-colors">
            <Plus size={28} />
          </Link>
        </div>
        <div className="flex-1 flex flex-col justify-center border-t border-neutral-200 py-20">
          <div className="text-center">
            <SpeakerNone size={40} className="text-neutral-200 mb-4 mx-auto" />
            <p className="text-neutral-400 font-light">등록된 공지가 없습니다</p>
          </div>
        </div>
      </div>

      {/* 갤러리 */}
      <div className="bg-white p-8 md:p-16 lg:p-24 flex flex-col">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400 font-mono mb-4 block">Gallery</span>
            <h2 className="text-3xl font-bold tracking-tight">갤러리</h2>
          </div>
          <Link to="/department/nursery" className="text-2xl text-neutral-900 hover:text-neutral-400 transition-colors">
            <Plus size={28} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {GALLERY_IMGS.map(({ src, alt }) => (
            <div key={alt} className="aspect-square bg-neutral-100 overflow-hidden relative group cursor-pointer">
              <img src={src} alt={alt}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
)

// ── 오시는 길 섹션 ─────────────────────────────────────────────────────────
const LocationSection = () => (
  <section className="border-b border-neutral-200 bg-white">
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 border-x border-neutral-200">
      {/* 주소 정보 */}
      <div className="lg:col-span-5 p-8 md:p-16 lg:p-24 bg-white flex flex-col justify-center">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-400 font-mono mb-4 block">Location</span>
        <h2 className="text-4xl font-bold tracking-tight mb-16">오시는 길</h2>
        <div className="space-y-12">
          <div>
            <h4 className="text-xs font-mono text-neutral-400 mb-3 uppercase tracking-widest">Address</h4>
            <p className="text-lg font-medium leading-relaxed text-neutral-900 break-keep">
              대구광역시 동구 안심로55길 59<br />그리스도사랑교회
            </p>
          </div>
          <div>
            <h4 className="text-xs font-mono text-neutral-400 mb-3 uppercase tracking-widest">Contact</h4>
            <p className="text-lg font-medium leading-relaxed text-neutral-900">
              T. 053-962-8948, 053-961-0931<br />
              F. 053-961-0862<br />
              E. magamedia8948@gmail.com
            </p>
          </div>
        </div>
      </div>

      {/* 지도 플레이스홀더 */}
      <div className="lg:col-span-7 bg-neutral-50 relative min-h-[400px]">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Link to="/church/contact"
            className="w-16 h-16 bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-900 hover:text-white transition-colors duration-300">
            <MapPin size={28} />
          </Link>
        </div>
      </div>
    </div>
  </section>
)

// ── 푸터 ──────────────────────────────────────────────────────────────────
// ── 페이지 루트 ────────────────────────────────────────────────────────────
const Main2Page = () => (
  <div className="bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
    <TemplHeader />
    <HeroSection />
    <AboutWorshipSection />
    <ScheduleSection />
    <SermonSection />
    <DepartmentsSection />
    <NoticeGallerySection />
    <LocationSection />
    <TemplFooter />
  </div>
)

export default Main2Page
