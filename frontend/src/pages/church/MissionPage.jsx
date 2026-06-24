import { Link } from 'react-router-dom'
import PageHero from '@/components/ui/PageHero'

const MissionCard = ({ title, children, tags }) => (
  <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm">
    <h3 className="text-2xl md:text-3xl font-light text-slate-900 mb-6">{title}</h3>
    <p className="text-lg text-slate-600 leading-[1.9] font-light mb-6">{children}</p>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">
          {tag}
        </span>
      ))}
    </div>
  </div>
)

const FieldCard = ({ number, accent, title, badge, badgeColor, description, tags }) => (
  <div className={`bg-slate-50 p-8 md:p-10 rounded-lg border-l-4 ${accent}`}>
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 ${accent.replace('border-', 'bg-')} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
        <span className="text-white font-medium">{number}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h4 className="text-2xl font-medium text-slate-900">{title}</h4>
          {badge && (
            <span className={`px-3 py-1 text-xl rounded-full font-semibold ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-lg text-slate-600 leading-relaxed font-light">{description}</p>
        {tags && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-white text-slate-700 text-sm rounded-full border border-slate-200">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)

export default function MissionPage() {
  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Mission"
        title="선교"
        subtitle="모든 민족에게 복음을 전하라는 주님의 지상 명령을 실천합니다"
      />

      {/* 선교 비전 */}
      <section className="py-32 bg-white px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-20 text-center">
            <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-4">Vision</p>
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-6">선교 비전</h2>
            <div className="h-px w-16 bg-slate-300 mx-auto" />
          </div>

          <div className="space-y-16">
            <div className="text-center max-w-3xl mx-auto">
              <blockquote className="text-2xl md:text-3xl font-light text-slate-700 leading-[1.7] mb-8 italic">
                "그러므로 너희는 가서 모든 민족을 제자로 삼아<br />
                아버지와 아들과 성령의 이름으로 세례를 베풀고<br />
                내가 너희에게 분부한 모든 것을 가르쳐 지키게 하라"
              </blockquote>
              <p className="text-lg text-slate-500">마태복음 28:19-20</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 pt-12">
              {[
                {
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ),
                  title: '전 세계',
                  desc: '모든 민족과 나라에\n복음을 전합니다',
                },
                {
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  ),
                  title: '제자 훈련',
                  desc: '현지인을 제자로 삼아\n복음을 전하게 합니다',
                },
                {
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  ),
                  title: '교회 개척',
                  desc: '현지 교회를 세워\n자립하도록 돕습니다',
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="text-center p-8">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {icon}
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 선교 활동 */}
      <section className="py-32 bg-slate-50 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-20 text-center">
            <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-4">Activities</p>
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-6">선교 활동</h2>
            <div className="h-px w-16 bg-slate-300 mx-auto" />
          </div>
          <div className="space-y-12">
            <MissionCard title="해외 선교" tags={['선교사 파송', '교회 개척', '신학교 지원']}>
              복음이 필요한 나라와 지역에 선교사를 파송하고 후원합니다.
              현지 문화를 존중하며 복음을 전하고,
              교회를 개척하여 현지인 스스로 복음을 전하도록 돕습니다.
            </MissionCard>
            <MissionCard title="국내 선교" tags={['미자립 교회 지원', '복지 사역', '캠퍼스 선교']}>
              한국 내에서 복음이 필요한 지역과 대상을 찾아 섬깁니다.
              미자립 교회를 돕고, 어려운 이웃에게 그리스도의 사랑을 실천합니다.
            </MissionCard>
            <MissionCard title="단기 선교" tags={['여름 단기선교', '겨울 단기선교', '의료 선교']}>
              매년 여름과 겨울, 선교지를 직접 방문하여
              복음을 전하고 현지 교회를 돕습니다.
              단기 선교를 통해 선교에 대한 비전을 품게 됩니다.
            </MissionCard>
          </div>
        </div>
      </section>

      {/* 선교 현황 */}
      <section className="py-32 bg-white px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-20 text-center">
            <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-4">Mission Field</p>
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-6">선교 현황</h2>
            <div className="h-px w-16 bg-slate-300 mx-auto mb-8" />
            <p className="text-lg text-slate-600 font-light max-w-2xl mx-auto">
              그리스도 사랑교회가 후원하고 있는<br />
              국내외 선교 현장을 소개합니다
            </p>
          </div>

          {/* 국내 선교 */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-3xl md:text-4xl font-light text-slate-900">국내 선교</h3>
            </div>
            <div className="pl-0 md:pl-16">
              <FieldCard
                number="1"
                accent="border-slate-900"
                title="GLL센터 (TCK문화센터)"
                description="Third Culture Kids(제3문화권 아이들)를 위한 문화센터로서, 다문화 가정과 해외 거주 경험이 있는 아이들의 정체성 확립과 문화적응을 돕는 사역을 지원하고 있습니다."
                tags={['TCK 지원', '문화적응 프로그램', '정체성 교육']}
              />
            </div>
          </div>

          {/* 해외 선교 */}
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-3xl md:text-4xl font-light text-slate-900">해외 선교</h3>
            </div>
            <div className="pl-0 md:pl-16 space-y-6">
              <FieldCard
                number="1"
                accent="border-slate-700"
                title="미국"
                badge="이원규 선교사"
                badgeColor="bg-blue-100 text-blue-800"
                description="미국 내 한인 디아스포라와 현지인을 대상으로 복음 전파와 교회 개척 사역을 감당하고 있습니다."
              />
              <FieldCard
                  number="2"
                  accent="border-slate-700"
                  title="필리핀"
                  badge="신남선 선교사"
                  badgeColor="bg-purple-100 text-purple-800"
                  description="필리핀 중부지역(central Luzon)에서 성경적 교회를 세우고, 후대를 치유하며, 현지인 교회를 살리는 사역을 하고 있습니다."
              />
                <FieldCard
                number="3"
                accent="border-slate-700"
                title="성경번역 선교회"
                badge="임오랑 선교사"
                badgeColor="bg-green-100 text-green-800"
                description="자국어 성경이 없는 소수민족들을 위한 성경 번역 및 문자 개발 사역을 지원하고 있습니다."
                tags={['성경 번역', '문자 개발', '소수민족 사역']}
              />

              <div className="bg-slate-50 p-8 md:p-10 rounded-lg border-l-4 border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-medium">4</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-medium text-slate-900 mb-2">액츠신학 연구원 후원</h4>
                    <p className="text-sm text-slate-500 mb-4">All nations Christ Theological Seminaries (ACTS)</p>
                    <p className="text-lg text-slate-600 leading-relaxed font-light mb-4">
                      액츠신학 연구원(ACTS)을 통해 차세대 선교 리더 양성과 신학 교육을 지원하고 있습니다.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['신학 교육', '선교사 양성', '장학금 지원'].map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-white text-slate-700 text-sm rounded-full border border-slate-200">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 후원 안내 */}
          <div className="mt-20 text-center p-10 bg-slate-900 rounded-lg">
            <p className="text-xl text-slate-300 font-light mb-6">
              선교 사역에 동참하고 싶으신 분은<br />
              교회 사무실로 문의해 주시기 바랍니다
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>053-962-8948</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>cmedia881213@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 선교 후원 */}
      <section className="py-32 bg-white px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-20 text-center">
            <p className="text-xs tracking-[0.3em] text-eyebrow uppercase mb-4">Support</p>
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-6">선교 후원</h2>
            <div className="h-px w-16 bg-slate-300 mx-auto" />
          </div>
          <p className="text-center text-lg md:text-xl text-slate-600 leading-[1.9] font-light mb-16 max-w-2xl mx-auto">
            선교는 우리 모두의 사명입니다.<br />
            기도와 헌금, 그리고 직접 참여를 통해<br />
            함께 선교의 사명을 감당합니다.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: '기도 후원', desc: '선교사와 선교지를\n위해 기도합니다' },
              { title: '재정 후원', desc: '선교 사역을 위한\n헌금으로 후원합니다' },
              { title: '직접 참여', desc: '단기 선교팀에\n직접 참여합니다' },
            ].map(({ title, desc }) => (
              <div key={title} className="text-center p-8 bg-slate-50 rounded-lg">
                <h3 className="text-xl font-medium text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-600 whitespace-pre-line">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-slate-900 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight mb-8">
            함께 선교의 사명을<br />감당하시겠습니까?
          </h2>
          <p className="text-xl text-slate-300 mb-12 font-light">
            선교에 관심이 있으시거나 더 자세한 정보가 필요하시면<br />
            언제든지 교회로 문의해 주시기 바랍니다
          </p>
          <Link
            to="/church/contact"
            className="inline-block px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 transition rounded text-lg font-medium"
          >
            교회 연락처 보기
          </Link>
        </div>
      </section>
    </div>
  )
}
