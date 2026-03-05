import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSermon, updateSermon, deleteSermon } from '@/api/sermons'

/**
 * 설교 CRUD 공통 훅
 * - 등록/수정/삭제 mutation + 모달 상태 관리
 * - invalidateKeys: 성공 후 무효화할 queryKey 배열
 */
const useSermonCrud = (invalidateKeys = []) => {
  const queryClient = useQueryClient()
  const [editTarget, setEditTarget] = useState(null)   // null = 등록, object = 수정
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const invalidate = () => {
    invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
  }

  const createMutation = useMutation({
    mutationFn: createSermon,
    onSuccess: () => { invalidate(); setIsModalOpen(false) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => updateSermon({ id, formData }),
    onSuccess: () => { invalidate(); setIsModalOpen(false) },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSermon,
    onSuccess: () => { invalidate(); setDeleteTarget(null) },
  })

  const openCreate = () => {
    setEditTarget(null)
    setIsModalOpen(true)
  }

  const openEdit = (sermon) => {
    setEditTarget(sermon)
    setIsModalOpen(true)
  }

  const closeModal = () => setIsModalOpen(false)

  const handleSave = (formData) => {
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
  }

  return {
    // 모달 상태
    isModalOpen,
    editTarget,
    deleteTarget,
    // 액션
    openCreate,
    openEdit,
    closeModal,
    setDeleteTarget,
    handleSave,
    handleDeleteConfirm,
    // 로딩
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export default useSermonCrud
