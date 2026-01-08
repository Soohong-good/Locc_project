/**
 * 카카오맵 초기화 공통 모듈
 * 
 * 의존성: Kakao Maps SDK
 */

// 교회 위치 정보
const CHURCH_LOCATION = {
    name: '그리스도 사랑교회',
    lat: 35.871497,
    lng: 128.715387,
    address: '대구광역시 동구 안심로55길 59',
    phone: '053-962-8948'
};

/**
 * 카카오 지도 초기화
 * @param {string} containerId - 지도를 표시할 div 요소의 ID
 * @param {number} level - 지도 확대 레벨 (기본값: 3)
 */
function initKakaoMap(containerId = 'map', level = 3) {
    // Kakao Maps API가 로드되지 않았으면 대기
    if (typeof kakao === 'undefined' || !kakao.maps) {
        console.warn('Kakao Maps API not loaded yet, retrying...');
        setTimeout(() => initKakaoMap(containerId, level), 100);
        return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Map container with id '${containerId}' not found`);
        return;
    }

    // 지도 옵션
    const options = {
        center: new kakao.maps.LatLng(CHURCH_LOCATION.lat, CHURCH_LOCATION.lng),
        level: level
    };

    // 지도 생성
    const map = new kakao.maps.Map(container, options);

    // 교회 위치
    const churchPosition = new kakao.maps.LatLng(CHURCH_LOCATION.lat, CHURCH_LOCATION.lng);

    // 커스텀 오버레이 내용
    const overlayContent = createOverlayContent();

    // 커스텀 오버레이 생성 (마커 없이)
    const customOverlay = new kakao.maps.CustomOverlay({
        map: map,
        position: churchPosition,
        content: overlayContent,
        yAnchor: 1  // 오버레이 하단이 교회 위치에 오도록
    });

    console.log('Kakao Map initialized successfully');
}

/**
 * 커스텀 오버레이 HTML 생성
 * @returns {string} 오버레이 HTML 문자열
 */
function createOverlayContent() {
    return `
        <div style="position: relative;">
            <div style="
                padding: 15px 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                min-width: 220px;
                position: relative;
            ">
                <div style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">
                    ${CHURCH_LOCATION.name}
                </div>
                <div style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 10px;">
                    ${CHURCH_LOCATION.address}
                </div>
                <a href="https://map.kakao.com/link/to/${CHURCH_LOCATION.name},${CHURCH_LOCATION.lat},${CHURCH_LOCATION.lng}"
                   target="_blank"
                   style="
                       display: inline-block;
                       padding: 6px 12px;
                       background: #0f172a;
                       color: white;
                       text-decoration: none;
                       border-radius: 4px;
                       font-size: 12px;
                       font-weight: 500;
                       transition: background 0.2s;
                   "
                   onmouseover="this.style.background='#334155'"
                   onmouseout="this.style.background='#0f172a'">
                    길찾기
                </a>
            </div>
            <div style="
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 8px solid white;
                filter: drop-shadow(0 2px 3px rgba(0,0,0,0.1));
            "></div>
        </div>
    `;
}

// DOM 로드 완료 후 자동 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const mapElement = document.getElementById('map');
        if (mapElement) {
            initKakaoMap();
        }
    });
} else {
    // 이미 로드된 경우 즉시 실행
    const mapElement = document.getElementById('map');
    if (mapElement) {
        initKakaoMap();
    }
}

// 전역 함수로 노출 (필요시 다른 스크립트에서 사용 가능)
window.initKakaoMap = initKakaoMap;
