import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminApplicationCategories,
  createApplicationCategory,
  updateApplicationCategory,
  toggleApplicationCategory,
} from '@/api/applications'

const INITIAL_FORM = { name: '', description: '', sortOrder: 0 }

const AdminApplicationCategoryPage = () => {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const [form,     setForm]     = useState(INITIAL_FORM)
  const [editId,   setEditId]   = useState(null)
  const [errors,   setErrors]   = useState({})

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin', 'application-categories'],
    queryFn:  getAdminApplicationCategories,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'application-categories'] })

  const createMutation = useMutation({
    mutationFn: createApplicationCategory,
    onSuccess:  () => { invalidate(); setForm(INITIAL_FORM) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateApplicationCategory(id, body),
    onSuccess:  () => { invalidate(); setEditId(null); setForm(INITIAL_FORM) },
  })

  const toggleMutation = useMutation({
    mutationFn: toggleApplicationCategory,
    onSuccess:  invalidate,
  })

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = '카테고리 이름을 입력해주세요'
    return errs
  }

  const handleSubmit = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    const body = { name: form.name, description: form.description, sortOrder: Number(form.sortOrder) }
    if (editId) {
      updateMutation.mutate({ id: editId, body })
    } else {
      createMutation.mutate(body)
    }
  }

  const handleEdit = (category) => {
    setEditId(category.id)
    setForm({ name: category.name, description: category.description ?? '', sortOrder: category.sortOrder })
    setErrors({})
  }

  const handleCancelEdit = () => {
    setEditId(null)
    setForm(INITIAL_FORM)
    setErrors({})
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="h-full overflow-y-auto p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/applications')} className="text-gray-400 hover:text-gray-600 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">카테고리 관리</h1>
      </div>

      {/* 등록/수정 폼 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          {editId ? '카테고리 수정' : '카테고리 추가'}
        </h2>
        <div className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="카테고리 이름 (예: 차량 신청)"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <input
            type="text"
            placeholder="설명 (선택)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="정렬 순서"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isPending ? '저장 중...' : editId ? '수정 완료' : '추가'}
          </button>
          {editId && (
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
            >
              취소
            </button>
          )}
        </div>
      </div>

      {/* 카테고리 목록 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-gray-400">불러오는 중...</div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">등록된 카테고리가 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
                <th className="px-4 py-3 text-left font-medium">순서</th>
                <th className="px-4 py-3 text-left font-medium">이름</th>
                <th className="px-4 py-3 text-left font-medium">설명</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-500">{c.sortOrder}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.description ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(c)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => toggleMutation.mutate(c.id)}
                        disabled={toggleMutation.isPending}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        {c.isActive ? '비활성화' : '활성화'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminApplicationCategoryPage
