import { useQuery } from '@tanstack/react-query'
import { getBiblePassage } from '@/api/bible'

/**
 * 설교 성경 본문 섹션
 * - sermon.scripture(예: "고린도후서9:1~15")로 해당 구간을 조회해 절번호+본문 표시
 * - 참조가 없거나 조회 실패 시 아무것도 렌더하지 않음
 * - 겹친 종이(layered paper) 2단 레이아웃으로 표시
 */
export default function BiblePassageSection({ scripture }) {
  const ref = scripture?.trim()

  const { data } = useQuery({
    queryKey: ['bible-passage', ref],
    queryFn: () => getBiblePassage(ref),
    enabled: !!ref,
    staleTime: Infinity,
  })

  if (!data?.verses?.length) return null

  const verses = data.verses
  const mid    = Math.ceil(verses.length / 2)
  const page1  = verses.slice(0, mid)
  const page2  = verses.slice(mid)

  const VerseList = ({ items }) => (
    <div className="space-y-6 text-[#3d3a35] leading-[2.2] text-[15px] break-keep text-justify">
      {items.map((v) => (
        <p key={v.verse}>
          <span className="text-[10px] text-[#7a766e] font-mono font-bold mr-2 align-super">{v.verse}</span>
          {v.text}
        </p>
      ))}
    </div>
  )

  return (
    <section className="py-24 bg-[#faf8f5] px-6 border-t border-[#e6e0d6]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#7a766e] font-mono mb-4 block">
            Scripture
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-[#1a1710] tracking-tight">{ref}</h3>
        </div>

        <div className="relative max-w-[960px] mx-auto">
          {/* 겹친 종이 효과 */}
          <div className="absolute top-3 -left-3 -right-3 bottom-[-12px] border border-[#e6e0d6] bg-[#EAE8E0]" />
          <div className="absolute top-2 -left-2 -right-2 bottom-[-8px] border border-[#e6e0d6] bg-[#F0EEDF]" />
          <div className="absolute top-1 -left-1 -right-1 bottom-[-4px] border border-[#e6e0d6] bg-[#faf8f5]" />

          <div className="relative flex flex-col md:flex-row bg-[#FDFCF9] border border-[#e6e0d6] z-10">
            <div className={`flex-1 p-8 md:p-12 lg:p-16 relative bg-[#FDFCF9] ${page2.length ? 'border-b md:border-b-0 md:border-r border-[#e6e0d6]' : ''}`}>
              <div className="flex justify-between items-center mb-10 pb-4 border-b border-[#e6e0d6]">
                <span className="text-[11px] font-mono text-[#7a766e] tracking-[0.1em] uppercase">{ref}</span>
                {page2.length > 0 && <span className="text-[11px] font-mono text-[#7a766e]">Page 1</span>}
              </div>
              <VerseList items={page1} />
            </div>

            {page2.length > 0 && (
              <div className="flex-1 p-8 md:p-12 lg:p-16 relative bg-[#FDFCF9]">
                <div className="flex justify-between items-center mb-10 pb-4 border-b border-[#e6e0d6]">
                  <span className="text-[11px] font-mono text-[#7a766e] tracking-[0.1em] uppercase">{ref}</span>
                  <span className="text-[11px] font-mono text-[#7a766e]">Page 2</span>
                </div>
                <VerseList items={page2} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
