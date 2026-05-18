export default function DesignTemplate() {
  const headerRef = useRef(null)

  useEffect(() => {
    // 스크롤 헤더 shadow
    const onScroll = () => {
      headerRef.current?.classList.toggle('scrolled', window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll)

    // fade-in 애니메이션
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll('.dt-fade').forEach((el) => observer.observe(el))

    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="dt-root">
      <style>{css}</style>

      {/* ─── HEADER ─── */}
      <header className="dt-header" ref={headerRef}>
        <div className="dt-wrap">
          <div className="dt-header-inner">
            <a href="#" className="dt-logo">
              <div className="dt-logo-icon">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M12 2L12 22M2 12L22 12M6 6L18 18M18 6L6 18" stroke="#d4b07a" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <div>
                <div className="dt-logo-ko">그리스도사랑교회</div>
                <div className="dt-logo-en">Christ Love Church</div>
              </div>
            </a>
            <nav className="dt-nav">
              <a href="#dt-intro">교회소개</a>
              <a href="#dt-worship">예배안내</a>
              <a href="#dt-sermon">설교</a>
              <a href="#dt-ministry">사역부서</a>
              <a href="#dt-news">교회소식</a>
              <a href="#dt-contact">오시는길</a>
              <a href="/login" className="dt-nav-cta">로그인</a>
            </nav>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="dt-hero">
        <div className="dt-hero-bg" />
        <div className="dt-wrap" style={{position:'relative',zIndex:2,width:'100%'}}>
          <div className="dt-hero-content dt-fade">
            <p className="dt-hero-eyebrow">Sunday Worship · 매 주일 함께 드리는 예배</p>
            <h1 className="dt-hero-title">
              하나님의 사랑으로<br />
              <em>하나 되는</em> 교회
            </h1>
            <p className="dt-hero-sub">
              그리스도사랑교회는 말씀 위에 세워진 공동체입니다.<br />
              예수 그리스도의 복음을 함께 나누며 이웃을 섬깁니다.
            </p>
            <div className="dt-hero-actions">
              <a href="#dt-worship" className="dt-btn dt-btn-primary">예배 안내 보기</a>
              <a href="#dt-intro"   className="dt-btn dt-btn-outline">교회 소개</a>
            </div>
          </div>
        </div>
        <div className="dt-hero-scroll">
          <div className="dt-scroll-line" />
          <span>scroll</span>
        </div>
      </section>

      {/* ─── WORSHIP ─── */}
      <section id="dt-worship" className="dt-worship">
        <div className="dt-worship-grid">
          {[
            { day:'Sunday',   name:'주일 1부 예배', time:'오전 9:00',  note:'본당 / 담임목사 설교\n어린이예배 동시 진행' },
            { day:'Sunday',   name:'주일 2부 예배', time:'오전 11:00', note:'본당 / 온라인 동시 송출\n청년부 연합 예배' },
            { day:'Wednesday',name:'수요 예배',     time:'오후 7:30',  note:'본당 / 말씀 기도 집회\n소그룹 나눔 포함' },
            { day:'Friday',   name:'금요 기도회',   time:'오후 9:00',  note:'기도실 / 전교인 합심 기도\n중보기도팀 운영' },
          ].map((w) => (
            <div key={w.name} className="dt-worship-item">
              <div className="dt-worship-day">{w.day}</div>
              <div className="dt-worship-name">{w.name}</div>
              <div className="dt-worship-time">{w.time}</div>
              <div className="dt-worship-note" style={{whiteSpace:'pre-line'}}>{w.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── INTRO ─── */}
      <section id="dt-intro" className="dt-intro dt-sec">
        <div className="dt-wrap">
          <div className="dt-intro-grid">
            <div className="dt-intro-imgwrap dt-fade">
              <img className="dt-intro-img" src="https://images.unsplash.com/photo-1438032005730-c779502df39b?w=900&q=80" alt="교회 내부" />
              <div className="dt-intro-badge">
                <div className="dt-badge-num">1994</div>
                <div className="dt-badge-txt">설립연도</div>
              </div>
            </div>
            <div className="dt-fade">
              <div className="dt-label">Church Introduction</div>
              <h2 className="dt-h2">우리 교회를<br />소개합니다</h2>
              <div className="dt-div" />
              <div className="dt-verse">
                "내가 너희를 사랑한 것같이 너희도 서로 사랑하라"
                <div className="dt-verse-ref">— 요한복음 13:34</div>
              </div>
              <p className="dt-intro-text">
                그리스도사랑교회는 1994년 창립 이래 말씀과 기도, 전도와 봉사의 네 기둥 위에 서 있습니다.
                30여 년간 지역 사회와 함께 성장하며 다음 세대를 세우고, 복음을 삶으로 실천하는
                공동체가 되기 위해 힘써 왔습니다.
              </p>
              <p className="dt-intro-text">
                교회는 단순한 건물이 아닙니다. 그리스도의 몸 된 성도들이 함께 모여
                서로를 섬기며 세상에 빛과 소금이 되는 살아있는 공동체입니다.
              </p>
              <a href="#" className="dt-btn dt-btn-navy">교회 비전 보기</a>
            </div>
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
            {[
              { tag:'주일 2부', date:'2025. 06. 01', title:'너희는 세상의 빛이라', speaker:'담임목사 홍길동', verse:'마태복음 5:14–16', img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=70' },
              { tag:'주일 1부', date:'2025. 05. 25', title:'하나님은 사랑이시라', speaker:'담임목사 홍길동', verse:'요한일서 4:7–12',  img:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&q=70' },
              { tag:'수요예배', date:'2025. 05. 21', title:'주 안에서 항상 기뻐하라', speaker:'부목사 김은혜',   verse:'빌립보서 4:4–7',  img:'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=70' },
            ].map((s) => (
              <div key={s.title} className="dt-sermon-card dt-fade">
                <div className="dt-sermon-thumb">
                  <img src={s.img} alt={s.title} />
                  <div className="dt-play-btn">
                    <div className="dt-play-circle">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="#1a2744"><polygon points="5,3 19,12 5,21"/></svg>
                    </div>
                  </div>
                </div>
                <div className="dt-sermon-body">
                  <div className="dt-sermon-meta">
                    <span className="dt-sermon-tag">{s.tag}</span>
                    <span>{s.date}</span>
                  </div>
                  <div className="dt-sermon-title">{s.title}</div>
                  <div className="dt-sermon-speaker">{s.speaker}</div>
                  <div className="dt-sermon-verse">{s.verse}</div>
                </div>
              </div>
            ))}
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
              { name:'예배부', desc:'찬양과 경배로 하나님 앞에 나아가는 예배 공동체를 섬깁니다.',
                icon: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></> },
              { name:'청년부', desc:'다음 세대 청년들이 하나님 안에서 꿈을 발견하도록 돕습니다.',
                icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></> },
              { name:'아동부', desc:'어린이들이 말씀으로 자라나고 믿음의 뿌리를 내리도록 양육합니다.',
                icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/> },
              { name:'구역부', desc:'소그룹 구역 모임을 통해 성도 간 사랑의 교제를 나눕니다.',
                icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></> },
              { name:'선교부', desc:'국내외 선교사 파송 및 지원을 통해 복음을 땅끝까지 전합니다.',
                icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
              { name:'성경학교', desc:'체계적인 성경 교육으로 말씀에 깊이 뿌리내린 성도를 양성합니다.',
                icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></> },
            ].map((m) => (
              <div key={m.name} className="dt-ministry-item">
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

      {/* ─── NEWS ─── */}
      <section id="dt-news" className="dt-sec" style={{background:'#fff'}}>
        <div className="dt-wrap">
          <div className="dt-sermon-header dt-fade">
            <div>
              <div className="dt-label">Church News</div>
              <h2 className="dt-h2">교회 소식</h2>
              <div className="dt-div" />
            </div>
            <a href="/notices" className="dt-see-all">전체 보기 →</a>
          </div>
          <div className="dt-news-layout dt-fade">
            <a href="/notices" className="dt-news-main">
              <img className="dt-news-main-img" src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=75" alt="소식" />
              <div className="dt-news-main-body">
                <div className="dt-news-cat">공지사항</div>
                <div className="dt-news-main-title">2025년 하반기 성경학교 등록 안내</div>
                <p className="dt-news-excerpt">올해 하반기 성경학교가 7월 첫째 주부터 시작됩니다. 믿음의 기초를 다지고 싶으신 분, 말씀을 체계적으로 배우고 싶으신 분은 교회 사무실로 문의해 주세요.</p>
                <div className="dt-news-date">2025. 06. 02</div>
              </div>
            </a>
            <div className="dt-news-list">
              {[
                { cat:'행사안내', title:'청년부 여름 수련회 참가 신청',        date:'2025. 05. 28', img:'https://images.unsplash.com/photo-1469521669194-babb45599def?w=300&q=70' },
                { cat:'목회칼럼', title:'6월 목사님 칼럼 — 기도의 자리로',    date:'2025. 05. 25', img:'https://images.unsplash.com/photo-1516321165247-4aa89a48be55?w=300&q=70' },
                { cat:'봉사안내', title:'지역 어르신 섬김 봉사 모집 (6월)',    date:'2025. 05. 20', img:'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=300&q=70' },
                { cat:'교회소식', title:'새가족부 5월 정착 소감 나눔',         date:'2025. 05. 15', img:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&q=70' },
              ].map((n) => (
                <a href="/notices" key={n.title} className="dt-news-item">
                  <img className="dt-news-item-img" src={n.img} alt="" />
                  <div className="dt-news-item-body">
                    <div className="dt-news-item-cat">{n.cat}</div>
                    <div className="dt-news-item-title">{n.title}</div>
                    <div className="dt-news-item-date">{n.date}</div>
                  </div>
                </a>
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
        <div className="dt-gallery-grid">
          <div className="dt-gallery-cell tall">
            <img src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&q=70" alt="" />
            <div className="dt-gallery-overlay" />
          </div>
          {[
            'https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=600&q=70',
            'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=70',
            'https://images.unsplash.com/photo-1547393947-dea7041c4a4e?w=600&q=70',
            'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=70',
            'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=600&q=70',
            'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=70',
          ].map((src, i) => (
            <div key={i} className="dt-gallery-cell">
              <img src={src} alt="" />
              <div className="dt-gallery-overlay" />
            </div>
          ))}
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="dt-contact" className="dt-intro dt-sec">
        <div className="dt-wrap">
          <div className="dt-fade" style={{maxWidth:'480px',marginBottom:'44px'}}>
            <div className="dt-label">Directions &amp; Contact</div>
            <h2 className="dt-h2">오시는 길</h2>
            <div className="dt-div" />
          </div>
          <div className="dt-contact-grid dt-fade">
            <div className="dt-map-ph">
              <div className="dt-map-pin" />
            </div>
            <div>
              <div className="dt-info-list">
                {[
                  { label:'주소', value:'서울특별시 성북구 보문로 123\n그리스도사랑교회 본당 3층',
                    icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></> },
                  { label:'전화 / 팩스', value:'02-123-4567 / 02-123-4568',
                    icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3.12h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.9A16 16 0 0 0 13.1 16.1l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17.14"/> },
                  { label:'이메일', value:'info@christlovechurch.kr',
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
                <div className="dt-transport-item"><span className="dt-t-badge dt-subway">지하철</span><span>6호선 보문역 2번 출구 도보 5분</span></div>
                <div className="dt-transport-item"><span className="dt-t-badge dt-bus">버스</span><span>간선버스 142, 273 — 보문교회 앞 하차</span></div>
                <div className="dt-transport-item"><span className="dt-t-badge dt-car">주차</span><span>교회 지하 주차장 이용 가능 (예배 시간 2시간 무료)</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="dt-footer">
        <div className="dt-wrap">
          <div className="dt-footer-top">
            <div>
              <div className="dt-footer-logo-ko">그리스도사랑교회</div>
              <div className="dt-footer-logo-en">Christ Love Church</div>
              <p className="dt-footer-desc">말씀과 기도, 전도와 봉사로 세워지는<br />하나님의 공동체입니다.<br />1994년 창립 · 서울 성북구</p>
            </div>
            <div>
              <div className="dt-footer-col-title">예배 안내</div>
              <div className="dt-footer-links">
                <a href="#">주일 1부 예배 — 09:00</a>
                <a href="#">주일 2부 예배 — 11:00</a>
                <a href="#">수요 예배 — 19:30</a>
                <a href="#">금요 기도회 — 21:00</a>
              </div>
            </div>
            <div>
              <div className="dt-footer-col-title">빠른 이동</div>
              <div className="dt-footer-links">
                <a href="/church/about">교회 소개</a>
                <a href="/worship/sermon/sunday-morning">설교 아카이브</a>
                <a href="#">사역 부서</a>
                <a href="/notices">교회 소식</a>
                <a href="/church/contact">오시는 길</a>
              </div>
            </div>
            <div>
              <div className="dt-footer-col-title">멤버 서비스</div>
              <div className="dt-footer-links">
                <a href="/login">로그인 / 회원가입</a>
                <a href="/mypage">마이페이지</a>
                <a href="/church/first-visit">새가족 등록</a>
                <a href="/bulletin">주보</a>
              </div>
            </div>
          </div>
          <div className="dt-footer-bottom">
            <span className="dt-footer-copy">© 2025 그리스도사랑교회. All rights reserved.</span>
            <div className="dt-socials">
              <a href="#" className="dt-social-btn" title="YouTube">
                <svg viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
              </a>
              <a href="#" className="dt-social-btn" title="Instagram">
                <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" strokeLinecap="round"/></svg>
              </a>
              <a href="#" className="dt-social-btn" title="카카오">
                <svg viewBox="0 0 24 24"><path d="M12 3C6.5 3 2 6.58 2 11c0 2.72 1.72 5.13 4.35 6.63L5.14 21l4.38-2.46c.79.13 1.63.2 2.48.2 5.5 0 10-3.58 10-8s-4.5-8-10-8z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
