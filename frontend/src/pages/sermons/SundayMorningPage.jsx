import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSundayMorningData } from '@/api/sermons'
import useAuthStore from '@/stores/authStore'
import useSermonCrud from '@/hooks/useSermonCrud'
import SermonCard from '@/components/sermon/SermonCard'
import SermonSearchBar from '@/components/sermon/SermonSearchBar'
import SermonPagination from '@/components/sermon/SermonPagination'
import YoutubeLatestSection from '@/components/sermon/YoutubeLatestSection'
import SermonModal from '@/components/sermon/SermonModal'
import SermonDeleteModal from '@/components/sermon/SermonDeleteModal'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const SERVICE_NUMBER_OPTIONS = [
  { value: 1, label: '1부 예배' },
  { value: 2, label: '2부 예배' },
]

const SundayMorningPage = () => {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ROLE_ADMIN'

  const [serviceNumber, setServiceNumber] = useState(1)
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [preacher, setPreacher] = useState('')

  const queryKey = ['sermons', 'sunday-morning', serviceNumber, page, keyword, preacher]

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getSundayMorningData({ serviceNumber, page, size: 9, keyword, preacher }),
  })

  const crud = useSermonCrud([['sermons', 'sunday-morning']])

  const handleTabChange = (num) => {
    setServiceNumber(num)
    setPage(0)
  }

  const handleSearch = (kw, pr) => {
    setKeyword(kw)
    setPreacher(pr)
    setPage(0)
  }

  const youtubeTitle = serviceNumber === 1 ? '주일오전 1부 최신 영상' : '주일오전 2부 최신 영상'

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-slate-900 text-white px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs tracking-[0.3em] text-slate-400 uppercase mb-3">
                Sunday Morning Worship
              </p>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">주일오전예배</h1>
              <p className="text-lg text-slate-300 font-light">하나님 말씀을 들으시고 은혜받으세요</p>
            </div>
            {isAdmin && (
              <button
                onClick={crud.openCreate}
                className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 transition font-medium"
              >
                + 새 설교
              </button>
            )}
          </div>

          {/* 1부 / 2부 탭 */}
          <div className="flex gap-4 mt-8">
            {SERVICE_NUMBER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleTabChange(opt.value)}
                className={`px-6 py-3 transition font-medium ${
                  serviceNumber === opt.value
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 검색 */}
      <SermonSearchBar onSearch={handleSearch} />

      {/* YouTube / latestSermon */}
      {!isLoading && data && (
        <YoutubeLatestSection
          youtubeVideos={data.youtubeVideos}
          latestSermon={data.latestSermon?.id ? data.latestSermon : null}
          title={youtubeTitle}
        />
      )}

      {/* 설교 목록 */}
      <section className="py-16 bg-slate-50 px-6">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data?.sermons?.length > 0 ? (
                  data.sermons.map((sermon) => (
                    <SermonCard
                      key={sermon.id}
                      sermon={sermon}
                      isAdmin={isAdmin}
                      onEdit={crud.openEdit}
                      onDelete={crud.setDeleteTarget}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-slate-400 font-light text-lg">등록된 설교가 없습니다.</p>
                  </div>
                )}
              </div>

              <SermonPagination
                currentPage={page}
                totalPages={data?.totalPages ?? 0}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </section>

      {/* 등록/수정 모달 */}
      <SermonModal
        isOpen={crud.isModalOpen}
        onClose={crud.closeModal}
        onSave={crud.handleSave}
        isSaving={crud.isSaving}
        editTarget={crud.editTarget}
        fixedCategory="주일오전"
        serviceNumberOptions={SERVICE_NUMBER_OPTIONS}
        defaultServiceNumber={serviceNumber}
      />

      {/* 삭제 모달 */}
      <SermonDeleteModal
        target={crud.deleteTarget}
        onCancel={() => crud.setDeleteTarget(null)}
        onConfirm={crud.handleDeleteConfirm}
        isDeleting={crud.isDeleting}
      />
    </>
  )
}

export default SundayMorningPage
