import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSundayAfternoonData } from '@/api/sermons'
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

const SundayAfternoonPage = () => {
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [preacher, setPreacher] = useState('')
  const { isAdminOrOperator: isAdminOrOperatorFn, isAdmin: isAdminFn, getUserId } = useAuthStore()
  const canWrite = isAdminOrOperatorFn()
  const isAdmin = isAdminFn()
  const userId = getUserId()

  const queryKey = ['sermons', 'sunday-afternoon', page, keyword, preacher]

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getSundayAfternoonData({ page, keyword, preacher }),
    placeholderData: (prev) => prev,
  })

  const crud = useSermonCrud([['sermons', 'sunday-afternoon', page, keyword, preacher]])

  const handleSearch = (kw, pr) => {
    setKeyword(kw)
    setPreacher(pr)
    setPage(0)
  }

  return (
    <>
      <PageHero eyebrow="Sunday Afternoon Service" title="주일오후 예배"
        bgImage="/images/bg-worship.jpg">
        {canWrite && (
          <Button variant="secondary" size="sm" onClick={crud.openCreate}
            className="border-white text-white hover:bg-white hover:text-slate-900">
            + 설교 등록
          </Button>
        )}
      </PageHero>

      {/* YouTube 최신 섹션 */}
      {data && (
        <YoutubeLatestSection
          youtubeVideos={data.youtubeVideos}
          latestSermon={data.latestSermon?.id ? data.latestSermon : null}
          title="주일오후 최신 설교"
        />
      )}

      {/* 검색 */}
      <SermonSearchBar
        initialKeyword={keyword}
        initialPreacher={preacher}
        onSearch={handleSearch}
      />

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
        fixedCategory="주일오후"
        serviceNumberOptions={null}
        defaultServiceNumber={null}
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

export default SundayAfternoonPage
