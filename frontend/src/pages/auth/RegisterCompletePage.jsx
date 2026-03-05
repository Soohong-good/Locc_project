import { Link, useLocation } from 'react-router-dom'

const RegisterCompletePage = () => {
  const location = useLocation()
  const email = location.state?.email ?? ''

  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-32">
      <div className="max-w-2xl w-full">
        <div className="bg-white p-10 md:p-16 shadow-sm text-center">
          {/* 성공 아이콘 */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-light text-slate-900 mb-6">
            회원가입 신청이<br />완료되었습니다
          </h1>

          <div className="space-y-6 mb-10 text-slate-600 leading-relaxed">
            <p className="text-lg">회원가입 신청이 정상적으로 접수되었습니다.</p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 text-left">
              <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                안내사항
              </h3>
              <ul className="space-y-2 text-sm text-blue-900">
                {[
                  '관리자가 회원정보를 검토한 후 승인합니다.',
                  '승인 완료 후 로그인이 가능합니다.',
                  '승인 처리는 영업일 기준 1-2일 정도 소요됩니다.',
                  '문의사항은 교회 연락처로 문의해주세요.',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {email && (
              <p className="text-sm text-slate-500">
                신청하신 이메일: <strong className="text-slate-900">{email}</strong>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 transition font-medium"
            >
              홈으로
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-slate-300 text-slate-700 hover:border-slate-900 transition font-medium"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RegisterCompletePage
