import PageHero from '@/components/ui/PageHero'

/* ── 예배 카드 ──────────────────────────────────────────────────────── */
const WorshipCard = ({ eyebrow, title, items, accent = 'border-slate-200' }) => (
  <div className={`bg-white border-t-4 ${accent} shadow-sm p-12 md:p-16`}>
    <p className="text-sm font-medium tracking-[0.25em] uppercase text-eyebrow mb-2">{eyebrow}</p>
    <h3 className="text-3xl font-light text-slate-900 mb-8">{title}</h3>
    <table className="w-full">
      <tbody>
        {items.map(({ label, time, note, place }) => (
          <tr key={label} className="border-b border-slate-100 last:border-0">
            <td className="py-4 text-slate-700 font-medium text-2xl">{label}</td>
            <td className="py-4 text-right">
              <span className="text-slate-900 font-semibold text-xl tabular-nums">{time}</span>
              {note && <div className="text-sm text-slate-400 mt-0.5">{note}</div>}
            </td>
            <td className="py-4 pl-4 text-right w-20">
              {place && (
                <span className="text-sm text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded whitespace-nowrap">
                  {place}
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

/* ── 메인 ──────────────────────────────────────────────────────────── */
export default function WorshipGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHero
        eyebrow="Worship"
        title="예배 안내"
        subtitle="하나님께 드리는 예배 시간을 안내합니다"
      />

      {/* ── 주요 예배 ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">

          {/* 섹션 타이틀 */}
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] text-eyebrow uppercase mb-3">Main Worship</p>
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-4">주요 예배</h2>
            <div className="h-px w-12 bg-slate-300 mx-auto" />
          </div>

          <div className="grid min-[1080px]:grid-cols-2 gap-6">

            {/* 주일예배 */}
            <WorshipCard
              eyebrow="Sunday Service"
              title="주일예배"
              accent="border-slate-900"
              items={[
                { label: '1부 예배', time: '오전 09:00', place: '본당' },
                { label: '2부 예배', time: '오전 11:00', place: '본당' },
                { label: '오후 예배', time: '오후 15:00', note: '찬양 14:40', place: '본당' },
              ]}
            />

            {/* 주중 예배 */}
            <WorshipCard
              eyebrow="Weekday Service"
              title="주중 예배"
              accent="border-slate-400"
              items={[
                { label: '수요예배',   time: '수요일 20:00', place: '본당' },
                { label: '금요기도회', time: '금요일 21:00', place: '본당' },
                { label: '새벽기도회', time: '매일 05:30',   place: '101호' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── 구분선 ── */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-slate-200" />
      </div>

      {/* ── 기관별 예배 ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] text-eyebrow uppercase mb-3">Department Service</p>
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-4">주일 기관별 예배</h2>
            <div className="h-px w-12 bg-slate-300 mx-auto" />
          </div>

          <div className="bg-white shadow-sm border border-slate-100">
            {[
              { label: '태영아부',   time: '13:30', place: '204호' },
              { label: '유아유치부', time: '11:00', place: '204호' },
              { label: '초등부',     time: '09:00', place: '206호' },
              { label: '중고등부',   time: '10:30', place: '205호' },
              { label: '대청부',     time: '13:00', place: '교육관 3층' },
              { label: '다민족부',   time: '13:00', place: '206호' },
              { label: '새가족부',   time: '10:00', place: '101호' },
              { label: '치유부',     time: '13:10', place: '101호' },
            ].map(({ label, time, place }, i) => (
              <div
                key={label}
                className={`flex items-center justify-between px-8 py-5 ${
                  i !== 0 ? 'border-t border-slate-100' : ''
                } hover:bg-slate-50 transition`}
              >
                <span className="text-slate-700 font-medium text-2xl">{label}</span>
                <div className="flex items-center gap-4">
                  <span className="text-slate-900 font-semibold text-xl tabular-nums">{time}</span>
                  <span className="text-sm text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1 rounded">
                    {place}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 구분선 ── */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-slate-200" />
      </div>

      {/* ── 찬양대 & 특별 모임 ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">

          {/* 찬양대 */}
          <div>
            <p className="text-sm tracking-[0.3em] text-eyebrow uppercase mb-3">Choir</p>
            <h2 className="text-3xl font-light text-slate-900 mb-8">찬양대</h2>
            <ul className="space-y-2">
              {[
                { service: '1부 예배',  name: '원니스' },
                { service: '2부 예배',  name: '할렐루야' },
                { service: '오후 예배', name: '미가엘 · 임마누엘' },
                { service: '수요 예배', name: '주영광' },
              ].map(({ service, name }) => (
                <li key={service} className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0">
                  <span className="text-base text-slate-500 w-28 flex-shrink-0">{service}</span>
                  <span className="text-slate-900 font-medium text-lg">{name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 특별 모임 */}
          <div>
            <p className="text-sm tracking-[0.3em] text-eyebrow uppercase mb-3">Special Meeting</p>
            <h2 className="text-3xl font-light text-slate-900 mb-8">특별 모임</h2>
            <ul className="space-y-1">
              {[
                '산업선교',
                '상담치유',
                '교정전도부',
                '벧엘기도조',
                '금요전도학교',
              ].map((name) => (
                <li key={name} className="flex items-center gap-3 py-4 border-b border-slate-100 last:border-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                  <span className="text-slate-700 text-lg">{name}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base text-slate-400 leading-relaxed">
              각 모임은 정해진 시간과 장소에서 진행됩니다.<br />
              자세한 내용은 교회 사무실로 문의해주세요.
            </p>
          </div>

        </div>
      </section>

    </div>
  )
}
