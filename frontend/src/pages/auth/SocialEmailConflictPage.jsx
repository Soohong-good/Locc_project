import { Link } from 'react-router-dom'

/**
 * 소셜 로그인 이메일 충돌 안내 페이지
 *
 * 발생 케이스:
 *   - 이미 일반(이메일/비밀번호)로 가입된 이메일로 소셜 로그인 시도 시
 *
 * 안내 흐름:
 *   1. 기존 일반 로그인으로 로그인
 *   2. 마이페이지 → 소셜 계정 연결
 */
const SocialEmailConflictPage = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 py-24 sm:py-32">
      <div className="max-w-md w-full">

        {/* 아이콘 */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-8 md:p-10 border border-slate-200 shadow-sm text-center">
          <h1 className="text-2xl font-light text-slate-900 mb-3">이미 가입된 이메일입니다</h1>
          <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">
            소셜 계정과 동일한 이메일로 이미 일반 회원가입이 되어 있습니다.<br />
            기존 계정으로 로그인한 후 마이페이지에서 소셜 계정을 연결할 수 있습니다.
          </p>

          {/* 단계 안내 */}
          <div className="bg-slate-50 rounded-lg p-5 text-left mb-8 space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <p className="text-sm text-slate-600 font-light">이메일과 비밀번호로 기존 계정에 로그인합니다.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <p className="text-sm text-slate-600 font-light">마이페이지 → <strong className="font-medium">소셜 계정 관리</strong>에서 소셜 계정을 연결합니다.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <p className="text-sm text-slate-600 font-light">이후부터는 소셜 로그인으로도 이용하실 수 있습니다.</p>
            </div>
          </div>

          {/* 버튼 */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full py-3 px-4 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors text-center"
            >
              이메일로 로그인하기
            </Link>
            <Link
              to="/"
              className="block w-full py-3 px-4 border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors text-center"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}

export default SocialEmailConflictPage
