import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const PROVIDER_INFO = {
  kakao: {
    label: '카카오',
    oauthUrl: '/oauth2/authorization/kakao',
    color: '#FEE500',
    textColor: '#191919',
    icon: (
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3C6.48 3 2 6.58 2 11c0 2.78 1.83 5.23 4.58 6.81-.2.73-.75 2.81-.86 3.26-.14.57.21.56.44.41.18-.13 2.96-2.02 3.43-2.34.47.07.95.11 1.44.11 5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
      </svg>
    ),
  },
  naver: {
    label: '네이버',
    oauthUrl: '/oauth2/authorization/naver',
    color: '#03C75A',
    textColor: '#FFFFFF',
    icon: (
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
      </svg>
    ),
  },
}

const SocialRegisterTypePage = () => {
  const { provider } = useParams()
  const navigate = useNavigate()
  const info = PROVIDER_INFO[provider]

  useEffect(() => {
    if (!info) navigate('/register')
  }, [info, navigate])

  if (!info) return null

  const handleSelect = (userType) => {
    sessionStorage.setItem('social_register_user_type', userType)
    window.location.href = info.oauthUrl
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 py-24 sm:py-32">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          {/* 소셜 제공자 표시 */}
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm font-medium rounded-full"
            style={{ backgroundColor: info.color, color: info.textColor }}>
            {info.icon}
            {info.label}로 가입하기
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">교인 구분 선택</h1>
          <p className="text-slate-600 font-light">해당하는 교인 구분을 선택해주세요</p>
        </div>

        <div className="bg-white p-5 sm:p-8 md:p-10 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => handleSelect('REGISTERED')}
              className="p-8 border-2 border-slate-300 hover:border-slate-900 transition text-center group"
            >
              <div className="text-2xl mb-3 font-light text-slate-900">등록교인</div>
              <div className="text-sm text-slate-500 mb-4">그리스도 사랑교회에<br/>등록된 교인</div>
              <div className="text-xs text-slate-400">• 교인 정보 확인<br/>• 모든 교회 서비스 이용</div>
            </button>
            <button
              type="button"
              onClick={() => handleSelect('UNREGISTERED')}
              className="p-8 border-2 border-slate-300 hover:border-slate-900 transition text-center group"
            >
              <div className="text-2xl mb-3 font-light text-slate-900">미등록교인</div>
              <div className="text-sm text-slate-500 mb-4">방문자 및<br/>새가족</div>
              <div className="text-xs text-slate-400">• 간편 가입<br/>• 기본 정보만 입력</div>
            </button>
          </div>

          <div className="text-center mt-8">
            <Link to="/register" className="text-sm text-slate-400 hover:text-slate-600">
              ← 이전으로
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SocialRegisterTypePage
