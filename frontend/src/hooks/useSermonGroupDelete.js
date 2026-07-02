import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteSermon } from '@/api/sermons'
import toast from '@/utils/toast'

/**
 * 설교 그룹(1부/2부) 삭제 공통 훅
 * - part1/part2를 Promise.allSettled로 병렬 삭제
 * - 일부 실패 시 toast로 알림
 * - invalidateKeys: 성공 후(부분 실패 포함) 무효화할 queryKey 배열
 */
const useSermonGroupDelete = (invalidateKeys = []) => {
  const queryClient = useQueryClient()

  const deleteGroupMutation = useMutation({
    mutationFn: async (group) => {
      const targets = [group.part1, group.part2].filter(Boolean)
      const results = await Promise.allSettled(targets.map((s) => deleteSermon(s.id)))
      const failed = results.filter((r) => r.status === 'rejected').length
      return { total: targets.length, failed }
    },
    // 일부만 삭제됐어도 캐시는 항상 갱신 (DB 상태와 UI 불일치 방지)
    onSettled: () => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
    },
    onSuccess: ({ total, failed }) => {
      if (failed > 0) {
        toast.error(`${total}건 중 ${failed}건 삭제에 실패했습니다. 목록을 확인해주세요.`)
      }
    },
  })

  return deleteGroupMutation
}

export default useSermonGroupDelete
