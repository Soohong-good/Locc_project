import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle, PaperPlaneTilt } from '@phosphor-icons/react'
import { submitHelpRequest } from '@/api/helpRequests'
import toast from '@/utils/toast'

const HelpRequestPage = () => {
  const navigate = useNavigate()
  const [form, setForm]   = useState({ name: '', phone: '', email: '', content: '' })
  const [errors, setErrors] = useState({})
  const [done, setDone]   = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const mutation = useMutation({
    mutationFn: () => submitHelpRequest(form),
    onSuccess: () => setDone(true),
    onError: (e) => toast.error(e?.response?.data?.message ?? '요청 접수에 실패했습니다.'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = {}
    if (!form.name.trim())    next.name = '이름을 입력해주세요.'
    if (!form.phone.trim())   next.phone = '전화번호를 입력해주세요.'
    if (!form.email.trim())   next.email = '이메일을 입력해주세요.'
    if (!form.content.trim()) next.content = '도움이 필요한 내용을 입력해주세요.'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    mutation.mutate()
  }

  if (done) {
    return (
      <main className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] min-h-screen pt-20 bg-[#FAF9F6] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center py-16">
          <CheckCircle size={56} weight="fill" className="mx-auto text-[#171717] mb-8" />
          <h1 className="text-2xl font-bold text-[#171717] mb-4 break-keep">요청이 접수되었습니다</h1>
          <p className="text-[#737373] font-light leading-relaxed mb-10 break-keep">
            남겨주신 연락처로 담당자가 확인 후 연락드리겠습니다.
          </p>
          <button
            onClick={() => navigate('/')}
            className="border border-[#171717] bg-[#171717] text-[#FAF9F6] text-xs font-bold tracking-[0.1em] uppercase py-4 px-12 hover:bg-[#2C2C2C] transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-[1600px] mx-auto border-x border-[#E5E5E5] min-h-screen pt-20 bg-[#FAF9F6]">
      <div className="max-w-[640px] mx-auto px-6 py-16 md:py-24">

        {/* 헤더 */}
        <header className="mb-12">
          <div className="font-mono text-[#737373] text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#171717] block" />
            HELP REQUEST
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#171717] leading-[1.3] mb-4 break-keep tracking-tight">
            도움 요청
          </h1>
          <p className="text-[#737373] font-light leading-relaxed break-keep">
            신앙 상담이나 도움이 필요한 내용을 남겨주시면 담당자가 확인 후 연락드리겠습니다.
          </p>
        </header>

        <hr className="border-t border-[#E5E5E5] mb-12" />

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C2C2C]">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="이름을 입력하세요"
              className={`w-full px-4 py-3 bg-white border outline-none transition-all ${
                errors.name ? 'border-red-400' : 'border-[#E5E5E5] focus:border-[#171717]'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C2C2C]">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
              placeholder="010-0000-0000"
              className={`w-full px-4 py-3 bg-white border outline-none transition-all ${
                errors.phone ? 'border-red-400' : 'border-[#E5E5E5] focus:border-[#171717]'
              }`}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C2C2C]">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
              placeholder="example@email.com"
              className={`w-full px-4 py-3 bg-white border outline-none transition-all ${
                errors.email ? 'border-red-400' : 'border-[#E5E5E5] focus:border-[#171717]'
              }`}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C2C2C]">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.content} onChange={(e) => set('content', e.target.value)} rows={6}
              placeholder="도움이 필요한 내용을 자유롭게 작성해주세요"
              className={`w-full px-4 py-3 bg-white border outline-none transition-all resize-none ${
                errors.content ? 'border-red-400' : 'border-[#E5E5E5] focus:border-[#171717]'
              }`}
            />
            {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-3 border border-[#171717] bg-[#171717] text-[#FAF9F6] text-xs font-bold tracking-[0.1em] uppercase py-5 hover:bg-[#2C2C2C] transition-colors disabled:opacity-60"
          >
            <PaperPlaneTilt size={18} />
            {mutation.isPending ? '전송 중...' : '요청 보내기'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default HelpRequestPage
