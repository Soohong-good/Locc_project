import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { submitHelpRequest } from '@/api/helpRequests'
import useScrollAnimation from '@/hooks/useScrollAnimation'

// ─── 성경 인용 블록 ───────────────────────────────────
const BibleVerse = ({ text, reference, thick = false, light = false }) => (
  <div className={`border-l-2 ${thick ? (light ? 'border-white' : 'border-slate-900') : (light ? 'border-white/40' : 'border-slate-300')} pl-8 py-2`}>
    <p className={`text-2xl md:text-3xl leading-[1.7] font-light italic mb-4 ${light ? 'text-white/90' : 'text-slate-700'}`}>
      {text.split('\n').map((line, i) => (
        <span key={i}>{line}{i < text.split('\n').length - 1 && <br />}</span>
      ))}
    </p>
    <p className={`text-base font-light ${light ? 'text-white/60' : 'text-slate-500'}`}>{reference}</p>
  </div>
)

// ─── 단계 헤더 ────────────────────────────────────────
const StepHeader = ({ num, title, light = false }) => (
  <div className="mb-16">
    <div className={`text-6xl font-light mb-6 ${light ? 'text-white/20' : 'text-slate-200'}`}>
      {String(num).padStart(2, '0')}
    </div>
    <h2 className={`text-4xl md:text-5xl font-light tracking-tight mb-8 ${light ? 'text-white' : 'text-slate-900'}`}>
      {title}
    </h2>
    <div className={`h-px w-16 ${light ? 'bg-white/30' : 'bg-slate-300'}`} />
  </div>
)

// ─── 도움 요청 모달 ───────────────────────────────────
const HelpModal = ({ onClose }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', content: '' })
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { mutate, isPending, error } = useMutation({
    mutationFn: submitHelpRequest,
    onSuccess: () => setSubmitted(true),
  })

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!agreed) return
    mutate(form)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center">
          <h3 className="text-2xl font-light text-slate-900">도움 요청</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-8 py-8">
          {submitted ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl font-light text-slate-900 mb-2">도움 요청이 접수되었습니다</p>
              <p className="text-slate-500 text-sm mb-8">빠른 시일 내에 연락드리겠습니다.</p>
              <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 transition font-medium">
                닫기
              </button>
            </div>
          ) : (
            <>
              <p className="text-slate-600 mb-8 leading-relaxed">
                예수님에 대해 더 알고 싶으시거나 신앙 상담이 필요하신가요?<br />
                아래 정보를 남겨주시면 교회에서 연락드리겠습니다.
              </p>
              {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                  요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                {[
                  { id: 'name',  label: '이름',     type: 'text',  placeholder: '홍길동' },
                  { id: 'phone', label: '전화번호', type: 'tel',   placeholder: '010-1234-5678' },
                  { id: 'email', label: '이메일',   type: 'email', placeholder: 'example@email.com' },
                ].map(({ id, label, type, placeholder }) => (
                  <div key={id}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={type} name={id} value={form[id]}
                      onChange={handleChange} required placeholder={placeholder}
                      className="w-full px-4 py-3 border border-slate-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    도움이 필요한 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content" value={form.content} onChange={handleChange}
                    required rows={6} placeholder={'예수님에 대해 더 알고 싶어요.\n신앙 상담이 필요합니다.'}
                    className="w-full px-4 py-3 border border-slate-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition resize-none"
                  />
                </div>
                <div className="bg-slate-50 p-4 text-sm text-slate-600">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
                    <span>
                      개인정보 수집 및 이용에 동의합니다. <span className="text-red-500">*</span>
                      <span className="block text-xs text-slate-500 mt-1 leading-relaxed">
                        수집항목: 이름, 전화번호, 이메일 / 이용목적: 상담 및 연락 / 보유기간: 상담 완료 후 1년
                      </span>
                    </span>
                  </label>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit" disabled={isPending || !agreed}
                    className="flex-1 px-6 py-4 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 transition font-medium tracking-wide"
                  >
                    {isPending ? '제출 중...' : '요청 제출하기'}
                  </button>
                  <button type="button" onClick={onClose}
                    className="px-6 py-4 border border-slate-300 text-slate-700 hover:bg-slate-50 transition">
                    취소
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 메인 페이지 ──────────────────────────────────────
const SalvationPage = () => {
  const [helpOpen, setHelpOpen] = useState(false)
  const { ref: ref1, isVisible: v1 } = useScrollAnimation()
  const { ref: ref2, isVisible: v2 } = useScrollAnimation()
  const { ref: ref3, isVisible: v3 } = useScrollAnimation()
  const { ref: ref4, isVisible: v4 } = useScrollAnimation()
  const { ref: ref5, isVisible: v5 } = useScrollAnimation()

  return (
    <div className="relative" style={{ backgroundColor: '#ffffff' }}>

      {/* ── 고정 배경 이미지 ──────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage: 'url(/images/bg-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* ── Hero — 반투명 ─────────────────────────────────── */}
      <section className="pt-page pb-20 px-6 text-white relative" style={{ zIndex: 1, backgroundColor: 'rgba(15,23,42,0.82)' }}>
        <div className="max-w-6xl mx-auto animate-fade-in-up">
          <p className="text-xs font-medium tracking-[0.3em] uppercase mb-3 text-eyebrow">
            The Way of Salvation
          </p>
          <h1 className="text-4xl md:text-5xl font-light leading-tight tracking-tight">복음말씀</h1>
          <p className="mt-4 text-lg font-light text-slate-300 max-w-2xl">
            하나님께서는 우리를 사랑하셔서 독생자 예수 그리스도를 보내주셨습니다
          </p>
        </div>
      </section>

      {/* ── 01 하나님의 사랑 — 불투명 흰색 ──────────────── */}
      <section className="py-32 px-6 relative" style={{ zIndex: 1, backgroundColor: '#ffffff' }}>
        <div ref={ref1} className={`max-w-4xl mx-auto transition-all duration-700 ${v1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <StepHeader num={1} title="하나님의 사랑" />
          <div className="space-y-12">
            <BibleVerse thick
              text={"하나님이 세상을 이처럼 사랑하사\n독생자를 주셨으니 이는 그를 믿는 자마다\n멸망하지 않고 영생을 얻게 하려 하심이라"}
              reference="요한복음 3:16"
            />
            <p className="text-lg md:text-xl text-slate-600 leading-[1.9] font-light">
              하나님은 우리를 창조하셨고, 우리를 사랑하십니다.
              하나님께서는 우리가 그분을 알고, 그분과 교제하며,
              그분 안에서 기쁨과 평안을 누리기를 원하십니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 02 인간의 죄 — 반투명 ────────────────────────── */}
      <section className="py-32 px-6 text-white relative" style={{ zIndex: 1, backgroundColor: 'rgba(15,23,42,0.80)' }}>
        <div ref={ref2} className={`max-w-4xl mx-auto transition-all duration-700 ${v2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <StepHeader num={2} title="인간의 죄" light />
          <div className="space-y-12">
            <BibleVerse thick light
              text={"모든 사람이 죄를 범하였으매\n하나님의 영광에 이르지 못하더니"}
              reference="로마서 3:23"
            />
            <p className="text-lg md:text-xl text-white/85 leading-[1.9] font-light">
              그러나 인간은 하나님께 불순종하여 죄를 지었습니다.
              죄는 우리를 하나님으로부터 분리시키고, 영원한 사망으로 이끕니다.
            </p>
            <BibleVerse light
              text={"죄의 삯은 사망이요\n하나님의 은사는 그리스도 예수 우리 주 안에 있는 영생이니라"}
              reference="로마서 6:23"
            />
          </div>
        </div>
      </section>

      {/* ── 03 하나님의 구원 — 불투명 흰색 ──────────────── */}
      <section className="py-32 px-6 relative" style={{ zIndex: 1, backgroundColor: '#ffffff' }}>
        <div ref={ref3} className={`max-w-4xl mx-auto transition-all duration-700 ${v3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <StepHeader num={3} title="하나님의 구원" />
          <div className="space-y-12">
            <BibleVerse thick
              text={"그리스도께서 우리를 위하여 저주를 받은 바 되사\n율법의 저주에서 우리를 속량하셨으니"}
              reference="갈라디아서 3:13"
            />
            <p className="text-lg md:text-xl text-slate-600 leading-[1.9] font-light">
              하나님께서는 우리를 너무나 사랑하셔서 독생자 예수 그리스도를 이 땅에 보내주셨습니다.
              예수님은 우리의 죄를 대신하여 십자가에서 죽으시고,
              사흘 만에 부활하심으로 죄와 사망의 권세를 이기셨습니다.
            </p>
            <BibleVerse
              text={"우리가 아직 죄인 되었을 때에\n그리스도께서 우리를 위하여 죽으심으로\n하나님께서 우리에 대한 자기의 사랑을 확증하셨느니라"}
              reference="로마서 5:8"
            />
          </div>
        </div>
      </section>

      {/* ── 04 우리의 응답 — 반투명 ──────────────────────── */}
      <section className="py-32 px-6 text-white relative" style={{ zIndex: 1, backgroundColor: 'rgba(15,23,42,0.80)' }}>
        <div ref={ref4} className={`max-w-4xl mx-auto transition-all duration-700 ${v4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <StepHeader num={4} title="우리의 응답" light />
          <div className="space-y-12">
            <BibleVerse thick light
              text={"네가 만일 네 입으로 예수를 주로 시인하며\n또 하나님께서 그를 죽은 자 가운데서\n살리신 것을 네 마음에 믿으면 구원을 받으리라"}
              reference="로마서 10:9"
            />
            <p className="text-lg md:text-xl text-white/85 leading-[1.9] font-light">
              우리는 예수 그리스도를 우리의 구주로 믿고 시인해야 합니다.
              우리의 죄를 회개하고, 예수님을 우리 삶의 주인으로 고백하며, 그분을 믿고 순종해야 합니다.
            </p>
            <BibleVerse light
              text={"영접하는 자 곧 그 이름을 믿는 자들에게는\n하나님의 자녀가 되는 권세를 주셨으니"}
              reference="요한복음 1:12"
            />
            {/* 회개의 기도 */}
            <div className="bg-white/10 border border-white/20 text-white p-10 md:p-12">
              <h3 className="text-2xl font-light mb-8 pb-4 border-b border-white/20">회개의 기도</h3>
              <div className="space-y-6 text-lg md:text-xl leading-[1.9] font-light text-white/90">
                <p>사랑의 하나님!</p>
                <p>저는 전적으로 타락한 죄인입니다.<br />지금까지 죄 아래서 하나님을 모르며 제가 주인이 되어서 살았습니다.</p>
                <p>저의 모든 죄를 회개하며, 오직 하나님의 은혜로 예수님이 나를 위해서<br />이 땅에 오셔서 십자가에서 죽으시고 부활하신 그리스도라는 사실을 믿습니다.</p>
                <p>나의 공로가 아닌 예수님의 의로우심을 의지하며,<br />예수님을 나의 구주, 나의 주인으로 믿습니다.</p>
                <p>예수 그리스도와 연합된 구원받은 자로 살도록 인도해주세요.<br />살아계신 예수 그리스도 이름으로 기도합니다.</p>
                <p className="pt-4">아멘.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 05 새로운 삶 — 불투명 흰색 ──────────────────── */}
      <section className="py-32 px-6 relative" style={{ zIndex: 1, backgroundColor: '#ffffff' }}>
        <div ref={ref5} className={`max-w-4xl mx-auto transition-all duration-700 ${v5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <StepHeader num={5} title="새로운 삶" />
          <div className="space-y-12">
            <BibleVerse thick
              text={"그런즉 누구든지 그리스도 안에 있으면\n새로운 피조물이라 이전 것은 지나갔으니\n보라 새 것이 되었도다"}
              reference="고린도후서 5:17"
            />
            <p className="text-lg md:text-xl text-slate-600 leading-[1.9] font-light">
              예수님을 영접한 사람은 하나님의 자녀가 되었습니다.
              이제 새로운 삶을 시작하여 하나님을 예배하고, 성경을 읽고, 기도하며,
              교회에 출석하여 다른 그리스도인들과 함께 신앙생활을 해야 합니다.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: '성경 읽기', desc: '매일 성경을 읽으며 하나님의 말씀으로 양육받으세요.' },
                { title: '기도',     desc: '하나님과 대화하며 그분과의 관계를 깊이 해가세요.' },
                { title: '예배',     desc: '교회에 출석하여 하나님을 예배하고 교제하세요.' },
                { title: '전도',     desc: '다른 사람들에게 복음을 전하며 하나님의 사랑을 나누세요.' },
              ].map(({ title, desc }) => (
                <div key={title} className="bg-slate-50 p-8">
                  <h4 className="text-xl font-medium text-slate-900 mb-4">{title}</h4>
                  <p className="text-base text-slate-600 leading-[1.8] font-light">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 06 복음 영상 — 반투명 ────────────────────────── */}
      <section className="py-32 px-6 text-white relative" style={{ zIndex: 1, backgroundColor: 'rgba(15,23,42,0.80)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <div className="text-6xl font-light text-white/20 mb-6">06</div>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-8">복음 영상</h2>
            <div className="h-px w-16 bg-white/30 mx-auto mb-8" />
            <p className="text-lg text-white/70 font-light">
              복음 메시지를 담은 영상을 통해 예수님을 더 깊이 알아가세요
            </p>
          </div>
          <div className="space-y-12">
            {[
              { title: '2024년 12월 22일 성탄생명초청축제 말씀', src: 'https://www.youtube.com/embed/cHtB4Id_Nyw?start=7869' },
              { title: '예수님은 누구신가 1 – 죄에서 우리를 구원할 예수', subtitle: '마태복음 1:18–23', src: 'https://www.youtube.com/embed/SaKP1_ppwyA' },
            ].map(({ title, subtitle, src }) => (
              <div key={src} className="bg-white/10 border border-white/15 p-8 md:p-10">
                <h3 className="text-2xl font-medium text-white mb-2">{title}</h3>
                {subtitle && <p className="text-base text-white/60 mb-4">{subtitle}</p>}
                <div className="aspect-video bg-black">
                  <iframe width="100%" height="100%" src={src} title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen className="w-full h-full"
                  />
                </div>
              </div>
            ))}
            <div className="text-center pt-8">
              <a href="https://www.youtube.com/@그리스도사랑교회-k4z" target="_blank" rel="noreferrer"
                className="inline-flex items-center px-8 py-4 bg-red-600 text-white hover:bg-red-700 transition font-medium tracking-wide">
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                교회 유튜브 채널 방문하기
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA — 반투명 ─────────────────────────────────── */}
      <section className="py-32 px-6 text-white relative" style={{ zIndex: 1, backgroundColor: 'rgba(15,23,42,0.85)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-8 leading-[1.4]">
            예수님을 믿고 더 알기를 원하시나요?
          </h2>
          <p className="text-lg md:text-xl text-white/75 mb-12 font-light leading-[1.8] max-w-2xl mx-auto">
            더 자세한 상담이나 도움이 필요하시면<br />
            언제든지 연락 주시거나 교회를 방문해 주세요.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/church/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 transition font-light tracking-wide">
              교회 연락처
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <button onClick={() => setHelpOpen(true)}
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-slate-900 transition font-light tracking-wide">
              도움 요청
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* 도움 요청 모달 */}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </div>
  )
}

export default SalvationPage
