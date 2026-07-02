import { useEffect, useRef } from 'react'

const CHURCH = {
  lat: 35.871497,
  lng: 128.715387,
  name: '그리스도사랑교회',
  address: '대구광역시 동구 안심로55길 59',
}

const KAKAO_MAP_API_KEY = import.meta.env.VITE_KAKAO_MAP_KEY

export default function KakaoMap({ className = '' }) {
  const mapRef = useRef(null)
  const isLoaded = useRef(false)

  const overlayContent = `
    <div style="position:relative;">
      <div style="padding:15px 20px;background:white;border-radius:8px;
        box-shadow:0 4px 12px rgba(0,0,0,0.15);min-width:220px;position:relative;">
        <div style="font-size:16px;font-weight:600;color:#1e293b;margin-bottom:8px;">
          ${CHURCH.name}
        </div>
        <div style="font-size:13px;color:#64748b;line-height:1.5;margin-bottom:10px;">
          ${CHURCH.address}
        </div>
        <a href="https://map.kakao.com/link/to/${CHURCH.name},${CHURCH.lat},${CHURCH.lng}"
           target="_blank"
           style="display:inline-block;padding:6px 12px;background:#0f172a;color:white;
                  text-decoration:none;border-radius:4px;font-size:12px;font-weight:500;"
           onmouseover="this.style.background='#334155'"
           onmouseout="this.style.background='#0f172a'">
          길찾기
        </a>
      </div>
      <div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);
        width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;
        border-top:8px solid white;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.1));"></div>
    </div>
  `

  useEffect(() => {
    if (isLoaded.current) return

    const initMap = () => {
      if (!window.kakao?.maps) return
      if (!mapRef.current) return

      isLoaded.current = true
      const { kakao } = window
      const coords = new kakao.maps.LatLng(CHURCH.lat, CHURCH.lng)

      const map = new kakao.maps.Map(mapRef.current, {
        center: coords,
        level: 4,
      })

      new kakao.maps.CustomOverlay({
        map,
        position: coords,
        content: overlayContent,
        yAnchor: 1,
      })
    }

    if (window.kakao?.maps) {
      window.kakao.maps.load(initMap)
      return
    }

    if (!KAKAO_MAP_API_KEY) {
      console.warn('VITE_KAKAO_MAP_KEY 환경변수가 설정되지 않았습니다.')
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false`
    script.async = true
    script.onload = () => window.kakao.maps.load(initMap)
    document.head.appendChild(script)
  }, [])

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapRef} style={{ width:'100%', height:'100%' }} />
      {!KAKAO_MAP_API_KEY && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <p className="text-slate-400 text-base font-light">지도를 불러올 수 없습니다</p>
        </div>
      )}
    </div>
  )
}
