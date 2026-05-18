import { useEffect } from 'react'
import toast from '@/utils/toast'

const SCRIPT_URL = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
const SCRIPT_ID  = 'daum-postcode-script'

/**
 * 카카오(Daum) 주소 검색 API 훅
 * - 컴포넌트 마운트 시 스크립트 1회 로드
 * - open() 호출 시 팝업 열림
 *
 * @param {(address: string) => void} onComplete - 주소 선택 완료 콜백
 * @returns {{ open: () => void }}
 */
export default function useDaumPostcode(onComplete) {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return // 이미 로드됨
    const script = document.createElement('script')
    script.id  = SCRIPT_ID
    script.src = SCRIPT_URL
    script.async = true
    document.head.appendChild(script)
  }, [])

  const open = () => {
    if (!window.daum?.Postcode) {
      toast.info('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        onComplete(data.roadAddress)
      },
    }).open()
  }

  return { open }
}
