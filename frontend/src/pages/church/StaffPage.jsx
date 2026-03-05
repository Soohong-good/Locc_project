import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

const fetchStaffByCategory = async (category) => {
  const res = await fetch(`/api/staff/category/${category}`)
  if (!res.ok) throw new Error('스태프 정보를 불러올 수 없습니다.')
  const data = await res.json()
  return data.data ?? []
}

const StaffCard = ({ staff }) => (
  <div className="bg-white border border-slate-100 hover:shadow-md transition-shadow duration-300">
    {/* 이미지 영역 */}
    <div className="w-full aspect-[3/4] bg-slate-100 overflow-hidden">
      {staff.imagePath ? (
        <img
          src={staff.imagePath}
          alt={staff.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-20 h-20 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
    {/* 정보 영역 */}
    <div className="p-6">
      <p className="text-xs tracking-[0.2em] text-slate-400 uppercase mb-2">
        {staff.isSeniorPastor ? 'Senior Pastor' : staff.categoryEnglish}
      </p>
      <h3 className="text-xl font-medium text-slate-900 mb-1">{staff.name}</h3>
      <p className="text-sm text-slate-500 mb-3">{staff.englishName}</p>
      <div className="h-px w-8 bg-slate-300 mb-3" />
      <p className="text-sm font-medium text-slate-700 mb-2">
        {staff.customPosition || (staff.isSeniorPastor ? '담임목사' : { PASTOR: '목사', EVANGELIST: '전도사', OTHER: '' }[staff.position] || '')}
      </p>
      {staff.responsibility && (
        <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
          {staff.responsibility}
        </p>
      )}
    </div>
  </div>
)

const LoadingGrid = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="w-full aspect-[3/4] bg-slate-200 mb-4" />
        <div className="p-4 space-y-2">
          <div className="h-3 w-16 bg-slate-200 rounded" />
          <div className="h-5 w-24 bg-slate-200 rounded" />
          <div className="h-3 w-20 bg-slate-200 rounded" />
        </div>
      </div>
    ))}
  </div>
)

export default function StaffPage() {
  const [activeCategory, setActiveCategory] = useState('MINISTER')

  const { data: staffList = [], isLoading, isError } = useQuery({
    queryKey: ['staff', activeCategory],
    queryFn: () => fetchStaffByCategory(activeCategory),
    staleTime: 1000 * 60 * 5,
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 pb-16 bg-slate-50 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] text-slate-400 uppercase mb-3">Our Staff</p>
            <h1 className="text-5xl md:text-6xl font-light text-slate-900 tracking-tight mb-6">
              섬기는 분들
            </h1>
            <div className="h-px w-16 bg-slate-300" />
          </div>
          <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed">
            그리스도 사랑교회를 섬기는 주의 종들을 소개합니다
          </p>
        </div>
      </section>

      {/* 카테고리 탭 */}
      <section className="py-8 bg-white px-6 border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-4 justify-center">
            {[
              { key: 'MINISTER', label: '교역자' },
              { key: 'EMPLOYEE', label: '교회 직원' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-8 py-3 text-lg font-medium transition-all border-b-2 ${
                  activeCategory === key
                    ? 'text-slate-900 border-slate-900'
                    : 'text-slate-400 border-transparent hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 콘텐츠 */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {isLoading && <LoadingGrid />}
          {isError && (
            <div className="text-center py-20 text-slate-500">
              정보를 불러오는 중 오류가 발생했습니다.
            </div>
          )}
          {!isLoading && !isError && staffList.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              등록된 정보가 없습니다.
            </div>
          )}
          {!isLoading && !isError && staffList.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {staffList.map((staff) => (
                <StaffCard key={staff.id} staff={staff} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-900 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
            함께 예배하기 원하십니까?
          </h2>
          <p className="text-lg md:text-xl text-slate-300 mb-12 font-light leading-[1.8]">
            그리스도 사랑교회는 여러분을 환영합니다.<br />
            언제든지 편하게 방문하시거나 연락주시기 바랍니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/church/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 transition-all duration-300 font-light tracking-wide"
            >
              오시는 길
            </Link>
            <Link
              to="/"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-slate-900 transition-all duration-300 font-light tracking-wide"
            >
              홈으로
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
