import PageHero from '@/components/ui/PageHero'
import KakaoMap from '@/components/ui/KakaoMap'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow="Location & Contact"
        title="오시는 길"
        subtitle="그리스도사랑교회로 오시는 길을 안내합니다"
      />

      {/* 지도 */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-100 h-96 lg:h-[600px] relative">
            <KakaoMap />
          </div>
        </div>
      </section>

      {/* 연락처 정보 */}
      <section className="py-24 bg-slate-50 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">

            {/* 주소 */}
            <div>
              <div className="mb-6">
                <svg className="w-8 h-8 text-slate-900 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-sm tracking-[0.2em] text-eyebrow uppercase mb-4">Address</h3>
              </div>
              <div className="space-y-2 text-slate-700 font-light text-lg">
                <p className="font-medium text-slate-900">대구광역시 동구</p>
                <p>안심로55길 59</p>
                <p className="text-base text-slate-500">(안심동)</p>
                <p className="mt-6 pt-6 border-t border-slate-200 font-medium text-slate-900">
                  그리스도사랑교회
                </p>
              </div>
            </div>

            {/* 연락처 */}
            <div>
              <div className="mb-6">
                <svg className="w-8 h-8 text-slate-900 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <h3 className="text-sm tracking-[0.2em] text-eyebrow uppercase mb-4">Contact</h3>
              </div>
              <div className="space-y-4 text-slate-700 font-light text-lg">
                <div>
                  <p className="text-sm text-slate-500 mb-1">전화</p>
                  <a href="tel:053-962-8948" className="hover:text-slate-900 transition-colors block">
                    053-962-8948
                  </a>
                  <a href="tel:053-961-0931" className="hover:text-slate-900 transition-colors block">
                    053-961-0931
                  </a>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">팩스</p>
                  <p>053-961-0862</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">사랑선교원</p>
                  <a href="tel:053-965-8948" className="hover:text-slate-900 transition-colors">
                    053-965-8948
                  </a>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">이메일</p>
                  <a
                    href="mailto:cmedia881213@gmail.com"
                    className="hover:text-slate-900 transition-colors break-all"
                  >
                    cmedia881213@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* 교통편 */}
            <div>
              <div className="mb-6">
                <svg className="w-8 h-8 text-slate-900 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                <h3 className="text-sm tracking-[0.2em] text-eyebrow uppercase mb-4">Transportation</h3>
              </div>
              <div className="space-y-6 text-slate-700 font-light text-lg">
                <div>
                  <p className="font-medium text-slate-900 mb-2">지하철</p>
                  <p className="text-base">1호선 반야월역 4번 출구 하차</p>
                  <p className="text-base text-slate-500">도보 약 10분</p>
                </div>
                <div>
                  <p className="font-medium text-slate-900 mb-2">시내버스</p>
                  <div className="space-y-3 text-base">
                    <div>
                      <p className="text-slate-900">경북교통</p>
                      <p className="text-sm text-slate-600 mt-1">805, 836, 동구10, 동구4, 동구4-1, 북구3</p>
                    </div>
                    <div>
                      <p className="text-slate-900">안심지구대</p>
                      <p className="text-sm text-slate-600 mt-1">708, 836, 급행5, 동구10</p>
                    </div>
                    <div>
                      <p className="text-slate-900">동부고교</p>
                      <p className="text-sm text-slate-600 mt-1">55, 555, 808, 814, 818, 북구3</p>
                    </div>
                    <div>
                      <p className="text-slate-900">반야월역</p>
                      <p className="text-sm text-slate-600 mt-1">518, 618, 651, 805, 836, 848, 동구4-1, 동구10, 급행10, 수성3, 수성3-1, 수성6</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-slate-900 mb-2">주차</p>
                  <p className="text-base">교회 주차장 이용 가능</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
