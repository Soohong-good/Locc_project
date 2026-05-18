import { Link } from "react-router-dom";
import PageHero from '@/components/ui/PageHero'

export default function FirstVisitPage() {
    return (
        <main>
            <PageHero
                eyebrow="First Visit Guide"
                title="처음 교회에 방문하신 분"
                subtitle="그리스도사랑교회를 찾아주셔서 감사합니다. 처음 방문하시는 분들을 위한 안내입니다."
                bgImage="/firstVisit.png"
            />

            {/* 주일예배 안내 */}
            <section className="py-32 bg-white px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-16">
                        <div className="text-6xl font-light text-slate-200 mb-6">01</div>
                        <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-8">
                            주일예배 안내
                        </h2>
                        <div className="h-px w-16 bg-slate-300 mb-12" />
                    </div>

                    <div className="space-y-12">
                        <div className="prose prose-lg prose-slate max-w-none">
                            <p className="text-lg md:text-xl text-slate-600 leading-[1.9] font-light mb-12">
                                그리스도사랑교회는 매주 주일 오전 9시와 11시에 예배를 드립니다.
                                <br />
                                처음 오시는 분들도 부담 없이 참석하실 수 있습니다.
                            </p>

                            {/* 예배 시간표 */}
                            <div className="bg-slate-50 p-8 md:p-10 mb-12">
                                <h3 className="text-2xl font-medium text-slate-900 mb-8">
                                    주일 예배 시간
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-baseline border-b border-slate-200 pb-4">
                                        <div>
                                            <p className="text-xl font-medium text-slate-900 mb-1">
                                                주일 1부 예배
                                            </p>
                                            <p className="text-base text-slate-500">본당</p>
                                        </div>
                                        <p className="text-3xl font-light text-slate-900 tabular-nums">
                                            09:00
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-baseline border-b border-slate-200 pb-4">
                                        <div>
                                            <p className="text-xl font-medium text-slate-900 mb-1">
                                                주일 2부 예배
                                            </p>
                                            <p className="text-base text-slate-500">본당</p>
                                        </div>
                                        <p className="text-3xl font-light text-slate-900 tabular-nums">
                                            11:00
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-baseline">
                                        <div>
                                            <p className="text-xl font-medium text-slate-900 mb-1">
                                                주일 오후 예배
                                            </p>
                                            <p className="text-base text-slate-500">본당</p>
                                        </div>
                                        <p className="text-3xl font-light text-slate-900 tabular-nums">
                                            15:00
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 예배 안내 */}
                            <div className="bg-slate-900 text-white p-8 md:p-10">
                                <h3 className="text-2xl font-light mb-6">예배 순서 안내</h3>
                                <div className="space-y-4 text-lg leading-[1.9] font-light">
                                    <p>
                                        •{" "}
                                        <strong className="font-medium">예배 시작 10분 전</strong>
                                        까지 도착하시면 여유롭게 준비하실 수 있습니다.
                                    </p>
                                    <p>
                                        • 예배는{" "}
                                        <strong className="font-medium">
                                            찬양, 기도, 말씀, 헌금
                                        </strong>{" "}
                                        순서로 진행됩니다.
                                    </p>
                                    <p>
                                        • 처음 오시는 분들을 위해{" "}
                                        <strong className="font-medium">안내위원</strong>이
                                        도와드립니다.
                                    </p>
                                    <p>
                                        • 예배 후{" "}
                                        <strong className="font-medium">
                                            애찬(간단한 식사)
                                        </strong>
                                        이 준비되어 있습니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 교인 등록 방법 */}
            <section className="py-32 bg-slate-50 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-16">
                        <div className="text-6xl font-light text-slate-200 mb-6">02</div>
                        <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-8">
                            교인 등록 방법
                        </h2>
                        <div className="h-px w-16 bg-slate-300 mb-12" />
                    </div>

                    <div className="space-y-12">
                        <div className="prose prose-lg prose-slate max-w-none">
                            <p className="text-lg md:text-xl text-slate-600 leading-[1.9] font-light mb-12">
                                그리스도사랑교회의 정식 교인이 되기를 원하시는 분들은
                                <br />
                                아래 절차를 통해 등록하실 수 있습니다.
                            </p>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 text-center">
                                    <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-light">
                                        1
                                    </div>
                                    <h3 className="text-xl font-medium text-slate-900 mb-4">
                                        새가족 교실 수료
                                    </h3>
                                    <p className="text-base text-slate-600 leading-[1.8] font-light">
                                        9주간의 새가족 교실을 통해 성경과 하나님, 교회에 대해 배웁니다.
                                    </p>
                                </div>

                                <div className="bg-white p-8 text-center">
                                    <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-light">
                                        2
                                    </div>
                                    <h3 className="text-xl font-medium text-slate-900 mb-4">
                                        등록 신청
                                    </h3>
                                    <p className="text-base text-slate-600 leading-[1.8] font-light">
                                        새가족 교실 수료 후 교인 등록 신청서를 작성합니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 새가족 교실 안내 */}
            <section className="py-32 bg-white px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-16">
                        <div className="text-6xl font-light text-slate-200 mb-6">03</div>
                        <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-8">
                            새가족 교실 안내
                        </h2>
                        <div className="h-px w-16 bg-slate-300 mb-12" />
                    </div>

                    <div className="space-y-12">
                        <div className="prose prose-lg prose-slate max-w-none">
                            <p className="text-lg md:text-xl text-slate-600 leading-[1.9] font-light mb-12">
                                새가족 교실은 처음 교회에 오신 분들을 위한 9주간 과정입니다.
                                <br />
                                성경과 하나님, 교회에 대해 알아가고, 신앙의 기초를 다지는
                                시간입니다.
                            </p>

                            <div className="bg-slate-50 p-8 md:p-10 mb-12">
                                <h3 className="text-2xl font-medium text-slate-900 mb-8">
                                    새가족 교실 커리큘럼
                                </h3>
                                <div className="space-y-6">
                                    <div className="border-l-4 border-slate-900 pl-6 py-2">
                                        <h4 className="text-xl font-medium text-slate-900 mb-2">
                                            1주차 - 하나님이 주신 구원
                                        </h4>
                                        <p className="text-base text-slate-600 leading-[1.8] font-light">
                                            롬 8:1-2, 요 14:6
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-slate-900 pl-6 py-2">
                                        <h4 className="text-xl font-medium text-slate-900 mb-2">
                                            2주차 - 구원 받은 하나님의 자녀
                                        </h4>
                                        <p className="text-base text-slate-600 leading-[1.8] font-light">
                                            엡 2:1-8
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-slate-900 pl-6 py-2">
                                        <h4 className="text-xl font-medium text-slate-900 mb-2">
                                            3주차 - 유일한 구원자이신 예수 그리스도
                                        </h4>
                                        <p className="text-base text-slate-600 leading-[1.8] font-light">
                                            행 4:12
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-slate-900 pl-6 py-2">
                                        <h4 className="text-xl font-medium text-slate-900 mb-2">
                                            4주차 - 성도의 두 가지 싸움
                                        </h4>
                                        <p className="text-base text-slate-600 leading-[1.8] font-light">
                                            죄성과 싸우며 사탄을 대적하라 (히 12:4, 벧전 5:7-8)
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-slate-900 pl-6 py-2">
                                        <h4 className="text-xl font-medium text-slate-900 mb-2">
                                            5주차 - 배우고 확신한 일에 거하라
                                        </h4>
                                        <p className="text-base text-slate-600 leading-[1.8] font-light">
                                            딤후 3:16-17
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-slate-900 pl-6 py-2">
                                        <h4 className="text-xl font-medium text-slate-900 mb-2">
                                            6주차 - 영적인 사실을 확인하고 응답 받는 기도
                                        </h4>
                                        <p className="text-base text-slate-600 leading-[1.8] font-light">
                                            요 14:14, 15:16, 16:24
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-slate-900 pl-6 py-2">
                                        <h4 className="text-xl font-medium text-slate-900 mb-2">
                                            7주차 - 교회에서 예배하는 신앙생활
                                        </h4>
                                        <p className="text-base text-slate-600 leading-[1.8] font-light">
                                            요 4:23-24
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-slate-900 pl-6 py-2">
                                        <h4 className="text-xl font-medium text-slate-900 mb-2">
                                            8주차 - 그리스도사랑교회의 비전
                                        </h4>
                                        <p className="text-base text-slate-600 leading-[1.8] font-light">
                                            롬 11:3-5
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-slate-900 pl-6 py-2">
                                        <h4 className="text-xl font-medium text-slate-900 mb-2">
                                            9주차 - 수료식
                                        </h4>
                                        <p className="text-base text-slate-600 leading-[1.8] font-light">
                                            새가족 교실 수료 및 교인 등록
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 text-white p-8 md:p-10">
                                <h3 className="text-2xl font-light mb-6">새가족 교실 안내</h3>
                                <div className="space-y-4 text-lg leading-[1.9] font-light">
                                    <p>
                                        • <strong className="font-medium">시간</strong>: 주일 오전
                                        10시 (2부 예배 전)
                                    </p>
                                    <p>
                                        • <strong className="font-medium">장소</strong>: 새가족실
                                        (1층 101호실)
                                    </p>
                                    <p>
                                        • <strong className="font-medium">대상</strong>:
                                        그리스도사랑교회에 처음 오신 분
                                    </p>
                                    <p>
                                        • <strong className="font-medium">기간</strong>: 9주 과정
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-slate-900 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
                        함께 예배하시길 환영합니다
                    </h2>
                    <p className="text-lg md:text-xl text-slate-300 mb-12 font-light leading-[1.8]">
                        그리스도사랑교회는 모든 분들을 환영합니다.
                        <br />
                        주일에 뵙기를 소망합니다.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            to="/church/contact"
                            className="inline-flex items-center px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 transition-all duration-300 font-light tracking-wide"
                        >
                            오시는 길
                            <svg
                                className="w-5 h-5 ml-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </Link>

                        <Link
                            to="/"
                            className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-slate-900 transition-all duration-300 font-light tracking-wide"
                        >홈으로
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}