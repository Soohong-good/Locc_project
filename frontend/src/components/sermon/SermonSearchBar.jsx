import { useState } from 'react'

/**
 * 설교 검색 바
 */
const SermonSearchBar = ({ keyword = '', preacher = '', onSearch }) => {
  const [localKeyword, setLocalKeyword] = useState(keyword)
  const [localPreacher, setLocalPreacher] = useState(preacher)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch({ keyword: localKeyword, preacher: localPreacher })
  }

  const handleReset = () => {
    setLocalKeyword('')
    setLocalPreacher('')
    onSearch({ keyword: '', preacher: '' })
  }

  return (
    <section className="py-8 bg-white px-6 border-b border-slate-200">
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={localKeyword}
            onChange={(e) => setLocalKeyword(e.target.value)}
            placeholder="설교 제목, 본문 검색"
            className="flex-1 px-4 py-3 border border-slate-300 focus:border-slate-900 focus:outline-none transition text-base"
          />
          <input
            type="text"
            value={localPreacher}
            onChange={(e) => setLocalPreacher(e.target.value)}
            placeholder="설교자 검색"
            className="md:w-48 px-4 py-3 border border-slate-300 focus:border-slate-900 focus:outline-none transition text-base"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 transition font-medium"
          >
            검색
          </button>
          {(localKeyword || localPreacher) && (
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border border-slate-300 text-slate-600 hover:bg-slate-50 transition font-medium"
            >
              초기화
            </button>
          )}
        </form>
      </div>
    </section>
  )
}

export default SermonSearchBar
