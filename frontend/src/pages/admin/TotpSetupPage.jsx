import { useState } from 'react'
import client from '@/api/client'
import Button from '@/components/ui/Button'

const TotpSetupPage = () => {
  const [qrCode, setQrCode] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('init') // init | qr | done
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSetup = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await client.post('/api/auth/totp/setup')
      setQrCode(res.data?.data?.qrCode)
      setStep('qr')
    } catch (e) {
      setError(e?.response?.data?.message || 'QR 코드 발급에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleEnable = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await client.post('/api/auth/totp/enable', { code })
      setStep('done')
    } catch (e) {
      setError(e?.response?.data?.message || '인증 코드가 올바르지 않습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto max-w-md mx-auto py-16 px-6">
      <h1 className="text-2xl font-light text-slate-900 mb-2">2차 인증 설정</h1>
      <p className="text-sm text-slate-500 mb-8">Google Authenticator 앱으로 2차 인증을 설정합니다.</p>

      {step === 'init' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            스마트폰에 <strong>Google Authenticator</strong> 앱을 설치한 후 아래 버튼을 클릭하세요.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button onClick={handleSetup} isLoading={loading} className="w-full justify-center py-3">
            QR 코드 발급
          </Button>
        </div>
      )}

      {step === 'qr' && (
        <div className="space-y-6">
          <div>
            <p className="text-sm text-slate-600 mb-4">
              Google Authenticator 앱을 열고 아래 QR 코드를 스캔하세요.
            </p>
            {qrCode && (
              <img src={qrCode} alt="TOTP QR Code" className="w-48 h-48 border border-slate-200" />
            )}
          </div>

          <form onSubmit={handleEnable} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide uppercase">
                앱에 표시된 6자리 코드 입력
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                className="w-full px-4 py-3 text-sm border bg-slate-50 focus:bg-white focus:outline-none border-slate-200 focus:border-slate-900 text-center text-2xl tracking-widest"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" isLoading={loading} className="w-full justify-center py-3">
              인증 활성화
            </Button>
          </form>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center space-y-4">
          <div className="text-4xl">✓</div>
          <p className="text-lg font-medium text-slate-900">2차 인증이 활성화되었습니다.</p>
          <p className="text-sm text-slate-500">다음 로그인부터 Google Authenticator 코드가 필요합니다.</p>
        </div>
      )}
    </div>
  )
}

export default TotpSetupPage
