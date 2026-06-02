import { Link } from 'react-router-dom'

const SocialPendingPage = () => (
  <section className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 py-24 sm:py-32">
    <div className="max-w-md w-full">
      <div className="bg-white p-5 sm:p-8 md:p-10 shadow-sm text-center">

        {/* 아이콘 */}
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-light text-slate-900 mb-4">소셜 로그인 승인 대기 중</h1>

        <div className="text-slate-600 mb-8 space-y-3">
          <p>회원가입 신청이 접수되었습니다.</p>
          <p className="text-sm">관리자 승인 후 로그인이 가능합니다.</p>
          <p className="text-sm text-slate-500">승인 처리는 영업일 기준 1~2일 정도 소요됩니다.</p>
        </div>

        <div className="space-y-3">
          <Link to="/"
            className="block w-full py-3 bg-slate-900 text-white hover:bg-slate-800 transition font-medium">
            홈으로 이동
          </Link>
          <Link to="/login"
            className="block w-full py-3 border-2 border-slate-300 text-slate-700 hover:border-slate-900 transition font-medium">
            로그인 페이지로
          </Link>
        </div>

      </div>
    </div>
  </section>
)

export default SocialPendingPage
