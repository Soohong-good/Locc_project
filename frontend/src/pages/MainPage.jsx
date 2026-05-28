import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getLatestSermons } from '@/api/sermons'
import { getLatestNotices } from '@/api/notices'
import { getPublicRecentGallery } from '@/api/departments'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import KakaoMap from '@/components/ui/KakaoMap'

function extractVideoId(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1)
    return u.searchParams.get('v') || null
  } catch { return null }
}

function fmtDate(val) {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}. ${String(d.getMonth()+1).padStart(2,'0')}. ${String(d.getDate()).padStart(2,'0')}`
}

const VideoModal = ({ videoId, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-slate-300 z-10">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="w-full max-w-5xl aspect-video">
        <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen className="w-full h-full" />
      </div>
    </div>
  )
}


const css = `
  :root { --navy:#1e3a5f; --navy-light:#274d7a; --gold:#ffffff; --gold-light:#f3f6fb; --bg:#f3f6fb; --text:#1a2e4a; }

  .dt-root { font-family:'Noto Sans KR',sans-serif; color:var(--text); background:#fff; }
  .dt-wrap  { max-width:1140px; margin:0 auto; padding:0 24px; }

  /* ── HERO ── */
  .dt-hero { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#000; position:relative; overflow:hidden; text-align:center; }
  .dt-hero-bg { position:absolute; inset:0; background:linear-gradient(rgba(60,60,60,.72),rgba(40,40,40,.80)), url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1600&q=70') center/cover; }
  .dt-hero-content { max-width:820px; padding:140px 0 100px; position:relative; z-index:2; }
  .dt-hero-eyebrow { display:inline-block; font-size:13px; letter-spacing:.2em; text-transform:uppercase; color:rgba(255,255,255,.75); border:1px solid rgba(255,255,255,.35); padding:7px 18px; margin-bottom:36px; }
  .dt-hero-title { font-size:clamp(44px,6vw,80px); font-weight:800; color:#fff; line-height:1.2; margin-bottom:20px; letter-spacing:-.01em; }
  .dt-hero-ref { font-size:30px; color:rgba(255,255,255,.55); margin-bottom:32px; letter-spacing:.04em; }
  .dt-hero-rule { width:40px; height:1px; background:rgba(255,255,255,.3); margin:0 auto 36px; }
  .dt-hero-quote { font-size:26px; color:rgba(255,255,255,.75); line-height:2; margin-bottom:48px; }
  .dt-hero-quote strong { color:#fff; font-weight:700; }
  .dt-hero-actions { display:flex; gap:12px; flex-wrap:wrap; justify-content:center; }
  .dt-hero-content { animation:heroIn .9s ease both; }
  @keyframes heroIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
  .dt-hero-scroll { position:absolute; bottom:36px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:8px; color:rgba(255,255,255,.4); font-size:10px; letter-spacing:.1em; text-transform:uppercase; }
  .dt-scroll-line { width:1px; height:40px; background:linear-gradient(to bottom,transparent,rgba(255,255,255,.4)); }

  /* ── BUTTONS ── */
  .dt-btn { display:inline-flex; align-items:center; gap:8px; padding:15px 32px; border-radius:8px; font-size:16px; font-weight:600; text-decoration:none; transition:all .2s; cursor:pointer; border:none; }
  .dt-btn-primary { background:var(--gold); color:var(--navy); }
  .dt-btn-primary:hover { background:#e8eef5; }
  .dt-btn-outline { background:transparent; color:#fff; border:1.5px solid rgba(255,255,255,.4); }
  .dt-btn-outline:hover { background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.7); }
  .dt-btn-navy { background:var(--navy); color:#fff; }
  .dt-btn-navy:hover { background:var(--navy-light); }

  /* ── WORSHIP ── */
  .dt-worship { background:var(--navy); padding:0; }
  .dt-worship-grid { display:grid; grid-template-columns:repeat(3,1fr); }
  .dt-worship-col { padding:48px 36px 52px; border-right:1px solid rgba(255,255,255,.12); }
  .dt-worship-col:last-child { border-right:none; }
  .dt-worship-col-label { font-size:17px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--gold); margin-bottom:24px; padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,.12); }
  .dt-worship-row { display:flex; align-items:center; padding:11px 0; border-bottom:1px solid rgba(255,255,255,.06); gap:8px; }
  .dt-worship-row:last-child { border-bottom:none; }
  .dt-worship-row-name { font-size:24px; font-weight:600; color:rgba(255,255,255,.8); flex:1; }
  .dt-worship-row-time { font-size:30px; font-weight:800; color:var(--gold); min-width:80px; text-align:right; font-variant-numeric:tabular-nums; letter-spacing:.02em; }
  .dt-worship-row-loc { font-size:16px; color:rgba(255,255,255,.4); min-width:68px; text-align:right; }
  @media(max-width:768px){
    .dt-worship-grid { grid-template-columns:1fr; }
    .dt-worship-col { border-right:none; border-bottom:1px solid rgba(255,255,255,.12); }
    .dt-worship-col:last-child { border-bottom:none; }
  }

  /* ── SECTION COMMONS ── */
  .dt-sec { padding:100px 0; }
  .dt-label { font-size:13px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--navy); opacity:.5; margin-bottom:12px; }
  .dt-h2 { font-size:clamp(34px,4vw,52px); font-weight:800; color:var(--navy); line-height:1.2; margin-bottom:16px; }
  .dt-div { width:40px; height:3px; background:var(--navy); opacity:.25; border-radius:2px; margin-bottom:28px; }
  .dt-sub { font-size:18px; color:#666; line-height:1.8; max-width:520px; margin-bottom:48px; }
  .dt-see-all { font-size:16px; font-weight:600; color:var(--navy); text-decoration:none; border-bottom:1px solid rgba(30,58,95,.3); padding-bottom:2px; transition:opacity .2s; }
  .dt-see-all:hover { opacity:.6; }

  /* ── SCROLL REVEAL ── */
  .dt-fade,.dt-fade-l,.dt-fade-r { transition:opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1); }
  .dt-js .dt-fade   { opacity:0; transform:translateY(44px); }
  .dt-js .dt-fade-l { opacity:0; transform:translateX(-44px); }
  .dt-js .dt-fade-r { opacity:0; transform:translateX(44px); }
  .dt-js .dt-fade.visible,
  .dt-js .dt-fade-l.visible,
  .dt-js .dt-fade-r.visible { opacity:1; transform:none; }

  /* ── INTRO ── */
  .dt-intro { background:var(--bg); }
  .dt-intro-grid { display:grid; grid-template-columns:1fr 1fr; gap:72px; align-items:center; }
  .dt-intro-imgwrap { position:relative; }
  .dt-intro-img { width:100%; border-radius:16px; object-fit:cover; aspect-ratio:4/5; display:block; }
  .dt-intro-badge { position:absolute; bottom:-20px; right:-20px; background:var(--navy); color:#fff; border-radius:12px; padding:18px 24px; text-align:center; box-shadow:0 8px 32px rgba(30,58,95,.3); }
  .dt-badge-num { font-size:32px; font-weight:800; color:var(--gold); line-height:1; }
  .dt-badge-txt { font-size:11px; margin-top:4px; opacity:.7; }
  .dt-verse { border-left:3px solid var(--navy); opacity:.8; padding:16px 20px; background:rgba(30,58,95,.05); border-radius:0 8px 8px 0; font-size:15px; font-style:italic; color:var(--navy); line-height:1.7; margin-bottom:24px; }
  .dt-verse-ref { font-size:12px; font-style:normal; color:#888; margin-top:6px; }
  .dt-intro-text { font-size:17px; color:#555; line-height:1.9; margin-bottom:16px; }

  /* ── WORSHIP ABOUT ── */
  .dt-worship-about { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:start; margin-top:8px; }
  .dt-worship-about-sub { font-size:22px; font-weight:700; color:var(--navy); margin-bottom:20px; }
  .dt-worship-verses { display:flex; flex-direction:column; gap:0; }
  .dt-worship-verse-card { padding:28px 28px 28px 24px; border-left:3px solid var(--navy); background:#fff; margin-bottom:12px; border-radius:0 8px 8px 0; box-shadow:0 2px 12px rgba(0,0,0,.05); }
  .dt-worship-verse-ref { font-size:14px; color:#999; font-weight:600; letter-spacing:.06em; margin-bottom:10px; }
  .dt-worship-verse-text { font-size:16px; color:var(--navy); line-height:1.9; }
  @media (max-width:900px) { .dt-worship-about { grid-template-columns:1fr; gap:36px; } }

  /* ── SERMON ── */
  .dt-sermon-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:40px; }
  .dt-sermon-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:28px; }
  .dt-sermon-card { border-radius:12px; overflow:hidden; border:1px solid #eee; transition:transform .2s,box-shadow .2s; }
  .dt-sermon-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(0,0,0,.1); }
  .dt-sermon-thumb { position:relative; aspect-ratio:16/9; overflow:hidden; }
  .dt-sermon-thumb img { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
  .dt-sermon-card:hover .dt-sermon-thumb img { transform:scale(1.05); }
  .dt-play-btn { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(30,58,95,.3); opacity:0; transition:opacity .2s; }
  .dt-sermon-card:hover .dt-play-btn { opacity:1; }
  .dt-play-circle { width:44px; height:44px; background:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; }
  .dt-sermon-body { padding:20px; }
  .dt-sermon-meta { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; font-size:14px; color:#888; }
  .dt-sermon-tag { background:rgba(30,58,95,.08); color:var(--navy); font-weight:600; font-size:13px; padding:3px 10px; border-radius:4px; }
  .dt-sermon-title { font-size:18px; font-weight:700; color:var(--navy); margin-bottom:6px; line-height:1.4; }
  .dt-sermon-speaker { font-size:15px; color:#666; margin-bottom:4px; }
  .dt-sermon-verse { font-size:14px; color:var(--navy); opacity:.5; font-weight:600; }

  /* ── MINISTRY ── */
  .dt-ministry-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-top:48px; }
  .dt-ministry-item { background:#fff; border-radius:16px; padding:28px 24px 32px; border:1px solid #e8ecf2; transition:box-shadow .2s,transform .2s; }
  .dt-ministry-item:hover { box-shadow:0 8px 28px rgba(30,58,95,.1); transform:translateY(-4px); }
  .dt-ministry-icon { width:48px; height:48px; background:rgba(30,58,95,.07); border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
  .dt-ministry-icon svg { width:22px; height:22px; stroke:var(--navy); fill:none; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; }
  .dt-ministry-name { font-size:17px; font-weight:700; color:var(--navy); margin-bottom:8px; }
  .dt-ministry-desc { font-size:14px; color:#666; line-height:1.8; }

  /* ── NEWS ── */
  .dt-news-layout { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
  .dt-news-main { display:block; text-decoration:none; border-radius:12px; overflow:hidden; border:1px solid #eee; transition:box-shadow .2s; }
  .dt-news-main:hover { box-shadow:0 8px 28px rgba(0,0,0,.1); }
  .dt-news-main-img { width:100%; aspect-ratio:16/9; object-fit:cover; display:block; }
  .dt-news-main-body { padding:24px; }
  .dt-news-cat { font-size:13px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--navy); opacity:.5; margin-bottom:8px; }
  .dt-news-main-title { font-size:22px; font-weight:700; color:var(--navy); line-height:1.4; margin-bottom:10px; }
  .dt-news-excerpt { font-size:15px; color:#666; line-height:1.8; margin-bottom:12px; }
  .dt-news-date { font-size:14px; color:#aaa; }
  .dt-news-list { display:flex; flex-direction:column; gap:12px; }
  .dt-news-item { display:flex; gap:14px; align-items:center; text-decoration:none; padding:14px; border-radius:10px; border:1px solid #eee; transition:background .2s; }
  .dt-news-item:hover { background:#fafafa; }
  .dt-news-item-img { width:80px; height:64px; object-fit:cover; border-radius:6px; flex-shrink:0; }
  .dt-news-item-cat { font-size:12px; font-weight:700; letter-spacing:.08em; color:var(--navy); opacity:.5; margin-bottom:4px; }
  .dt-news-item-title { font-size:15px; font-weight:600; color:var(--navy); line-height:1.4; margin-bottom:4px; }
  .dt-news-item-date { font-size:13px; color:#bbb; }

  /* ── GALLERY ── */
  .dt-gallery { background:var(--navy); padding:100px 0 0; }
  .dt-gallery-top { margin-bottom:48px; }
  .dt-gallery-top .dt-h2 { color:#fff; }
  .dt-gallery-top .dt-label { color:rgba(255,255,255,.4); }
  .dt-gallery-top .dt-div { background:rgba(255,255,255,.25); }
  .dt-gallery-grid { display:grid; grid-template-columns:repeat(4,1fr); grid-template-rows:220px 220px; gap:4px; }
  .dt-gallery-cell { position:relative; overflow:hidden; }
  .dt-gallery-cell.tall { grid-row:span 2; }
  .dt-gallery-cell img { width:100%; height:100%; object-fit:cover; transition:transform .5s; }
  .dt-gallery-cell:hover img { transform:scale(1.06); }
  .dt-gallery-overlay { position:absolute; inset:0; background:rgba(20,40,70,.45); opacity:0; transition:opacity .3s; display:flex; flex-direction:column; justify-content:flex-end; }
  .dt-gallery-cell:hover .dt-gallery-overlay { opacity:1; }

  /* ── CONTACT ── */
  .dt-contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:start; }
  .dt-map-ph { background:#e8e6e0; border-radius:16px; aspect-ratio:4/3; position:relative; overflow:hidden; min-height:300px; }
  .dt-map-pin { width:20px; height:20px; background:var(--navy); border-radius:50% 50% 50% 0; transform:rotate(-45deg); }
  .dt-info-list { display:flex; flex-direction:column; gap:20px; margin-bottom:32px; }
  .dt-info-row { display:flex; gap:14px; align-items:flex-start; }
  .dt-info-icon { width:36px; height:36px; background:rgba(30,58,95,.06); border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .dt-info-icon svg { stroke:var(--navy); fill:none; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; }
  .dt-info-label { font-size:13px; font-weight:700; color:#999; letter-spacing:.06em; text-transform:uppercase; margin-bottom:4px; }
  .dt-info-value { font-size:16px; color:var(--navy); line-height:1.7; }
  .dt-transport-title { font-size:16px; font-weight:700; color:var(--navy); margin-bottom:12px; }
  .dt-transport-list { display:flex; flex-direction:column; gap:8px; }
  .dt-transport-item { display:flex; gap:10px; align-items:flex-start; font-size:15px; color:#555; }
  .dt-t-badge { font-size:12px; font-weight:700; padding:3px 9px; border-radius:4px; flex-shrink:0; margin-top:1px; }
  .dt-subway { background:#2d6be4; color:#fff; }
  .dt-bus    { background:#4caf50; color:#fff; }
  .dt-car    { background:#888; color:#fff; }


  @media (max-width:900px) {
    .dt-intro-grid,.dt-contact-grid,.dt-news-layout { grid-template-columns:1fr; }
    .dt-worship-grid { grid-template-columns:1fr 1fr; }
    .dt-sermon-grid,.dt-ministry-grid { grid-template-columns:1fr 1fr; }
  }
  @media (max-width:600px) {
    .dt-worship-grid,.dt-sermon-grid,.dt-ministry-grid { grid-template-columns:1fr; }
    .dt-gallery-grid { grid-template-columns:1fr 1fr; grid-template-rows:auto; }
    .dt-gallery-cell.tall { grid-row:span 1; }
  }
`

export default function MainPage() {
  const navigate = useNavigate()
  const [modalVideoId, setModalVideoId] = useState(null)

  const { data: sermons = [] } = useQuery({
    queryKey: ['sermons', 'latest', 3],
    queryFn: () => getLatestSermons(3),
    staleTime: 5 * 60 * 1000,
  })

  const { data: noticesData } = useQuery({
    queryKey: ['notices', 'latest', 5],
    queryFn: () => getLatestNotices(5),
    staleTime: 5 * 60 * 1000,
  })
  const notices = noticesData?.content ?? []

  const { data: galleryData } = useQuery({
    queryKey: ['gallery', 'public', 'recent'],
    queryFn: () => getPublicRecentGallery({ size: 7 }),
    staleTime: 5 * 60 * 1000,
  })
  const galleryImages = galleryData?.content ?? []

  // dt-js 클래스: JS 실행 시에만 fade 숨김 활성화
  useEffect(() => {
    const root = document.querySelector('.dt-root')
    root?.classList.add('dt-js')
    return () => root?.classList.remove('dt-js')
  }, [])

  // IntersectionObserver: API 데이터 로드 후 새로 생긴 카드도 감지하도록 sermons/notices 의존
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    )
    const fadeEls = document.querySelectorAll('.dt-fade, .dt-fade-l, .dt-fade-r')
    fadeEls.forEach((el) => {
      if (!el.classList.contains('visible')) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sermons, notices, galleryImages])

  return (
    <>
    <div className="dt-root">
      <style>{css}</style>

      {/* ─── HEADER (공통 컴포넌트 사용 — 투명 모드 자동 적용) ─── */}
      <Header />

      {/* ─── HERO ─── */}
      <section className="dt-hero">
        <div className="dt-hero-bg" />
        <div className="dt-hero-content">
          <p className="dt-hero-eyebrow">2026 Church Motto</p>
          <h1 className="dt-hero-title">여호와의 거룩한 이름을위함이라</h1>
          <p className="dt-hero-ref">에스겔 36:22</p>
          <div className="dt-hero-rule" />
          <p className="dt-hero-quote">
            "그러므로 너는 이스라엘 족속에게 이르기를<br />
            주 여호와께서 이같이 말씀하시되<br />
            이스라엘 족속아 내가 이렇게 행함은<br />
            <strong>너희를 위함이 아니요</strong><br />
            너희가 들어간 그 이방 중에서<br />
            더럽힌 <strong>나의 거룩한 이름을 위함이라</strong>"
          </p>
          <div className="dt-hero-actions">
            <a href="/salvation" className="dt-btn dt-btn-outline">복음말씀 →</a>
          </div>
        </div>
        <div className="dt-hero-scroll">
          <div className="dt-scroll-line" />
          <span>scroll</span>
        </div>
      </section>


      {/* ─── INTRO ─── */}
      <section id="dt-intro" className="dt-intro dt-sec">
        <div className="dt-wrap">
          <div className="dt-fade">
            <div className="dt-label">About Church</div>
            <h2 className="dt-h2">그리스도 사랑교회의 예배</h2>
            <div className="dt-div" />
          </div>
          <div className="dt-worship-about">
            <div className="dt-fade" style={{transitionDelay:'0.1s'}}>
              <h3 className="dt-worship-about-sub">우리의 믿음</h3>
              <p className="dt-intro-text">
                "하나님을 영화롭게 하며 그를 영원토록 즐거워하는 것"을<br />
                삶의 제일 되는 목적으로 삼은 성도들이 모여<br />
                영과 진리로 예배를 드립니다.
              </p>
              <p className="dt-intro-text">
                우리는 교회의 여러 사역 중 예배를 가장 소중히 여기며,<br />
                살아계신 삼위일체 하나님을 경배하고 기도하며,<br />
                선포되는 강해 설교를 통해 하나님의 말씀을 듣습니다.
              </p>
            </div>
            <div className="dt-worship-verses">
              {[
                { ref:'이사야 43:7', text:'내 이름으로 불려지는 모든 자 곧\n내가 내 영광을 위하여 창조한 자를 오게 하라\n그를 내가 지었고 그를 내가 만들었느니라' },
                { ref:'시편 16:11',  text:'주께서 생명의 길을 내게 보이시리니\n주의 앞에는 충만한 기쁨이 있고\n주의 오른쪽에는 영원한 즐거움이 있나이다' },
                { ref:'요한복음 4:23', text:'아버지께 참되게 예배하는 자들은\n영과 진리로 예배할 때가 오나니 곧 이 때라\n아버지께서는 자기에게 이렇게 예배하는 자들을 찾으시느니라' },
              ].map((v, i) => (
                <div key={v.ref} className="dt-worship-verse-card dt-fade" style={{transitionDelay:`${0.2 + i*0.12}s`}}>
                  <div className="dt-worship-verse-ref">{v.ref}</div>
                  <div className="dt-worship-verse-text">{v.text.split('\n').map((line, j) => <span key={j}>{line}<br/></span>)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── WORSHIP SCHEDULE ─── */}
      <section className="dt-worship">
        <div className="dt-worship-grid">

          {/* 주일 예배 */}
          <div className="dt-worship-col">
            <div className="dt-worship-col-label">Sunday Service · 주일예배</div>
            {[
              { name:'1부 예배', time:'09:00', loc:'본당' },
              { name:'2부 예배', time:'11:00', loc:'본당' },
              { name:'오후 예배', time:'15:00', loc:'본당' },
            ].map(w => (
              <div key={w.name} className="dt-worship-row">
                <span className="dt-worship-row-name">{w.name}</span>
                <span className="dt-worship-row-time">{w.time}</span>
                <span className="dt-worship-row-loc">{w.loc}</span>
              </div>
            ))}
          </div>

          {/* 주중 예배 */}
          <div className="dt-worship-col">
            <div className="dt-worship-col-label">Weekday Service · 주중예배</div>
            {[
              { name:'수요 예배',   time:'20:00', loc:'본당' },
              { name:'금요 기도회', time:'20:30', loc:'본당' },
              { name:'새벽 기도',   time:'05:30', loc:'101호실' },
            ].map(w => (
              <div key={w.name} className="dt-worship-row">
                <span className="dt-worship-row-name">{w.name}</span>
                <span className="dt-worship-row-time">{w.time}</span>
                <span className="dt-worship-row-loc">{w.loc}</span>
              </div>
            ))}
          </div>

          {/* 부서 예배 */}
          <div className="dt-worship-col">
            <div className="dt-worship-col-label">Department Service · 부서예배</div>
            {[
              { name:'태영아부',   time:'11:00', loc:'별도 안내' },
              { name:'유아유치부', time:'11:00', loc:'별도 안내' },
              { name:'초등부',     time:'11:00', loc:'별도 안내' },
              { name:'중·고등부', time:'11:00', loc:'별도 안내' },
              { name:'대학청년부', time:'11:00', loc:'별도 안내' },
            ].map(w => (
              <div key={w.name} className="dt-worship-row">
                <span className="dt-worship-row-name">{w.name}</span>
                <span className="dt-worship-row-time">{w.time}</span>
                <span className="dt-worship-row-loc">{w.loc}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── SERMON ─── */}
      <section id="dt-sermon" className="dt-sec" style={{background:'#fff'}}>
        <div className="dt-wrap">
          <div className="dt-sermon-header dt-fade">
            <div>
              <div className="dt-label">Sermon Archive</div>
              <h2 className="dt-h2">최근 설교</h2>
              <div className="dt-div" />
            </div>
            <a href="/worship/sermon/sunday-morning" className="dt-see-all">전체 보기 →</a>
          </div>
          <div className="dt-sermon-grid">
            {sermons.map((s, i) => {
              const vid = extractVideoId(s.videoUrl)
              return (
                <div key={s.id} className="dt-sermon-card dt-fade" style={{transitionDelay:`${i*0.12}s`,cursor:'pointer'}}
                  onClick={() => vid ? setModalVideoId(vid) : navigate(`/worship/sermon/${s.id}`)}>
                  <div className="dt-sermon-thumb">
                    {vid
                      ? <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt={s.title} />
                      : <div style={{width:'100%',height:'100%',background:'#1e3a5f',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.5">
                            <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                          </svg>
                        </div>
                    }
                    <div className="dt-play-btn">
                      <div className="dt-play-circle">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="#1a2744"><polygon points="5,3 19,12 5,21"/></svg>
                      </div>
                    </div>
                  </div>
                  <div className="dt-sermon-body">
                    <div className="dt-sermon-meta">
                      <span className="dt-sermon-tag">{s.category || '설교'}</span>
                      <span>{fmtDate(s.sermonDate || s.createdAt)}</span>
                    </div>
                    <div className="dt-sermon-title">{s.title}</div>
                    {s.preacher && <div className="dt-sermon-speaker">{s.preacher}</div>}
                    {s.bibleVerses && <div className="dt-sermon-verse">{s.bibleVerses}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── MINISTRY ─── */}
      <section id="dt-ministry" className="dt-intro dt-sec">
        <div className="dt-wrap">
          <div className="dt-fade" style={{maxWidth:'480px'}}>
            <div className="dt-label">Ministry Departments</div>
            <h2 className="dt-h2">사역 부서</h2>
            <div className="dt-div" />
            <p className="dt-sub">각 부서는 하나님의 나라를 세우는 한 몸의 지체입니다. 여러분의 은사로 함께 섬겨주세요.</p>
          </div>
          <div className="dt-ministry-grid">
            {[
              { name:'태영아부',   desc:'영아들을 말씀으로 돌보며 믿음의 첫 씨앗을 심어주는 부서입니다.',
                icon: <><circle cx="12" cy="8" r="4"/><path d="M6 20v-1a6 6 0 0 1 12 0v1"/></> },
              { name:'유아유치부', desc:'유아들이 하나님의 사랑을 알아가며 밝고 건강하게 자라도록 인도합니다.',
                icon: <><path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z"/><path d="M6 20v-1a6 6 0 0 1 12 0v1"/><path d="M8 14l-2 2m10-2l2 2"/></> },
              { name:'초등부',     desc:'어린이들이 말씀 안에서 자라나고 믿음의 뿌리를 깊이 내리도록 양육합니다.',
                icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></> },
              { name:'중·고등부', desc:'청소년들이 말씀 안에서 정체성을 발견하고 하나님의 사람으로 성장하도록 돕습니다.',
                icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
              { name:'대학청년부', desc:'청년들이 하나님 안에서 비전을 발견하고 사명자로 세워지도록 함께합니다.',
                icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></> },
              { name:'다민족부',   desc:'다양한 민족이 한 몸으로 모여 복음을 나누며 함께 예배하는 공동체입니다.',
                icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
              { name:'새가족부',   desc:'처음 방문하신 분들이 교회 가족으로 자연스럽게 정착하도록 따뜻하게 섬깁니다.',
                icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></> },
              { name:'치유부',     desc:'몸과 마음의 상처를 안고 있는 성도들이 주님 안에서 온전히 회복되도록 기도로 섬깁니다.',
                icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/> },
            ].map((m, i) => (
              <div key={m.name} className="dt-ministry-item dt-fade" style={{transitionDelay:`${i*0.08}s`}}>
                <div className="dt-ministry-icon">
                  <svg viewBox="0 0 24 24">{m.icon}</svg>
                </div>
                <div className="dt-ministry-name">{m.name}</div>
                <div className="dt-ministry-desc">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NOTICE ─── */}
      <section id="dt-news" className="dt-sec" style={{background:'#fff'}}>
        <div className="dt-wrap">
          <div className="dt-sermon-header dt-fade">
            <div>
              <div className="dt-label">Church Notice</div>
              <h2 className="dt-h2">교회 공지</h2>
              <div className="dt-div" />
            </div>
            <a href="/notices" className="dt-see-all">전체 보기 →</a>
          </div>
          <div className="dt-news-layout">
            {notices[0] ? (
              <div className="dt-news-main dt-fade-l" style={{cursor:'pointer'}} onClick={() => navigate(`/notices/${notices[0].id}`)}>
                {notices[0].thumbnailUrl ? (
                  <img
                    src={notices[0].thumbnailUrl}
                    alt={notices[0].title}
                    className="dt-news-main-img"
                    onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex' }}
                  />
                ) : null}
                <div style={{
                  width:'100%', aspectRatio:'16/9',
                  background:'linear-gradient(135deg,#1e3a5f,#274d7a)',
                  display: notices[0].thumbnailUrl ? 'none' : 'flex',
                  alignItems:'center', justifyContent:'center'
                }}>
                  <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.2">
                    <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/>
                    <path d="M9 7h6M9 11h6M9 15h4"/>
                  </svg>
                </div>
                <div className="dt-news-main-body">
                  <div className="dt-news-cat">{notices[0].isPinned ? '📌 고정공지' : '공지사항'}</div>
                  <div className="dt-news-main-title">{notices[0].title}</div>
                  <div className="dt-news-date">{fmtDate(notices[0].createdAt)}</div>
                </div>
              </div>
            ) : (
              <div className="dt-news-main dt-fade-l" style={{opacity:.4}}>
                <div style={{width:'100%',aspectRatio:'16/9',background:'#f3f6fb'}} />
                <div className="dt-news-main-body"><div className="dt-news-cat">공지사항</div><div className="dt-news-main-title">등록된 공지가 없습니다</div></div>
              </div>
            )}
            <div className="dt-news-list">
              {notices.slice(1).map((n, i) => (
                <div key={n.id} className="dt-news-item dt-fade-r" style={{transitionDelay:`${i*0.08}s`,cursor:'pointer'}}
                  onClick={() => navigate(`/notices/${n.id}`)}>
                  {n.thumbnailUrl ? (
                    <img
                      src={n.thumbnailUrl}
                      alt={n.title}
                      className="dt-news-item-img"
                      onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex' }}
                    />
                  ) : null}
                  <div style={{
                    width:80, height:64, borderRadius:6,
                    background:'linear-gradient(135deg,#1e3a5f,#274d7a)',
                    flexShrink:0, display: n.thumbnailUrl ? 'none' : 'flex',
                    alignItems:'center', justifyContent:'center'
                  }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.5">
                      <path d="M9 7h6M9 11h6M9 15h4M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/>
                    </svg>
                  </div>
                  <div className="dt-news-item-body">
                    <div className="dt-news-item-cat">{n.isPinned ? '고정' : '공지'}</div>
                    <div className="dt-news-item-title">{n.title}</div>
                    <div className="dt-news-item-date">{fmtDate(n.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── GALLERY ─── */}
      <section id="dt-gallery" className="dt-gallery">
        <div className="dt-wrap">
          <div className="dt-gallery-top dt-fade">
            <div className="dt-label" style={{color:'var(--gold-light)'}}>Photo Gallery</div>
            <h2 className="dt-h2">갤러리</h2>
            <div className="dt-div" style={{background:'rgba(255,255,255,.25)'}} />
          </div>
        </div>
        {galleryImages.length > 0 ? (
          <div className="dt-gallery-grid">
            <div className="dt-gallery-cell tall">
              <img
                src={`/uploads/gallery/${galleryImages[0].thumbnailFilename || galleryImages[0].storedFilename}`}
                alt={galleryImages[0].title}
                onError={(e) => { e.target.src = '/images/no-image.png' }}
              />
              <div className="dt-gallery-overlay">
                <div style={{position:'absolute',bottom:12,left:12,right:12}}>
                  <div style={{fontSize:12,color:'rgba(255,255,255,.7)',marginBottom:4}}>{galleryImages[0].departmentName}</div>
                  <div style={{fontSize:14,fontWeight:600,color:'#fff',lineHeight:1.3}}>{galleryImages[0].title}</div>
                </div>
              </div>
            </div>
            {galleryImages.slice(1).map((img) => (
              <div key={img.id} className="dt-gallery-cell">
                <img
                  src={`/uploads/gallery/${img.thumbnailFilename || img.storedFilename}`}
                  alt={img.title}
                  onError={(e) => { e.target.src = '/images/no-image.png' }}
                />
                <div className="dt-gallery-overlay">
                  <div style={{position:'absolute',bottom:8,left:8,right:8}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.7)',marginBottom:2}}>{img.departmentName}</div>
                    <div style={{fontSize:13,fontWeight:600,color:'#fff',lineHeight:1.3}}>{img.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{padding:'60px 0',textAlign:'center',color:'rgba(255,255,255,.3)',fontSize:15}}>
            등록된 갤러리 이미지가 없습니다
          </div>
        )}
      </section>

      {/* ─── CONTACT ─── */}
      <section id="dt-contact" className="dt-intro dt-sec">
        <div className="dt-wrap">
          <div className="dt-fade" style={{maxWidth:'480px',marginBottom:'44px'}}>
            <div className="dt-label">Directions &amp; Contact</div>
            <h2 className="dt-h2">오시는 길</h2>
            <div className="dt-div" />
          </div>
          <div className="dt-contact-grid">
            <div className="dt-map-ph dt-fade-l" style={{overflow:'hidden', padding:0}}>
              <KakaoMap />
            </div>
            <div className="dt-fade-r">
              <div className="dt-info-list">
                {[
                  { label:'주소', value:'대구광역시 동구\n안심로55길 59',
                    icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></> },
                  { label:'전화', value:'053-962-8948 / 053-961-0931',
                    icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3.12h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.9A16 16 0 0 0 13.1 16.1l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17.14"/> },
                  { label:'팩스', value:'053-961-0862',
                    icon: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 2H8v5h8V2z"/></> },
                  { label:'이메일', value:'magamedia8948@gmail.com',
                    icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></> },
                ].map((info) => (
                  <div key={info.label} className="dt-info-row">
                    <div className="dt-info-icon">
                      <svg viewBox="0 0 24 24" width="16" height="16">{info.icon}</svg>
                    </div>
                    <div>
                      <div className="dt-info-label">{info.label}</div>
                      <div className="dt-info-value" style={{whiteSpace:'pre-line'}}>{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dt-transport-title">교통편 안내</div>
              <div className="dt-transport-list">
                <div className="dt-transport-item"><span className="dt-t-badge dt-subway">지하철</span><span>1호선 반야월역 4번 출구 도보 10분</span></div>
                <div className="dt-transport-item"><span className="dt-t-badge dt-bus">버스</span><span>경북교통앞 정류장 (805, 836, 동구4, 동구10, 북구3)</span></div>
                <div className="dt-transport-item"><span className="dt-t-badge dt-car">주차</span><span>교회 주차장 이용 가능</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {modalVideoId && <VideoModal videoId={modalVideoId} onClose={() => setModalVideoId(null)} />}
    </div>
    <Footer />
    </>
  )
}
