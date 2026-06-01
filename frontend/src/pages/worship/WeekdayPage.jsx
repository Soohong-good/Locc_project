import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getWeekdayData } from '@/api/sermons'
import useAuthStore from '@/stores/authStore'
import useSermonCrud from '@/hooks/useSermonCrud'
import YoutubeLatestSection from '@/components/sermon/YoutubeLatestSection'
import SermonSearchBar from '@/components/sermon/SermonSearchBar'
import SermonCard from '@/components/sermon/SermonCard'
import SermonPagination from '@/components/sermon/SermonPagination'
import SermonModal from '@/components/sermon/SermonModal'
import SermonDeleteModal from '@/components/sermon/SermonDeleteModal'
import ErrorMessage from '@/components/common/ErrorMessage'
import Button from '@/components/ui/Button'
import PageHero from '@/components/ui/PageHero'
import SkeletonGrid from '@/components/ui/SkeletonCard'

const WEEKDAY_TABS = [
  { value: 'wednesday', label: '수요예배' },
  { value: 'friday', label: '금요기도회' },
]

// 백엔드 serviceNumber 매핑: wednesday=1, friday=2
const SERVICE_NUMBER_OPTIONS = [
  { value: 1, label: '수요예배' },
  { value: 2, label: '금요기도회' },
]

const WeekdayPage = () => {
  const [type, setType] = useState('wednesday')
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [preacher, setPreacher] = useState('')
  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const canWrite = isAdminOrOperatorFn()
  const isAdmin = isAdminFn()
  const userId = getUserId()

  const queryKey = ['sermons', 'weekday', type, page, keyword, preacher]

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getWeekdayData({ type, page, keyword, preacher }),
    placeholderData: (prev) => prev,
  })

  const crud = useSermonCrud([['sermons', 'weekday', type, page, keyword, preacher]])

  const handleTabChange = (val) => {
    setType(val)
    setPage(0)
    setKeyword('')
    setPreacher('')
  }

  const handleSearch = (kw, pr) => {
    setKeyword(kw)
    setPreacher(pr)
    setPage(0)
  }

  const currentLabel = WEEKDAY_TABS.find((t) => t.value === type)?.label ?? ''

  return (
    <>
      <PageHero eyebrow="Weekday Service" title="수요예배·금요기도회"
        bgImage="/images/bg-worship.jpg">
        {canWrite && (
          <Button variant="secondary" size="sm" onClick={crud.openCreate}
            className="border-white text-white hover:bg-white hover:text-slate-900">
            + 설교 등록
          </Button>
        )}
      </PageHero>

      {/* 탭 */}
      <section className="bg-slate-800 px-6 ">
        <div className="max-w-6xl mx-auto flex">
          {WEEKDAY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-8 py-4 text-sm font-medium tracking-wide transition-colors duration-200 relative
                ${type === tab.value ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {tab.label}
              {type === tab.value && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 검색 */}
      <SermonSearchBar
        initialKeyword={keyword}
        initialPreacher={preacher}
        onSearch={handleSearch}
      />

      {/* YouTube 최신 섹션 */}
      {data && (
        <YoutubeLatestSection
          youtubeVideos={data.youtubeVideos}
          latestSermon={data.latestSermon?.id ? data.latestSermon : null}
          title={`${currentLabel} 최신 설교`}
        />
      )}

      {/* 목록 */}
      <section className="py-16 bg-slate-50 px-6">
        <div className="max-w-6xl mx-auto">
          {isLoading && <SkeletonGrid count={6} />}
          {error && <ErrorMessage error={error} fallback="설교 목록을 불러올 수 없습니다." />}
          {data && !isLoading && (
            <>
              {data.sermons.length === 0 ? (
                <p className="text-center text-slate-500 py-20">등록된 설교가 없습니다.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.sermons.map((sermon) => (
                    <SermonCard
                      key={sermon.id}
                      sermon={sermon}
                      isAdmin={isAdmin}
                      canWrite={canWrite}
                      userId={userId}
                      onEdit={crud.openEdit}
                      onDelete={crud.setDeleteTarget}
                      detailBasePath="/worship/sermon"
                    />
                  ))}
                </div>
              )}
              <SermonPagination
                currentPage={data.currentPage}
                totalPages={data.totalPages}
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
        isLoadingDetail={crud.isLoadingDetail}
        editTarget={crud.editTarget}
        fixedCategory="기타예배"
        serviceNumberOptions={SERVICE_NUMBER_OPTIONS}
        defaultServiceNumber={type === 'wednesday' ? 1 : 2}
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

export default WeekdayPage
